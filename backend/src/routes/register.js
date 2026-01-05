const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db/sqlite");
const router = express.Router();

// Register endpoint
router.post("/register", async (req, res) => {
  const { username, email, password, userType, companyName } = req.body;

  if (!username || !email || !password || !userType) {
    return res.status(400).json({ error: "Tüm alanlar gereklidir" });
  }

  // Kullanıcı adı kontrolü
  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
    if (row) {
      return res.status(400).json({ error: "Bu kullanıcı adı zaten kullanılıyor" });
    }

    // Email kontrolü
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
      if (row) {
        return res.status(400).json({ error: "Bu email zaten kullanılıyor" });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run(
          `INSERT INTO users (username, email, password, user_type, company_name, role) 
           VALUES (?, ?, ?, ?, ?, 'user')`,
          [username, email, hashedPassword, userType, companyName || null],
          function(err) {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: "Kayıt sırasında hata oluştu" });
            }

            // Hoş geldin bildirimi
            db.run(
              `INSERT INTO notifications (user_id, title, message, type) 
               VALUES (?, ?, ?, ?)`,
              [
                this.lastID,
                "Hoş Geldiniz! 🎉",
                "Nexaven'e başarıyla kayıt oldunuz. Lisans satın almak için fiyatlandırma sayfasını ziyaret edin.",
                "success"
              ]
            );

            res.json({ 
              message: "Kayıt başarılı! Giriş yapabilirsiniz.",
              userId: this.lastID
            });
          }
        );
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Sunucu hatası" });
      }
    });
  });
});

module.exports = router;
