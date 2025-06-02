#!/usr/bin/env node

// Load environment variables first
require('dotenv').config();

const express = require('express');
const path = require('path');
const logger = require('./utils/logger');
const config = require('./config');
const addonInterface = require('./addon');        // builder.getInterface()
const { getRouter } = require('stremio-addon-sdk');
const redisClient = require('./cache/redisClient');

async function startServer() {
    logger.info('Starting addon server...');

    // Initialize Redis connection
    await redisClient.connect();
    if (!redisClient.isReady()) {
        logger.warn('Redis connection failed or not ready. Addon will run WITHOUT caching.');
        // process.exit(1); // optional: exit if you consider cache critical
    }

    // Create Express app
    const app = express();

    // Serve any static files you place in ./public
    // (e.g. your configure.html, CSS, images, etc.)
    const distPath = path.join(__dirname, '../frontend/dist');
    app.use('/configure', express.static(distPath));

    // Custom configure route:
    // Renders public/configure.html which should contain
    // your “Install” button/deeplink to manifest.json

    // i wanna redirect / route to /configure route
    app.get('/', (_req, res) => {
        res.redirect('/configure');
    });



    app.get('/configure', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });

    // Mount the Stremio addon (manifest.json, API, etc.)
    // Note: the addonInterface returned by builder.getInterface()
    // is itself an express router under the hood.
    app.use(getRouter(addonInterface));
    logger.info('Addon router mounted.');

    // Start HTTP server
    const port = config.port;
    app.listen(port, '0.0.0.0', () => {
        const url = `http://localhost:${port}`;
        logger.info(`Addon server listening on ${url}`);
        logger.info(`Configure/install via ${url}/configure`);
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
