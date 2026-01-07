const express = require("express");
const http = require("http");
const WebSocket = require("ws");

let wsConnections = new Map(); // jobId -> Set<WebSocket>
let sseConnections = new Map(); // jobId -> Set<Response>

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    if (req.url.startsWith("/api/ws/subscribe/")) {
      const jobId = parseInt(req.url.split("/").pop());
      
      wss.handleUpgrade(req, socket, head, (ws) => {
        if (!wsConnections.has(jobId)) {
          wsConnections.set(jobId, new Set());
        }
        wsConnections.get(jobId).add(ws);

        ws.on("close", () => {
          const conns = wsConnections.get(jobId);
          if (conns) conns.delete(ws);
        });

        ws.on("error", () => {
          const conns = wsConnections.get(jobId);
          if (conns) conns.delete(ws);
        });
      });
    }
  });
}

function broadcastJobUpdate(jobId, data) {
  const msg = JSON.stringify(data);
  
  // WebSocket broadcast
  const wsConns = wsConnections.get(jobId);
  if (wsConns) {
    wsConns.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    });
  }

  // SSE broadcast
  const sseConns = sseConnections.get(jobId);
  if (sseConns) {
    sseConns.forEach(res => {
      res.write(`data: ${msg}\n\n`);
    });
  }
}

function registerSSEConnection(jobId, res) {
  if (!sseConnections.has(jobId)) {
    sseConnections.set(jobId, new Set());
  }
  sseConnections.get(jobId).add(res);
}

function unregisterSSEConnection(jobId, res) {
  const conns = sseConnections.get(jobId);
  if (conns) conns.delete(res);
}

module.exports = {
  setupWebSocket,
  broadcastJobUpdate,
  registerSSEConnection,
  unregisterSSEConnection,
  wsConnections,
  sseConnections
};
