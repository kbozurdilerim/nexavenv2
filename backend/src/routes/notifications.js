const express = require("express");
const db = require("../db/sqlite");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

// Kullanıcının bildirimlerini getir
router.get("/", auth, (req, res) => {
  const userId = req.user.id;
  
  db.all(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
    [userId],
    (err, notifications) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(notifications || []);
    }
  );
});

// Bildirimi okundu olarak işaretle
router.put("/:id/read", auth, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  db.run(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
    [id, userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: "ok" });
    }
  );
});

// Tüm bildirimleri okundu olarak işaretle
router.put("/read-all", auth, (req, res) => {
  const userId = req.user.id;
  
  db.run(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
    [userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: "ok" });
    }
  );
});

// Okunmamış bildirim sayısı
router.get("/unread-count", auth, (req, res) => {
  const userId = req.user.id;
  
  db.get(
    "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
    [userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ count: row.count });
    }
  );
});

// Bildirim oluştur (Admin için)
router.post("/", auth, (req, res) => {
  // Admin kontrolü
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Yetkiniz yok" });
  }
  
  const { user_id, title, message, type } = req.body;
  
  db.run(
    "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
    [user_id, title, message, type || 'info'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: "ok", id: this.lastID });
    }
  );
});

module.exports = router;
