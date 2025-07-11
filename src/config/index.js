// config/index.js
require('dotenv').config();

const config = {
    port: process.env.PORT || 61262,
    logLevel: process.env.LOG_LEVEL || 'info',
    http: { // Added HTTP config section
        requestTimeoutMs: parseInt(process.env.HTTP_TIMEOUT_MS || '12000', 10), // 12 seconds default
    },
    tmdb: {
        apiKey: process.env.TMDB_API_KEY,
        apiUrl: 'https://api.themoviedb.org/3',
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    cache: {
        // Default TTL: 3 days in seconds (adjust as needed)
        ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '259200', 10), // 3 * 24 * 60 * 60
        // Keep shorter negative TTL from previous step
        negativeTtlSeconds: parseInt(process.env.NEGATIVE_CACHE_TTL_SECONDS || '21600', 10), // 6 hours
    },
    sources: {
        imdbBaseUrl: process.env.IMDB_BASE_URL || 'https://www.imdb.com',
        metacriticBaseUrl: process.env.METACRITIC_BASE_URL || 'https://www.metacritic.com',
        commonSenseBaseUrl: process.env.COMMONSENSE_BASE_URL || 'https://www.commonsensemedia.org',
        rottentomatoesBaseUrl: process.env.ROTTENTOMATOES_BASE_URL || 'https://www.rottentomatoes.com',
        cringeMdbBaseUrl: process.env.CRINGEMDB_BASE_URL || 'https://cringemdb.com',
    },
    userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36', // Update UA periodically
    addon: {
        id: 'community.ratings.aggregator',
        version: '0.0.0',
        name: '❌ Please Migrated to Elfhosted version',
        description: 'Versel instance is expired. Please migrate to the Elfhosted version at https://rating-aggregator.elfhosted.com/configure/',
        logo: 'https://emojicdn.elk.sh/❌',
        catalogs: [],
        resources: ['stream'],
        types: ['movie', 'series'],
        idPrefixes: ['tt'],
        behaviorHints: {
            configurable: true,
            configurationRequired: false,
        }
    }
};

// --- Validations ---
let hasFatalError = false;
let hasWarning = false;

// Essential
if (!config.tmdb.apiKey) {
    console.error('FATAL ERROR: TMDB_API_KEY is not set.');
    hasFatalError = true;
}
if (!config.redis.url || config.redis.url === 'redis://localhost:6379') {
    // Only warn if it's missing or default, allow explicit localhost
    if (!process.env.REDIS_URL) {
        console.warn('WARNING: REDIS_URL is not set. Caching will use default redis://localhost:6379.');
        hasWarning = true;
    }
}

// Base URLs for scrapers
if (!config.sources.imdbBaseUrl) {
    console.warn('WARNING: IMDB_BASE_URL is not set. IMDb provider may fail.');
    hasWarning = true;
}
if (!config.sources.metacriticBaseUrl) {
    console.warn('WARNING: METACRITIC_BASE_URL is not set. Metacritic provider may fail.');
    hasWarning = true;
}
if (!config.sources.commonSenseBaseUrl) {
    console.warn('WARNING: COMMONSENSE_BASE_URL is not set. Common Sense provider may fail.');
    hasWarning = true;
}
if (!config.sources.cringeMdbBaseUrl) {
    console.warn('WARNING: CRINGEMDB_BASE_URL is not set. CringeMDB provider may fail.');
    hasWarning = true;
}

// Log summary
if (hasFatalError) {
    console.error("Critical configuration missing. Please check environment variables. Exiting.");
    process.exit(1);
} else if (hasWarning) {
    console.warn("One or more configuration warnings detected. Service might not function fully.");
}

module.exports = config;