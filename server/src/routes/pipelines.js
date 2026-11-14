const express = require('express');
const router = express.Router();
const Pipeline = require('../models/Pipeline');
const { compilePipeline, deactivatePipeline, activeSubscriptions } = require('../services/streamCompiler');
const logger = require('../utils/logger');

/**
 * GET /api/pipelines
 * List all pipelines.
 */
router.get('/', async (req, res) => {
  try {
    const pipelines = await Pipeline.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: pipelines });
  } catch (err) {
    logger.error(`[pipelines] GET / error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/pipelines/:id
 * Get a single pipeline by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) return res.status(404).json({ success: false, error: 'Pipeline not found' });
    return res.json({ success: true, data: pipeline });
  } catch (err) {
    logger.error(`[pipelines] GET /:id error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/pipelines
 * Create a new pipeline.
 *
 * Body: { name, description?, nodes?, edges? }
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, nodes, edges } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'name is required' });
    }
    const pipeline = await Pipeline.create({
      name: name.trim(),
      description: description || '',
      nodes: nodes || [],
      edges: edges || [],
      isActive: false,
    });
    return res.status(201).json({ success: true, data: pipeline });
  } catch (err) {
    logger.error(`[pipelines] POST / error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * PUT /api/pipelines/:id
 * Update a pipeline's metadata / graph.  If the pipeline is currently active,
 * recompile it immediately with the new graph.
 *
 * Body: { name?, description?, nodes?, edges? }
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, description, nodes, edges } = req.body;
    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) return res.status(404).json({ success: false, error: 'Pipeline not found' });

    if (name !== undefined) pipeline.name = name.trim();
    if (description !== undefined) pipeline.description = description;
    if (nodes !== undefined) pipeline.nodes = nodes;
    if (edges !== undefined) pipeline.edges = edges;

    await pipeline.save();

    // Recompile if currently active
    if (pipeline.isActive) {
      compilePipeline(pipeline._id.toString(), { nodes: pipeline.nodes, edges: pipeline.edges });
    }

    return res.json({ success: true, data: pipeline });
  } catch (err) {
    logger.error(`[pipelines] PUT /:id error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/pipelines/:id
 * Delete a pipeline (deactivates it first if running).
 */
router.delete('/:id', async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) return res.status(404).json({ success: false, error: 'Pipeline not found' });

    if (pipeline.isActive) {
      deactivatePipeline(pipeline._id.toString());
    }

    await pipeline.deleteOne();
    return res.json({ success: true, message: 'Pipeline deleted' });
  } catch (err) {
    logger.error(`[pipelines] DELETE /:id error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/pipelines/:id/activate
 * Compile and activate a pipeline's stream processing.
 */
router.post('/:id/activate', async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) return res.status(404).json({ success: false, error: 'Pipeline not found' });
    if (!pipeline.nodes || pipeline.nodes.length === 0) {
      return res.status(400).json({ success: false, error: 'Pipeline has no nodes to compile' });
    }

    compilePipeline(pipeline._id.toString(), { nodes: pipeline.nodes, edges: pipeline.edges });
    pipeline.isActive = true;
    await pipeline.save();

    return res.json({ success: true, message: 'Pipeline activated', data: pipeline });
  } catch (err) {
    logger.error(`[pipelines] POST /:id/activate error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/pipelines/:id/deactivate
 * Stop a pipeline's stream processing.
 */
router.post('/:id/deactivate', async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) return res.status(404).json({ success: false, error: 'Pipeline not found' });

    deactivatePipeline(pipeline._id.toString());
    pipeline.isActive = false;
    await pipeline.save();

    return res.json({ success: true, message: 'Pipeline deactivated', data: pipeline });
  } catch (err) {
    logger.error(`[pipelines] POST /:id/deactivate error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/pipelines/status/active
 * List which pipelines currently have active subscriptions.
 */
router.get('/status/active', async (req, res) => {
  try {
    const activeIds = [...activeSubscriptions.keys()];
    return res.json({ success: true, activeCount: activeIds.length, activePipelineIds: activeIds });
  } catch (err) {
    logger.error(`[pipelines] GET /status/active error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
