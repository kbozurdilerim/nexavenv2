const express = require("express");
const db = require("../db/sqlite");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Site ayarlarını getir
router.get("/", (req, res) => {
  db.get("SELECT * FROM site_settings WHERE id = 1", [], (err, settings) => {
    if (err) {
      return res.status(500).json({ error: "Ayarlar getirilemedi" });
    }
    
    if (!settings) {
      // Varsayılan ayarlar
      return res.json({
        id: 1,
        site_title: "NEXAVEN",
        site_description: "Modern Lisans Yönetim Sistemi",
        hero_title: "Hoş Geldiniz",
        hero_subtitle: "Gelişmiş lisans yönetimi ve simülasyon çözümleri",
        about_title: "Hakkımızda",
        about_text: "Nexaven, modern ve güvenilir lisans yönetim sistemi sunar.",
        contact_email: "info@nexaven.com.tr",
        contact_phone: "+90 XXX XXX XX XX",
        social_facebook: "",
        social_twitter: "",
        social_instagram: "",
        footer_text: "© 2026 Nexaven. Tüm hakları saklıdır."
      });
    }
    
    res.json(settings);
  });
});

// Site ayarlarını güncelle (Admin only)
router.put("/", auth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Yetkisiz erişim" });
  }

  const {
    site_title,
    site_description,
    hero_title,
    hero_subtitle,
    about_title,
    about_text,
    contact_email,
    contact_phone,
    social_facebook,
    social_twitter,
    social_instagram,
    footer_text
  } = req.body;

  // Önce var mı kontrol et
  db.get("SELECT * FROM site_settings WHERE id = 1", [], (err, existing) => {
    if (existing) {
      // Güncelle
      db.run(
        `UPDATE site_settings SET 
          site_title = ?,
          site_description = ?,
          hero_title = ?,
          hero_subtitle = ?,
          about_title = ?,
          about_text = ?,
          contact_email = ?,
          contact_phone = ?,
          social_facebook = ?,
          social_twitter = ?,
          social_instagram = ?,
          footer_text = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1`,
        [
          site_title,
          site_description,
          hero_title,
          hero_subtitle,
          about_title,
          about_text,
          contact_email,
          contact_phone,
          social_facebook,
          social_twitter,
          social_instagram,
          footer_text
        ],
        function (err) {
          if (err) {
            return res.status(500).json({ error: "Ayarlar güncellenemedi" });
          }
          res.json({ message: "Ayarlar güncellendi" });
        }
      );
    } else {
      // Yeni kayıt oluştur
      db.run(
        `INSERT INTO site_settings (
          site_title, site_description, hero_title, hero_subtitle,
          about_title, about_text, contact_email, contact_phone,
          social_facebook, social_twitter, social_instagram, footer_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          site_title,
          site_description,
          hero_title,
          hero_subtitle,
          about_title,
          about_text,
          contact_email,
          contact_phone,
          social_facebook,
          social_twitter,
          social_instagram,
          footer_text
        ],
        function (err) {
          if (err) {
            return res.status(500).json({ error: "Ayarlar oluşturulamadı" });
          }
          res.json({ message: "Ayarlar oluşturuldu" });
        }
      );
    }
  });
});

module.exports = router;
