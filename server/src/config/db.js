const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  logger.info('MongoDB connected');

  // Ensure Time-Series collection exists
  const db = mongoose.connection.db;
  try {
    await db.createCollection('telemetries', {
      timeseries: {
        timeField: 'timestamp',
        metaField: 'metadata',
        granularity: 'seconds',
      },
    });
    logger.info('Time-Series collection created');
  } catch (e) {
    if (e.codeName !== 'NamespaceExists') throw e;
    logger.info('Time-Series collection already exists');
  }
};

module.exports = { connectDB };
