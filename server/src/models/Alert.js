const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  pipelineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline' },
  deviceId: String,
  message: String,
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'warning',
  },
  value: Number,
  threshold: Number,
  triggeredAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Alert', alertSchema);
