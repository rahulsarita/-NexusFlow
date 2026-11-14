const mongoose = require('mongoose');

const pipelineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    nodes: [mongoose.Schema.Types.Mixed],
    edges: [mongoose.Schema.Types.Mixed],
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pipeline', pipelineSchema);
