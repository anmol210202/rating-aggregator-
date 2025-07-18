const redisClient = require('../cache/redisClient');
const config = require('../config');
const logger = require('../utils/logger');
const { getTmdbData } = require('../utils/tmdbService');
const providers = require('../providers');

const CACHE_PREFIX = 'ratings:';
const NO_RATINGS_MARKER = '___NO_RATINGS___';
const activeProviders = [
    providers.imdbProvider,
    providers.tmdbProvider,
    providers.metacriticProvider,
    providers.commonSenseProvider,
    providers.cringeMdbProvider,
    providers.rottentomatoesProvider
];

// TTL strategy based on release date and rating count
function calculateTTL(releaseDate, numRatings) {
    if (!releaseDate) return config.cache.ttlSeconds;

    const now = Date.now();
    const released = new Date(releaseDate).getTime();
    const ageDays = Math.floor((now - released) / (1000 * 60 * 60 * 24));

    let ttl = (() => {
        if (ageDays <= 14) return 1 * 86400;
        if (ageDays <= 30) return 7 * 86400;
        if (ageDays <= 90) return 30 * 86400;
        if (ageDays <= 180) return 60 * 86400;
        if (ageDays <= 365) return 120 * 86400;
        if (ageDays <= 730) return 240 * 86400;
        if (ageDays <= 1460) return 730 * 86400;
        return 1460 * 86400;
    })();

    if (numRatings <= 3) ttl = Math.min(ttl, 3 * 86400);
    return ttl;
}

function processSingleRating(rating) {
    if (!rating?.source || !rating?.value) return null;
    return {
        source: rating.source,
        value: rating.value.toString().trim()
    };
}

function dedupeRatings(results) {
    const all = results
        .filter(Boolean)
        .flatMap(r => Array.isArray(r) ? r : [r])
        .map(processSingleRating)
        .filter(Boolean);

    const map = new Map();
    all.forEach(r => map.set(r.source, r.value));
    return Array.from(map.entries()).map(([source, value]) => ({ source, value }));
}

async function getRatings(type, imdbId) {
    const baseId = imdbId.split(':')[0];
    const cacheKey = `${CACHE_PREFIX}${type}:${baseId}`;

    // === Try Redis Cache ===
    if (redisClient.isReady()) {
        try {
            const cached = await redisClient.getRatingsHashOrMarker(cacheKey);
            if (cached === NO_RATINGS_MARKER) {
                logger.debug(`Negative cache hit for ${baseId}`);
                return null;
            }
            if (cached) {
                logger.debug(`Cache hit for ${baseId}`);
                return cached;
            }
            logger.debug(`Cache miss for ${baseId}`);
        } catch (err) {
            logger.error(`Cache error (${cacheKey}): ${err.message}`);
        }
    }

    logger.info(`Fetching ratings for ${baseId} (${type})`);

    // === Get TMDb metadata ===
    const { tmdbId, name, date } = await getTmdbData(imdbId, type);
    const year = date ? new Date(date).getFullYear().toString() : null;
    const streamInfo = { name, year };

    // === Call all providers in parallel ===
    const results = await Promise.all(
        activeProviders.map(p =>
            p.getRating(type, imdbId, streamInfo, tmdbId).catch(err => {
                logger.error(`Error from ${p.name} for ${imdbId}: ${err.message}`);
                return null;
            })
        )
    );

    logger.debug(`Ratings fetched for ${baseId}:`, results);

    const finalRatings = dedupeRatings(results);
    logger.info(`Resolved ${finalRatings.length} unique ratings for ${baseId}`);

    // === Set Cache ===
    if (redisClient.isReady()) {
        try {
            if (finalRatings.length > 0) {
                const ttl = calculateTTL(date, finalRatings.length);
                const ok = await redisClient.setRatingsHash(cacheKey, finalRatings, ttl);
                ok
                    ? logger.debug(`Cached ${baseId} for ${ttl}s`)
                    : logger.warn(`Failed to cache ratings for ${baseId}`);
            } else {
                const ok = await redisClient.setNegativeMarker(cacheKey, NO_RATINGS_MARKER, config.cache.negativeTtlSeconds);
                ok
                    ? logger.debug(`Negative marker cached for ${baseId}`)
                    : logger.warn(`Failed to cache negative marker for ${baseId}`);
            }
        } catch (err) {
            logger.error(`Cache write error (${cacheKey}): ${err.message}`);
        }
    }

    return finalRatings.length ? finalRatings : null;
}

module.exports = { getRatings };
