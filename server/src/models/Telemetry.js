const mongoose = require('mongoose');

const metadataSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true },
    unit: String,
    type: String,
  },
  { _id: false }
);

const telemetrySchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true, default: Date.now },
    metadata: { type: metadataSchema, required: true },
    value: { type: Number, required: true },
    tags: [String],
  },
  {
    timeseries: {
      timeField: 'timestamp',
      metaField: 'metadata',
      granularity: 'seconds',
    },
    collection: 'telemetries',
    autoCreate: false,
  }
);

module.exports = mongoose.model('Telemetry', telemetrySchema);
