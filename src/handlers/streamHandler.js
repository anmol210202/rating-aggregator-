const ratingService = require('../services/ratingService');
const logger = require('../utils/logger');
const config = require('../config');
const { getEmojiForSource } = require('../utils/emojiMapper');

const sourceMap = {
    age: 'Common Sense',
    imdb: 'IMDb',
    tmdb: 'TMDb',
    metacritic: 'MC',
    mcUsers: 'MC Users',
    rt: 'RT',
    rtUsers: 'RT Users',
    cringemdb: 'CringeMDB',
};


function parseUserConfig(userConfigStr = '') {
    const match = userConfigStr.match(/^ratings=(.+)$/);
    if (!match) return null;

    const idList = match[1].split(',');
    return idList;
}


// Format stream description
function formatRatingsCard(userOrderIds, ratings) {
    const lines = ["───────────────"];

    const defaultOrder = [
        'Common Sense',
        'IMDb',
        'TMDb',
        'MC',
        'MC Users',
        'RT',
        'RT Users',
        'CringeMDB'
    ];

    const order = userOrderIds
        ? userOrderIds.map(id => sourceMap[id]).filter(Boolean)
        : defaultOrder;

    for (const source of order) {
        const match = ratings.find(r => r.source === source);
        if (!match) continue;

        if (source === 'Common Sense') {
            lines.push(`${getEmojiForSource(source)} ${match.value}`);
        } else if (source === 'CringeMDB' || source === 'Certification') {
            match.value.split('\n').forEach(line => {
                if (line.trim()) lines.push(line.trim());
            });
        } else {
            lines.push(`${getEmojiForSource(source)} ${source.padEnd(9)}: ${match.value}`);
        }
    }

    lines.push("───────────────");
    return lines.join('\n');
}


async function streamHandler({userConfig, type, id }) {

    userOrderIds = parseUserConfig(userConfig);
    logger.info(`Received stream request for: type=${type}, id=${id}`);

    if (!id || !id.startsWith('tt')) {
        logger.warn(`Invalid or unsupported ID format: ${id}`);
        return { streams: [] };
    }

    try {
        const ratings = await ratingService.getRatings(type, id);

        if (!ratings?.length) {
            logger.info(`No ratings found for: ${id}`);
            return { streams: [] };
        }

        const stream = {
            name: "🎯 Ratings Aggregator",
            description: formatRatingsCard(userOrderIds, ratings),
            externalUrl: `${config.sources.imdbBaseUrl}/title/${id.split(':')[0]}/`,
            behaviorHints: {
                notWebReady: true,
                // bingeGroup: `ratings-${id}`
            },
            // type: "other"
        };

        logger.info(`Returning 1 rating stream for ${id}`);
        return { streams: [stream] };

    } catch (error) {
        logger.error(`Error in streamHandler for ${id}: ${error.message}`, error);
        return { streams: [] };
    }
}

module.exports = streamHandler;
