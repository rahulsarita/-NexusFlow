/**
 * streamCompiler.js
 *
 * Compiles a React-Flow pipeline graph (nodes + edges) into a live RxJS
 * subscription chain.  Each node type maps to one or more RxJS operators;
 * the terminal "action" nodes (smsAlert, emailAlert, webhookTrigger) subscribe
 * to the observable and call alertService accordingly.
 *
 * Exports:
 *   compilePipeline(pipelineId, graph)   – build & subscribe
 *   deactivatePipeline(pipelineId)       – unsubscribe & clean up
 *   activeSubscriptions                  – Map<pipelineId, Subscription>
 */

const {
  filter,
  bufferCount,
  map,
  pairwise,
} = require('rxjs/operators');

const { telemetrySubject } = require('./telemetryStream');
const alertService = require('./alertService');
const logger = require('../utils/logger');

/** Map of pipelineId → RxJS Subscription */
const activeSubscriptions = new Map();

function renderTemplate(template, data) {
  if (!template || typeof template !== 'string') return '';

  return template.replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, (_, key) => {
    const value = data[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

function matchesThreshold(value, threshold, operator = '>') {
  const numericValue = Number(value);
  const numericThreshold = Number(threshold);

  switch (operator) {
    case '>':
      return numericValue > numericThreshold;
    case '>=':
      return numericValue >= numericThreshold;
    case '<':
      return numericValue < numericThreshold;
    case '<=':
      return numericValue <= numericThreshold;
    case '==':
      return numericValue === numericThreshold;
    case '!=':
      return numericValue !== numericThreshold;
    default:
      return numericValue > numericThreshold;
  }
}

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Build an adjacency list from the edge array.
 * @param {Array<{source:string, target:string}>} edges
 * @returns {Map<string, string[]>}
 */
function buildAdjacency(edges) {
  const adj = new Map();
  for (const edge of edges) {
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    adj.get(edge.source).push(edge.target);
  }
  return adj;
}

/**
 * Find all nodes that have no incoming edges (pipeline entry points).
 * @param {Array<{id:string}>} nodes
 * @param {Array<{source:string, target:string}>} edges
 * @returns {string[]}
 */
function findSourceNodeIds(nodes, edges) {
  const hasIncoming = new Set(edges.map((e) => e.target));
  return nodes.filter((n) => !hasIncoming.has(n.id)).map((n) => n.id);
}

/**
 * Walk from startId depth-first; return every root-to-leaf path.
 * @param {string}            startId
 * @param {Map<string,string[]>} adj
 * @returns {string[][]}
 */
function findPaths(startId, adj) {
  const paths = [];
  const dfs = (nodeId, currentPath) => {
    const nextIds = adj.get(nodeId) || [];
    if (nextIds.length === 0) {
      paths.push([...currentPath]);
      return;
    }
    for (const nextId of nextIds) {
      dfs(nextId, [...currentPath, nextId]);
    }
  };
  dfs(startId, [startId]);
  return paths;
}

// ─── operator builders ───────────────────────────────────────────────────────

/**
 * Convert a single pipeline node to the RxJS pipe-able operator(s) it
 * contributes, or return null if the node is a terminal (action) node that
 * drives a subscription rather than transforming the stream.
 *
 * @param {object} node           – React Flow node
 * @param {string} pipelineId
 * @returns {{ operators: Function[], isTerminal: boolean, terminalFn?: Function }}
 */
function nodeToOperators(node, pipelineId) {
  const type = node.type || (node.data && node.data.nodeType) || node.id;
  const data = node.data || {};

  switch (type) {
    // ── Source ───────────────────────────────────────────────────────────────
    case 'sensorSource': {
      const deviceId = data.deviceId;
      return {
        operators: [filter((d) => d.metadata && d.metadata.deviceId === deviceId)],
        isTerminal: false,
      };
    }

    // ── Transformers ─────────────────────────────────────────────────────────
    case 'movingAverage': {
      const windowSize = data.windowSize || 5;
      return {
        operators: [
          bufferCount(windowSize, 1),
          map((buf) => ({
            ...buf[buf.length - 1],
            value: buf.reduce((a, b) => a + b.value, 0) / buf.length,
          })),
        ],
        isTerminal: false,
      };
    }

    case 'threshold': {
      const threshold = data.threshold !== undefined ? data.threshold : 80;
      const operator = data.operator || '>';
      return {
        operators: [filter((d) => matchesThreshold(d.value, threshold, operator))],
        isTerminal: false,
      };
    }

    case 'rateOfChange': {
      return {
        operators: [
          pairwise(),
          map(([prev, curr]) => ({ ...curr, value: curr.value - prev.value })),
        ],
        isTerminal: false,
      };
    }

    // ── Action / terminal nodes ───────────────────────────────────────────────
    case 'smsAlert': {
      const template = data.template || data.message || 'Alert: {deviceId} value {value} exceeded threshold!';
      const severity = data.severity || 'warning';
      return {
        isTerminal: true,
        terminalFn: (d) => {
          const text = renderTemplate(template, {
            deviceId: d.metadata && d.metadata.deviceId,
            value: d.value,
            threshold: data.threshold,
          });
          alertService.fireMockSMS(text);
          alertService.fireAlert({
            pipelineId,
            deviceId: d.metadata && d.metadata.deviceId,
            message: text,
            severity,
            value: d.value,
            threshold: data.threshold,
          });
        },
      };
    }

    case 'emailAlert': {
      const severity = data.severity || 'warning';
      const template = data.template || data.message || 'Email alert for {deviceId} value={value}';
      return {
        isTerminal: true,
        terminalFn: (d) => {
          const text = renderTemplate(template, {
            deviceId: d.metadata && d.metadata.deviceId,
            value: d.value,
            threshold: data.threshold,
          });
          logger.info(`[MOCK EMAIL] To: ${data.to || 'ops@nexusflow.io'} — ${text}`);
          alertService.fireAlert({
            pipelineId,
            deviceId: d.metadata && d.metadata.deviceId,
            message: text,
            severity,
            value: d.value,
            threshold: data.threshold,
          });
        },
      };
    }

    case 'webhookTrigger': {
      const url = data.url || '';
      const severity = data.severity || 'info';
      return {
        isTerminal: true,
        terminalFn: (d) => {
          const payload = {
            deviceId: d.metadata && d.metadata.deviceId,
            value: d.value,
            timestamp: d.timestamp,
            pipelineId,
          };
          alertService.fireWebhook(url, payload);
          alertService.fireAlert({
            pipelineId,
            deviceId: d.metadata && d.metadata.deviceId,
            message: `Webhook triggered for device ${d.metadata && d.metadata.deviceId}`,
            severity,
            value: d.value,
            threshold: data.threshold,
          });
        },
      };
    }

    default:
      logger.warn(`[streamCompiler] Unknown node type "${type}" — skipping`);
      return { operators: [], isTerminal: false };
  }
}

// ─── public API ─────────────────────────────────────────────────────────────

/**
 * Compile a pipeline graph into live RxJS subscriptions and register them.
 *
 * @param {string} pipelineId
 * @param {{ nodes: object[], edges: object[] }} graph
 */
function compilePipeline(pipelineId, graph) {
  // Tear down any previous subscription for this pipeline
  deactivatePipeline(pipelineId);

  const { nodes, edges } = graph;
  if (!nodes || nodes.length === 0) {
    logger.warn(`[streamCompiler] Pipeline ${pipelineId} has no nodes`);
    return;
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const adj = buildAdjacency(edges || []);
  const sourceIds = findSourceNodeIds(nodes, edges || []);

  if (sourceIds.length === 0) {
    logger.warn(`[streamCompiler] Pipeline ${pipelineId} has no source nodes`);
    return;
  }

  const subscriptions = [];

  for (const sourceId of sourceIds) {
    const paths = findPaths(sourceId, adj);

    for (const path of paths) {
      let observable = telemetrySubject.asObservable();
      let terminalFn = null;

      for (const nodeId of path) {
        const node = nodeMap.get(nodeId);
        if (!node) continue;

        const { operators, isTerminal, terminalFn: fn } = nodeToOperators(node, pipelineId);

        if (isTerminal) {
          terminalFn = fn;
          break; // No further piping after terminal node
        }

        if (operators.length > 0) {
          observable = observable.pipe(...operators);
        }
      }

      if (terminalFn) {
        const sub = observable.subscribe({
          next: (d) => {
            try {
              terminalFn(d);
            } catch (err) {
              logger.error(`[streamCompiler] Terminal fn error in pipeline ${pipelineId}: ${err.message}`);
            }
          },
          error: (err) => logger.error(`[streamCompiler] Stream error in pipeline ${pipelineId}: ${err.message}`),
        });
        subscriptions.push(sub);
      }
    }
  }

  if (subscriptions.length > 0) {
    // Store a composite "subscription" with an unsubscribe that tears all down
    activeSubscriptions.set(pipelineId, {
      unsubscribe: () => subscriptions.forEach((s) => s.unsubscribe()),
    });
    logger.info(`[streamCompiler] Pipeline ${pipelineId} compiled — ${subscriptions.length} subscription(s) active`);
  } else {
    logger.warn(`[streamCompiler] Pipeline ${pipelineId} compiled but produced no active subscriptions (no terminal nodes reachable?)`);
  }
}

/**
 * Unsubscribe and remove all RxJS subscriptions for the given pipeline.
 * @param {string} pipelineId
 */
function deactivatePipeline(pipelineId) {
  const sub = activeSubscriptions.get(pipelineId);
  if (sub) {
    sub.unsubscribe();
    activeSubscriptions.delete(pipelineId);
    logger.info(`[streamCompiler] Pipeline ${pipelineId} deactivated`);
  }
}

module.exports = { compilePipeline, deactivatePipeline, activeSubscriptions, matchesThreshold, renderTemplate };
