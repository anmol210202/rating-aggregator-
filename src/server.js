require('dotenv').config();

const express = require('express');
const path = require('path');
const logger = require('./utils/logger');
const config = require('./config');
const manifest = require('./config/manifest');
const streamHandler = require('./handlers/streamHandler');
const redisClient = require('./cache/redisClient');

async function startServer() {
    logger.info('Starting addon server...');

    try {
        if (!redisClient.isReady()) await redisClient.connect();
        logger.info('Redis connected successfully.');
    } catch (err) {
        logger.warn('Redis unavailable:', err.message);
    }

    const app = express();
    const distPath = path.join(__dirname, '../frontend/dist');

    // Frontend
    app.use('/configure', express.static(distPath));
    app.get('/', (_req, res) => res.redirect('/configure'));
    app.get('/configure', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));

    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });

    // Healthcheck
    app.get('/health', (_req, res) => {
        res.json({
            status: 'ok',
            redis: redisClient.isReady(),
            uptime: process.uptime(),
        });
    });

    // Stremio Addon Routes (manual)
    app.get('/:userConfig/manifest.json', (req, res) => {
        const userConfig = req.params.userConfig;

        res.setHeader('Content-Type', 'application/json');
        res.json(manifest);
    });

    app.get('/:userConfig/stream/:type/:id.json', async (req, res) => {
        try {
            const {userConfig, type, id } = req.params;
            logger.info(`Stream request: userConfig=${userConfig}, type=${type}, id=${id}`);
            const out = await streamHandler({ userConfig, type, id });
            res.json(out);
        } catch (err) {
            logger.error('Stream error:', err.message);
            res.status(500).json({ streams: [] });
        }
    });

    // Default manifest (no userConfig)
    app.get('/manifest.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.json(manifest);
    });

    // Default stream route (no userConfig)
    app.get('/stream/:type/:id.json', async (req, res) => {
        try {
            const { type, id } = req.params;
            const out = await streamHandler({ type, id });
            res.json(out);
        } catch (err) {
            logger.error('Stream error:', err.message);
            res.status(500).json({ streams: [] });
        }
    });

    // Start
    const port = config.port;
    app.listen(port, () => {
        const url = `http://localhost:${port}`;
        logger.info(`Server listening at ${url}`);
        logger.info(`Manifest: ${url}/manifest.json`);
    });
}

// Graceful shutdown
async function shutdown(signal) {
    logger.warn(`Received ${signal}. Shutting down...`);
    await redisClient.disconnect();
    logger.info('Shutdown complete.');
    process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
