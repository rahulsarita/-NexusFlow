const WebSocket = require('ws');

const clients = new Set();

/**
 * Initialise the WebSocket server and wire up connection lifecycle.
 * @param {WebSocket.Server} wss
 */
const initWebSocket = (wss) => {
  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.send(JSON.stringify({ type: 'CONNECTED' }));

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      clients.delete(ws);
    });
  });
};

/**
 * Broadcast a JSON-serialisable object to every connected client.
 * @param {object} data
 */
const broadcast = (data) => {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
};

module.exports = { initWebSocket, broadcast, clients };
