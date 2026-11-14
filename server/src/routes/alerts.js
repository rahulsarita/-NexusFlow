const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const logger = require('../utils/logger');

/**
 * GET /api/alerts
 * List alerts with optional filters.
 *
 * Query params:
 *   pipelineId  {string}  ObjectId
 *   severity    {string}  info | warning | critical
 *   limit       {number}  default 50, max 500
 */
router.get('/', async (req, res) => {
  try {
    const { pipelineId, severity } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);

    const filter = {};
    if (pipelineId) filter.pipelineId = pipelineId;
    if (severity)   filter.severity   = severity;

    const alerts = await Alert.find(filter)
      .sort({ triggeredAt: -1 })
      .limit(limit)
      .lean();

    return res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    logger.error(`[alerts] GET / error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/alerts/:id
 * Delete a single alert by ID.
 */
router.delete('/', async (_req, res) => {
  try {
    const result = await Alert.deleteMany({});
    return res.json({ success: true, message: 'All alerts cleared', deletedCount: result.deletedCount || 0 });
  } catch (err) {
    logger.error(`[alerts] DELETE / error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
    return res.json({ success: true, message: 'Alert deleted' });
  } catch (err) {
    logger.error(`[alerts] DELETE /:id error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
