const axios = require('axios');
const config = require('../config');
const logger = require('./logger');

/**
 * Fetches TMDB ID, title/name, and year for a given IMDb ID and content type
 * using only the /find endpoint.
 *
 * @param {string} imdbId   - IMDb ID, possibly with :S:E suffix (e.g. "tt1234567:1:1")
 * @param {'movie'|'series'} type
 * @returns {Promise<{ tmdbId: number|null, name: string|null, date: string|null }>}
 */
async function getTmdbData(imdbId, type) {
    if (!config.tmdb.apiKey) {
        logger.error('TMDB API key not configured.');
        throw new Error('TMDB API key not configured');
    }

    // strip off any season/episode suffix
    const baseImdb = imdbId.split(':')[0];
    const url = `${config.tmdb.apiUrl}/find/${baseImdb}` +
        `?api_key=${config.tmdb.apiKey}&external_source=imdb_id`;

    try {
        const { data } = await axios.get(url, { timeout: 5000 });
        const results = type === 'series' ? data.tv_results : data.movie_results;

        if (Array.isArray(results) && results.length > 0) {
            const item = results[0];
            const tmdbId = item.id;
            // movies use .title/.release_date, TV uses .name/.first_air_date
            const name = item.title || item.name || null;
            const date = item.release_date || item.first_air_date || null;
            logger.debug(
                `TMDB Data: IMDb=${baseImdb}, Type=${type} → ID=${tmdbId}, Name="${name}", Date="${date}"`
            );

            return { tmdbId, name, date };
        }

        logger.warn(`No TMDB results for IMDb=${baseImdb} (type=${type}).`);
        return { tmdbId: null, name: null, date: null };

    } catch (err) {
        if (err.response?.status === 404) {
            logger.warn(`TMDB 404 for IMDb=${baseImdb}.`);
            return { tmdbId: null, name: null, date: null };
        }

        logger.error(
            `TMDB API error for IMDb=${baseImdb}: ${err.message}`,
            { url }
        );
        return { tmdbId: null, name: null, date: null };
    }
}

/**
 * Get youtube trailer id from TMDB api using IMDB id
 * @param {*} imdbId 
 * @returns 
 */

async function getTmdbTrailer(type, imdbId) {
    const baseImdb = imdbId.split(':')[0];
    try {
        // Get the TMDb ID from IMDb ID
        const tmdbResp = await axios.get(`${config.tmdb.apiUrl}/find/${baseImdb}`, {
            params: {
                api_key: config.tmdb.apiKey,
                external_source: 'imdb_id',
                timeout: 5000
            }
        });

        const tmdbId = type === 'series' ? tmdbResp.data.tv_results?.[0]?.id : tmdbResp.data.movie_results?.[0]?.id;
        logger.info(`Trying to fetch YouTube trailer for TMDB id ${tmdbId}`);
        if (!tmdbId) return null;

        const endpoint = type === 'series' ? 'tv' : 'movie';
        // Get videos for the movie
        const videosResp = await axios.get(`${config.tmdb.apiUrl}/${endpoint}/${tmdbId}/videos`, {
            params: { api_key: config.tmdb.apiKey }, timeout: 5000
        });

        const videos = videosResp.data.results
            .filter(function (video) {
                return video.site === "YouTube" && video.official &&
                    (video.type === "Trailer" || video.type === "Teaser");
            });

        // Sort with priority:
        // 1. Type "Trailer" over "Teaser"
        // 2. Name contains "trailer" (case-insensitive)
        // 3. Larger size first

        videos.sort(function (a, b) {
            function score(v) {
                return [
                    v.type === "Trailer" ? 1 : 0,
                    /trailer/i.test(v.name) ? 1 : 0,
                    v.size || 0
                ];
            }

            const sa = score(a);
            const sb = score(b);

            for (let i = 0; i < sa.length; i++) {
                if (sb[i] !== sa[i]) {
                    return sb[i] - sa[i]; // Descending
                }
            }

            return 0;
        });

        const selected = videos[0];

        if (selected) {
            logger.info("Fetched YouTube trailer with key " + selected.key);
            return selected.key;
        }

        return null;
    } catch (err) {
        logger.error('TMDb trailer fetch error:', err.message);
        return null;
    }
}

module.exports = { getTmdbData, getTmdbTrailer };
