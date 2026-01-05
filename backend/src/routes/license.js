const express = require("express");
const db = require("../db/sqlite");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Tüm lisansları listele (Admin)
router.get("/", auth, (req, res) => {
  db.all("SELECT * FROM licenses", [], (err, rows) => {
    res.json(rows);
  });
});

// Yeni lisans oluştur (Admin)
router.post("/", auth, (req, res) => {
  const { license_key, owner, days } = req.body;
  const expires = days
    ? new Date(Date.now() + days * 86400000).toISOString()
    : null;

  db.run(
    `INSERT INTO licenses
     (license_key, owner, status, expires_at)
     VALUES (?, ?, 'active', ?)`,
    [license_key, owner, expires],
    () => res.json({ status: "ok" })
  );
});

module.exports = router;
