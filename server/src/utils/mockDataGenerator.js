/**
 * mockDataGenerator.js
 *
 * Simulates three IoT devices by producing realistic random-walk readings
 * and POSTing them to the local ingestion endpoint at a configurable rate.
 *
 * Devices:
 *   turbine-1    temperature   75°C   ±3   range 60-100
 *   pump-2       pressure       5 bar ±0.5 range 2-8  (5% chance of +3 spike)
 *   compressor-3 vibration     0.8 mm/s ±0.2 range 0.1-2.5
 */

const axios = require('axios');
const logger = require('./logger');

const INGEST_URL = 'http://localhost:5000/api/ingest';

const deviceState = {
  'turbine-1': {
    value: 75,
    unit: '°C',
    type: 'temperature',
    walkMax: 3,
    min: 60,
    max: 100,
    spikeChance: 0,
    spikeAmount: 0,
  },
  'pump-2': {
    value: 5,
    unit: 'bar',
    type: 'pressure',
    walkMax: 0.5,
    min: 2,
    max: 8,
    spikeChance: 0.05,
    spikeAmount: 3,
  },
  'compressor-3': {
    value: 0.8,
    unit: 'mm/s',
    type: 'vibration',
    walkMax: 0.2,
    min: 0.1,
    max: 2.5,
    spikeChance: 0,
    spikeAmount: 0,
  },
};

/**
 * Clamp a value within [min, max].
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate the next reading for a device using a random walk.
 * @param {string} deviceId
 * @returns {number} new reading value
 */
function nextValue(deviceId) {
  const state = deviceState[deviceId];

  // Random walk: ±walkMax
  let delta = (Math.random() * 2 - 1) * state.walkMax;

  // Optional spike
  if (state.spikeChance > 0 && Math.random() < state.spikeChance) {
    delta += state.spikeAmount;
  }

  state.value = clamp(parseFloat((state.value + delta).toFixed(4)), state.min, state.max);
  return state.value;
}

let generatorInterval = null;

/**
 * Start the mock data generator.
 * @param {number} intervalMs  Interval in milliseconds between ticks (default 500).
 */
function startMockGenerator(intervalMs = 500) {
  if (generatorInterval) {
    logger.warn('[mockDataGenerator] Already running — ignoring duplicate start');
    return;
  }

  logger.info(`[mockDataGenerator] Starting — posting every ${intervalMs}ms to ${INGEST_URL}`);

  generatorInterval = setInterval(async () => {
    for (const deviceId of Object.keys(deviceState)) {
      const state = deviceState[deviceId];
      const value = nextValue(deviceId);

      try {
        await axios.post(
          INGEST_URL,
          {
            deviceId,
            value,
            unit: state.unit,
            type: state.type,
            tags: ['mock', state.type],
          },
          { timeout: 3000 }
        );
        logger.debug(`[mockDataGenerator] ${deviceId} → ${value} ${state.unit}`);
      } catch (err) {
        logger.warn(`[mockDataGenerator] Failed to ingest ${deviceId}: ${err.message}`);
      }
    }
  }, intervalMs);
}

/**
 * Stop the mock data generator.
 */
function stopMockGenerator() {
  if (generatorInterval) {
    clearInterval(generatorInterval);
    generatorInterval = null;
    logger.info('[mockDataGenerator] Stopped');
  }
}

module.exports = { startMockGenerator, stopMockGenerator };
