const { WebSocketServer } = require('ws');

const PORT = 8082;
const wss = new WebSocketServer({ port: PORT });

const subscriptions = new Map(); // driverId -> Set<ws>

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    if (msg.type === 'register') {
      ws.role = msg.role;
      ws.userId = msg.userId || msg.driverId;
    }

    if (msg.type === 'subscribe' && msg.driverId) {
      if (!subscriptions.has(msg.driverId)) subscriptions.set(msg.driverId, new Set());
      subscriptions.get(msg.driverId).add(ws);
      ws.subscribedDriverId = msg.driverId;
    }

    if (msg.type === 'unsubscribe' && msg.driverId) {
      const set = subscriptions.get(msg.driverId);
      if (set) { set.delete(ws); if (set.size === 0) subscriptions.delete(msg.driverId); }
    }

    if (msg.type === 'driver-location' && msg.driverId) {
      const subs = subscriptions.get(msg.driverId);
      if (subs) {
        const payload = JSON.stringify({ type: 'driver-location', driverId: msg.driverId, latitude: msg.latitude, longitude: msg.longitude });
        for (const client of subs) {
          if (client.readyState === 1) client.send(payload);
        }
      }
    }
  });

  ws.on('close', () => {
    if (ws.subscribedDriverId) {
      const set = subscriptions.get(ws.subscribedDriverId);
      if (set) { set.delete(ws); if (set.size === 0) subscriptions.delete(ws.subscribedDriverId); }
    }
  });

  ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket relay connected' }));
});

console.log(`WebSocket relay running on ws://localhost:${PORT}`);
