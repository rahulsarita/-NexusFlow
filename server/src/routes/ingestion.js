const express = require('express');
const router = express.Router();
const Telemetry = require('../models/Telemetry');
const { pushTelemetry } = require('../services/telemetryStream');
const logger = require('../utils/logger');

/**
 * POST /api/ingest
 * Ingest a single telemetry data point.
 *
 * Body:
 *   deviceId   {string}  required
 *   value      {number}  required
 *   unit       {string}  optional
 *   type       {string}  optional
 *   tags       {string[]} optional
 *   timestamp  {string}  optional ISO-8601; defaults to now
 */
const normalizeTelemetryPoint = (payload) => {
  const { deviceId, value, unit, type, tags, timestamp } = payload || {};

  if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
    throw new Error('deviceId is required and must be a non-empty string');
  }
  if (value === undefined || value === null || typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error('value is required and must be a number');
  }

  return {
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    metadata: {
      deviceId: deviceId.trim(),
      unit: unit || undefined,
      type: type || undefined,
    },
    value,
    tags: Array.isArray(tags) ? tags : [],
  };
};

router.post('/', async (req, res) => {
  try {
    const doc = await Telemetry.create(normalizeTelemetryPoint(req.body));

    // Push into the reactive stream so active pipelines can process it
    pushTelemetry(doc.toObject());

    return res.status(201).json({ success: true, id: doc._id });
  } catch (err) {
    logger.error(`[ingestion] POST / error: ${err.message}`);
    if (err.message && err.message.includes('deviceId') || err.message.includes('value')) {
      return res.status(400).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/batch', async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    if (payload.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one telemetry point is required' });
    }

    const docs = await Telemetry.insertMany(payload.map(normalizeTelemetryPoint));
    for (const doc of docs) {
      pushTelemetry(doc.toObject());
    }

    return res.status(201).json({
      success: true,
      count: docs.length,
      ids: docs.map((doc) => doc._id),
    });
  } catch (err) {
    logger.error(`[ingestion] POST /batch error: ${err.message}`);
    if (err.message && (err.message.includes('deviceId') || err.message.includes('value'))) {
      return res.status(400).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
