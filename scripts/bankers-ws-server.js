const { WebSocketServer } = require("ws");
const http = require("http");
const url = require("url");

const PORT = process.env.WS_PORT || 3002;
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" });
  res.end("Nexus Bankers Connect WebSocket Server is Live\n");
});

const wss = new WebSocketServer({ server });

// Map: userId -> Set of active WebSocket connections (allows multiple tabs/devices)
const clients = new Map();

function broadcastOnlineStatus(userId, isOnline) {
  const payload = JSON.stringify({
    type: "presence_change",
    userId,
    isOnline,
    timestamp: new Date().toISOString(),
  });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}

wss.on("connection", (ws, req) => {
  const parsedUrl = url.parse(req.url, true);
  const userId = parsedUrl.query.userId;

  if (!userId) {
    ws.close(1008, "Missing userId query parameter");
    return;
  }

  // Register client
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
    broadcastOnlineStatus(userId, true);
  }
  clients.get(userId).add(ws);

  console.log(`[WS] Banker connected: ${userId} (Active connections for user: ${clients.get(userId).size})`);

  // Send initial connected ack
  ws.send(
    JSON.stringify({
      type: "connected",
      message: "Connected to Nexus Bankers Connect Real-time Service",
      userId,
      onlineUsers: Array.from(clients.keys()),
    })
  );

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      console.log(`[WS] Event from ${userId}:`, data.type);

      switch (data.type) {
        case "chat_message": {
          const { recipientId, message, senderName, senderBank } = data;
          if (recipientId && clients.has(recipientId)) {
            const recipientSockets = clients.get(recipientId);
            const outgoing = JSON.stringify({
              type: "new_message",
              message,
              senderId: userId,
              senderName: senderName || "Banker",
              senderBank: senderBank || "",
              timestamp: new Date().toISOString(),
            });
            recipientSockets.forEach((s) => {
              if (s.readyState === 1) s.send(outgoing);
            });
          }
          break;
        }

        case "connection_request": {
          const { recipientId, senderName, senderBank, introMessage } = data;
          if (recipientId && clients.has(recipientId)) {
            const recipientSockets = clients.get(recipientId);
            const outgoing = JSON.stringify({
              type: "new_connection_request",
              senderId: userId,
              senderName,
              senderBank,
              introMessage,
              timestamp: new Date().toISOString(),
            });
            recipientSockets.forEach((s) => {
              if (s.readyState === 1) s.send(outgoing);
            });
          }
          break;
        }

        case "connection_accepted": {
          const { requesterId, responderName, responderBank } = data;
          if (requesterId && clients.has(requesterId)) {
            const requesterSockets = clients.get(requesterId);
            const outgoing = JSON.stringify({
              type: "connection_accepted",
              responderId: userId,
              responderName,
              responderBank,
              timestamp: new Date().toISOString(),
            });
            requesterSockets.forEach((s) => {
              if (s.readyState === 1) s.send(outgoing);
            });
          }
          break;
        }

        case "typing": {
          const { recipientId, isTyping } = data;
          if (recipientId && clients.has(recipientId)) {
            const recipientSockets = clients.get(recipientId);
            const outgoing = JSON.stringify({
              type: "user_typing",
              senderId: userId,
              isTyping: !!isTyping,
            });
            recipientSockets.forEach((s) => {
              if (s.readyState === 1) s.send(outgoing);
            });
          }
          break;
        }

        case "ping": {
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error("[WS] Message parse error:", err);
    }
  });

  ws.on("close", () => {
    if (clients.has(userId)) {
      const userSockets = clients.get(userId);
      userSockets.delete(ws);
      if (userSockets.size === 0) {
        clients.delete(userId);
        broadcastOnlineStatus(userId, false);
      }
    }
    console.log(`[WS] Banker disconnected: ${userId}`);
  });

  ws.on("error", (err) => {
    console.error(`[WS] Error for ${userId}:`, err);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Bankers Connect WebSocket Server listening on ws://localhost:${PORT}`);
});
