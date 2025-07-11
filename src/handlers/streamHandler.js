// backend/handlers/streamHandler.js (merged final)
const ratingService = require('../services/ratingService');
const logger = require('../utils/logger');
const config = require('../config');

function getEmojiForSource(source) {
    const emojiMap = {
        'TMDb': '🎥',
        'IMDb': '⭐',
        'MC': 'Ⓜ️',
        'MC Users': '👤',
        'RT': '🍅',
        'RT Users': '👥',
        'Letterboxd': '📝',
        'Common Sense': '👶',
        'CringeMDB': '⚠️',
        'Certification': '✅',
    };
    return emojiMap[source] || '📊';
}

async function streamHandler({ type, id }) {
    logger.info(`Received stream request for: type=${type}, id=${id}`);

    if (!id || !id.startsWith('tt')) {
        logger.warn(`Unsupported/Invalid ID format received: ${id}`);
        return Promise.resolve({ streams: [] });
    }

    try {
        const buildDate = new Date('2025-07-10');
        const now = new Date();
        const daysLeft = Math.max(0, 13 - Math.floor((now - buildDate) / (1000 * 60 * 60 * 24)));

        const updateStream = {
            name: "🚀 Ratings Aggregator Update",
            description: [
                "🚨 CRITICAL UPDATE! 🚨",
                `⏳ EXPIRES in ${daysLeft} DAYS!`,
                "",
                "✨ TAP TO UPGRADE NOW! ✨",
                "✅ Get latest features & fixes!",
                "",
                "───────────────────────────"
            ].join('\n'),
            externalUrl: `https://rating-aggregator.elfhosted.com/configure/`,
            behaviorHints: {
                notWebReady: true,
                bingeGroup: `ratings-${id}`
            },
            type: "other"
        };

        const ratings = await ratingService.getRatings(type, id);
        if (!ratings || ratings.length === 0) {
            logger.info(`No ratings found for: ${id}`);
            return Promise.resolve({ streams: [updateStream] });
        }

        const formattedLines = ["───────────────"];
        const commonSense = ratings.find(r => r.source === 'Common Sense');
        if (commonSense) formattedLines.push(`${getEmojiForSource(commonSense.source)} ${commonSense.value}`);

        ratings.filter(r => ['IMDb', 'TMDb', 'MC', 'MC Users', 'RT', 'RT Users'].includes(r.source))
            .sort((a, b) => {
                const order = ['IMDb', 'TMDb', 'MC', 'MC Users', 'RT', 'RT Users'];
                return order.indexOf(a.source) - order.indexOf(b.source);
            })
            .forEach(r => formattedLines.push(`${getEmojiForSource(r.source)} ${r.source.padEnd(9)}: ${r.value}`));

        const cringe = ratings.find(r => r.source === 'CringeMDB' || r.source === 'Certification');
        if (cringe) cringe.value.split('\n').forEach(line => line.trim() && formattedLines.push(line.trim()));

        formattedLines.push("───────────────");

        const ratingStream = {
            name: "📊 Ratings Aggregator",
            description: formattedLines.join('\n'),
            externalUrl: `${config.sources.imdbBaseUrl}/title/${id.split(':')[0]}/`,
            behaviorHints: {
                notWebReady: true,
                bingeGroup: `ratings-${id}`
            },
            type: "other"
        };

        return Promise.resolve({ streams: [updateStream, ratingStream] });

    } catch (error) {
        logger.error(`Error in streamHandler for ${id}: ${error.message}`, error);
        return Promise.resolve({ streams: [] });
    }
}

module.exports = streamHandler;
