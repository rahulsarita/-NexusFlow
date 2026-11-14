const express = require('express');
const router = express.Router();
const Telemetry = require('../models/Telemetry');
const logger = require('../utils/logger');

/**
 * GET /api/telemetry
 * Query telemetry data with optional filters.
 *
 * Query params:
 *   deviceId  {string}  filter by device
 *   from      {string}  ISO-8601 start (inclusive)
 *   to        {string}  ISO-8601 end   (inclusive)
 *   limit     {number}  max docs, default 100, max 1000
 */
router.get('/', async (req, res) => {
  try {
    const { deviceId, from, to } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 1000);

    const match = {};
    if (deviceId) match['metadata.deviceId'] = deviceId;
    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to)   match.timestamp.$lte = new Date(to);
    }

    const docs = await Telemetry.find(match).sort({ timestamp: -1 }).limit(limit).lean();
    return res.json({ success: true, count: docs.length, data: docs });
  } catch (err) {
    logger.error(`[telemetry] GET / error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/telemetry/devices
 * Return all known device IDs (with optional time window filter).
 */
router.get('/devices', async (req, res) => {
  try {
    const { from, to, deviceId } = req.query;
    const match = {};
    if (deviceId) match['metadata.deviceId'] = deviceId;
    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to) match.timestamp.$lte = new Date(to);
    }

    const devices = await Telemetry.distinct('metadata.deviceId', match);
    return res.json({ success: true, count: devices.length, data: devices });
  } catch (err) {
    logger.error(`[telemetry] GET /devices error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/telemetry/latest
 * Return the most recent data point for each known device.
 */
router.get('/latest', async (req, res) => {
  try {
    const docs = await Telemetry.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$metadata.deviceId',
          latest: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$latest' } },
      { $sort: { 'metadata.deviceId': 1 } },
    ]);
    return res.json({ success: true, count: docs.length, data: docs });
  } catch (err) {
    logger.error(`[telemetry] GET /latest error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/telemetry/stats
 * Aggregate min / max / avg per device for a requested time range.
 */
router.get('/stats', async (req, res) => {
  try {
    const { deviceId, from, to } = req.query;
    const start = from ? new Date(from) : new Date(Date.now() - 60 * 60 * 1000);
    const end = to ? new Date(to) : null;
    const match = { timestamp: { $gte: start } };

    if (deviceId) match['metadata.deviceId'] = deviceId;
    if (end) match.timestamp.$lte = end;

    const stats = await Telemetry.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$metadata.deviceId',
          min: { $min: '$value' },
          max: { $max: '$value' },
          avg: { $avg: '$value' },
          count: { $sum: 1 },
          unit: { $first: '$metadata.unit' },
          type: { $first: '$metadata.type' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.json({ success: true, since: start, until: end || null, count: stats.length, data: stats });
  } catch (err) {
    logger.error(`[telemetry] GET /stats error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
