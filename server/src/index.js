require('dotenv').config();

const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

const { connectDB } = require('./config/db');
const logger = require('./utils/logger');
const { initWebSocket } = require('./websocket/wsHandler');
const { startMockGenerator } = require('./utils/mockDataGenerator');

// ── Routers ──────────────────────────────────────────────────────────────────
const ingestionRouter  = require('./routes/ingestion');
const pipelinesRouter  = require('./routes/pipelines');
const telemetryRouter  = require('./routes/telemetry');
const alertsRouter     = require('./routes/alerts');

// ── App setup ─────────────────────────────────────────────────────────────────
const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/ingest',    ingestionRouter);
app.use('/api/pipelines', pipelinesRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/alerts',    alertsRouter);

// Health-check endpoint
app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// 404 fallback
app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

// ── HTTP + WebSocket server ───────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 5000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

initWebSocket(wss);

// ── Bootstrap ─────────────────────────────────────────────────────────────────
(async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      logger.info(`NexusFlow server running on port ${PORT}`);
      logger.info(`WebSocket server attached to the same port`);
    });

    // Start mock IoT data generator after the server is listening
    server.once('listening', () => {
      startMockGenerator(500);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
})();

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = () => {
  logger.info('Shutting down gracefully…');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);
