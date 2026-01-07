const express = require("express");
const db = require("../db/sqlite");
const auth = require("../middleware/authMiddleware");
const { registerSSEConnection, unregisterSSEConnection, broadcastJobUpdate } = require("../services/realtime");

const router = express.Router();

router.get("/subscribe/:jobId", auth, (req, res) => {
  const jobId = parseInt(req.params.jobId);
  
  // Yetkilendirme: sadece job owner'ı subscribe edebilir
  db.get(`SELECT user_id FROM tuning_jobs WHERE id = ?`, [jobId], (err, job) => {
    if (err || !job || job.user_id !== req.user.id) {
      return res.status(403).json({ error: "Erişim reddedildi" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Mevcut job durumunu gönder
    db.get(
      `SELECT id, status, strategy, model, created_at, updated_at FROM tuning_jobs WHERE id = ?`,
      [jobId],
      (err, row) => {
        if (row) {
          res.write(`data: ${JSON.stringify({ type: "status", ...row })}\n\n`);
        }
      }
    );

    // SSE connection'ı kaydet
    registerSSEConnection(jobId, res);

    // Bağlantı kapandığında temizle
    req.on("close", () => {
      unregisterSSEConnection(jobId, res);
    });
  });
});

module.exports = { router, broadcastJobUpdate };

