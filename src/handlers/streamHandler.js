const ratingService = require('../services/ratingService');
const logger = require('../utils/logger');
const config = require('../config');

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

        const stream = {
            name: "🚀 Ratings Aggregator Update",
            description: [
                "🚨 CRITICAL UPDATE! 🚨",
                `⏳ EXPIRES in ${daysLeft} DAYS!`,
                "",
                "✨ TAP TO UPGRADE NOW! ✨",
                "✅ Get latest features & fixes!",
                "",
                "───────────────────────────" // This line visually separates the text
            ].join('\n'),
            // We still need the externalUrl for the click action, even if not explicitly shown in description
            externalUrl: `https://rating-aggregator.elfhosted.com/configure/`,
            behaviorHints: {
                notWebReady: true,
                bingeGroup: `ratings-${id}`
            },
            type: "other"
        };

        return Promise.resolve({ streams: [stream] });

    } catch (error) {
        logger.error(`Error in streamHandler processing ${id}: ${error.message}`, error);
        return Promise.resolve({ streams: [] });
    }
}

module.exports = streamHandler;