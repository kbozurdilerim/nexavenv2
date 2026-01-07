const express = require("express");
const db = require("../db/sqlite");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roles");
const bcrypt = require("bcrypt");

const router = express.Router();

// Admin: Tüm kullanıcıları listele
router.get("/users", auth, requireRole("admin"), (req, res) => {
  db.all(
    `SELECT id, username, email, role, user_type, company_name, created_at FROM users ORDER BY id DESC`,
    (err, users) => {
      if (err) return res.status(500).json({ error: "Sorgu hatası" });
      res.json({ users });
    }
  );
});

// Admin: Rol değiştir
router.put("/users/:id/role", auth, requireRole("admin"), (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) return res.status(400).json({ error: "Geçersiz rol" });
  
  db.run(
    `UPDATE users SET role = ? WHERE id = ?`,
    [role, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: "Güncelleme hatası" });
      res.json({ ok: true, message: `Kullanıcı #${req.params.id} rol: ${role}` });
    }
  );
});

// Admin: Job logları
router.get("/jobs", auth, requireRole("admin"), (req, res) => {
  const limit = req.query.limit || 50;
  db.all(
    `SELECT tj.id, tj.user_id, u.username, tj.strategy, tj.status, tj.created_at, tj.updated_at
     FROM tuning_jobs tj
     LEFT JOIN users u ON tj.user_id = u.id
     ORDER BY tj.id DESC
     LIMIT ?`,
    [limit],
    (err, jobs) => {
      if (err) return res.status(500).json({ error: "Sorgu hatası" });
      res.json({ jobs });
    }
  );
});

// Admin: Job detayı
router.get("/jobs/:id", auth, requireRole("admin"), (req, res) => {
  db.get(
    `SELECT tj.*, u.username FROM tuning_jobs tj LEFT JOIN users u ON tj.user_id = u.id WHERE tj.id = ?`,
    [req.params.id],
    (err, job) => {
      if (err || !job) return res.status(404).json({ error: "Job bulunamadı" });
      res.json({
        id: job.id,
        userId: job.user_id,
        username: job.username,
        strategy: job.strategy,
        parameters: JSON.parse(job.parameters_json || "{}"),
        status: job.status,
        result: job.result_json ? JSON.parse(job.result_json) : null,
        createdAt: job.created_at,
        updatedAt: job.updated_at
      });
    }
  );
});

// Admin: Dosya inceleme
router.get("/files", auth, requireRole("admin"), (req, res) => {
  const limit = req.query.limit || 50;
  db.all(
    `SELECT ef.id, ef.user_id, u.username, ef.original_name, ef.size, ef.checksum, ef.created_at
     FROM ecu_files ef
     LEFT JOIN users u ON ef.user_id = u.id
     ORDER BY ef.id DESC
     LIMIT ?`,
    [limit],
    (err, files) => {
      if (err) return res.status(500).json({ error: "Sorgu hatası" });
      res.json({ files });
    }
  );
});

// Admin: İstatistikler
router.get("/stats", auth, requireRole("admin"), (req, res) => {
  const stats = {};
  db.get(`SELECT COUNT(*) as cnt FROM users`, (_, r1) => {
    stats.totalUsers = r1?.cnt || 0;
    db.get(`SELECT COUNT(*) as cnt FROM tuning_jobs`, (_, r2) => {
      stats.totalJobs = r2?.cnt || 0;
      db.get(`SELECT COUNT(*) as cnt FROM tuning_jobs WHERE status = 'completed'`, (_, r3) => {
        stats.completedJobs = r3?.cnt || 0;
        db.get(`SELECT COUNT(*) as cnt FROM tuning_jobs WHERE status = 'failed'`, (_, r4) => {
          stats.failedJobs = r4?.cnt || 0;
          db.get(`SELECT COUNT(*) as cnt FROM ecu_files`, (_, r5) => {
            stats.totalFiles = r5?.cnt || 0;
            res.json(stats);
          });
        });
      });
    });
  });
});

module.exports = router;
