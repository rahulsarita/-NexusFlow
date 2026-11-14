const Alert = require('../models/Alert');
const { broadcast } = require('../websocket/wsHandler');
const logger = require('../utils/logger');
const axios = require('axios');

/**
 * Persist an alert to MongoDB and broadcast it to all WebSocket clients.
 *
 * @param {object} opts
 * @param {string}  opts.pipelineId
 * @param {string}  opts.deviceId
 * @param {string}  opts.message
 * @param {string}  [opts.severity='warning']
 * @param {number}  [opts.value]
 * @param {number}  [opts.threshold]
 */
const fireAlert = async ({ pipelineId, deviceId, message, severity = 'warning', value, threshold }) => {
  try {
    const alert = await Alert.create({
      pipelineId,
      deviceId,
      message,
      severity,
      value,
      threshold,
      triggeredAt: new Date(),
    });

    broadcast({ type: 'ALERT', payload: alert.toObject() });

    logger.info(`[ALERT] ${severity.toUpperCase()} — device=${deviceId} val=${value} thr=${threshold} — ${message}`);
  } catch (err) {
    logger.error(`fireAlert error: ${err.message}`);
  }
};

/**
 * Simulate sending an SMS (console only — no real gateway required).
 * @param {string} message
 */
const fireMockSMS = (message) => {
  logger.info(`[MOCK SMS] ${message}`);
};

/**
 * Fire an HTTP POST to an external webhook URL.
 * @param {string} url
 * @param {object} payload
 */
const fireWebhook = async (url, payload) => {
  try {
    await axios.post(url, payload, { timeout: 5000 });
    logger.info(`[WEBHOOK] POST ${url} succeeded`);
  } catch (err) {
    logger.error(`[WEBHOOK] POST ${url} failed: ${err.message}`);
  }
};

module.exports = { fireAlert, fireMockSMS, fireWebhook };
