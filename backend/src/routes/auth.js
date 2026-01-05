const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db/sqlite");

const router = express.Router();

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Token gerekli" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Geçersiz token" });
  }
}

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (!user) return res.status(401).json({ error: "Kullanıcı yok" });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ error: "Şifre hatalı" });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({ token });
    }
  );
});

// Get current user info
router.get("/me", verifyToken, (req, res) => {
  db.get(
    "SELECT id, username, email, role, user_type, company_name, created_at FROM users WHERE id = ?",
    [req.user.id],
    (err, user) => {
      if (err || !user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      res.json(user);
    }
  );
});

module.exports = router;
