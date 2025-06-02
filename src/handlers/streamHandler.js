const ratingService = require('../services/ratingService');
const logger = require('../utils/logger');
const config = require('../config');

// Helper function to get emoji for each rating source for display
function getEmojiForSource(source) {
    const emojiMap = {
        'TMDb': '🎥',
        'IMDb': '⭐',
        'MC': 'Ⓜ️', // Metacritic Critic Score
        'MC Users': '👤', // Metacritic User Score
        'RT': '🍅', // Placeholder
        'RT Users': '👥', // Placeholder
        'Letterboxd': '📝', // Placeholder
        'Common Sense': '👶',
        'CringeMDB': '⚠️', // Warning sign for CringeMDB
        'Certification': '✅', // For CringeMDB verification only
    };
    return emojiMap[source] || '📊'; // Default emoji
}


async function streamHandler({ type, id }) {
    logger.info(`Received stream request for: type=${type}, id=${id}`);

    // Basic validation
    if (!id || !id.startsWith('tt')) {
        logger.warn(`Unsupported/Invalid ID format received: ${id}`);
        return Promise.resolve({ streams: [] });
    }

    try {
        const ratings = await ratingService.getRatings(type, id);

        if (!ratings || ratings.length === 0) {
            logger.info(`No ratings found by service for: ${id}`);
            // Return an empty stream or a specific "No Ratings Found" stream
            return Promise.resolve({ streams: [] });
            /*
            return Promise.resolve({ streams: [{
                 name: "📊 Ratings",
                 description: "No ratings found for this item.",
                 type: "other",
                 url: "#", // Placeholder URL
                 behaviorHints: { notWebReady: true }
            }] });
            */
        }

        // Format ratings for display in the stream description
        const formattedLines = [
            "───────────────", // Separator
        ];

        // Prioritize Common Sense Media Age Rating
        const commonSense = ratings.find(r => r.source === 'Common Sense');
        if (commonSense) {
            formattedLines.push(`${getEmojiForSource(commonSense.source)} ${commonSense.value}`);
        }

        // Add standard ratings (IMDb, TMDb, Metacritic)
        ratings
            .filter(r => ['IMDb', 'TMDb', 'MC', 'MC Users', 'RT', 'RT Users'].includes(r.source))
            .sort((a, b) => { // Sort for consistent order
                const order = ['IMDb', 'TMDb', 'MC', 'MC Users', 'RT', 'RT Users'];
                return order.indexOf(a.source) - order.indexOf(b.source);
            })
            .forEach(rating => {
                const emoji = getEmojiForSource(rating.source);
                // Pad source name for alignment (adjust padding as needed)
                formattedLines.push(
                    `${emoji} ${rating.source.padEnd(9)}: ${rating.value}`
                );
            });

        // Add CringeMDB Warnings/Certification at the end
        const cringeMdb = ratings.find(r => r.source === 'CringeMDB' || r.source === 'Certification');
        if (cringeMdb) {
            // Split multi-line value from CringeMDB
            cringeMdb.value.split('\n').forEach(line => {
                if (line.trim()) formattedLines.push(`${line.trim()}`);
            });
        }

        formattedLines.push("───────────────"); // Final Separator

        // Create the stream object for Stremio
        const stream = {
            name: "📊 Ratings Aggregator ", // Main title for the stream item
            description: formattedLines.join('\n'),
            url: `${config.sources.imdbBaseUrl}/title/${id.split(':')[0]}/`, // FIX for WebOS - Dummy URL, won't be used
            // Use IMDb URL as a fallback/reference if no specific rating URL is best
            externalUrl: `${config.sources.imdbBaseUrl}/title/${id.split(':')[0]}/`,
            behaviorHints: {
                notWebReady: true, // Important: Indicates this isn't a playable video stream
                bingeGroup: `ratings-${id}` // Group rating streams together for an item
            },
            type: "other", // Custom stream type
        };

        logger.info(`Returning 1 rating stream for ${id}`);
        return Promise.resolve({ streams: [stream] });

    } catch (error) {
        // Catch errors from the ratingService call itself
        logger.error(`Error in streamHandler processing ${id}: ${error.message}`, error);
        return Promise.resolve({ streams: [] }); // Return empty on error
    }
}

module.exports = streamHandler;