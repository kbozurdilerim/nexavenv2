const express = require("express");
const db = require("../db/sqlite");
const auth = require("../middleware/authMiddleware");
const crypto = require("crypto");
const router = express.Router();

// Lisans talebi oluştur
router.post("/", auth, (req, res) => {
  const userId = req.user.id;
  const { plan_id, message } = req.body;
  
  if (!plan_id) {
    return res.status(400).json({ error: "Plan seçmelisiniz" });
  }
  
  // Plan bilgisini al
  db.get("SELECT * FROM pricing WHERE id = ?", [plan_id], (err, plan) => {
    if (!plan) {
      return res.status(404).json({ error: "Plan bulunamadı" });
    }
    
    // Lisans talebi oluştur
    db.run(
      `INSERT INTO license_requests (user_id, plan_id, message, status) 
       VALUES (?, ?, ?, 'pending')`,
      [userId, plan_id, message || ''],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Kullanıcıya bildirim gönder
        db.run(
          `INSERT INTO notifications (user_id, title, message, type) 
           VALUES (?, ?, ?, ?)`,
          [
            userId,
            "Lisans Talebiniz Alındı 📋",
            `${plan.plan_name} planı için lisans talebiniz oluşturuldu. Admin onayı bekleniyor.`,
            "info"
          ]
        );
        
        res.json({ 
          status: "ok", 
          requestId: this.lastID,
          message: "Lisans talebiniz oluşturuldu. Admin onayı bekleniyor."
        });
      }
    );
  });
});

// Kullanıcının lisans taleplerini getir
router.get("/my-requests", auth, (req, res) => {
  const userId = req.user.id;
  
  db.all(
    `SELECT lr.*, p.plan_name, p.price, p.duration 
     FROM license_requests lr
     JOIN pricing p ON lr.plan_id = p.id
     WHERE lr.user_id = ?
     ORDER BY lr.created_at DESC`,
    [userId],
    (err, requests) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(requests || []);
    }
  );
});

// Tüm lisans taleplerini getir (Admin)
router.get("/all", auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Yetkiniz yok" });
  }
  
  db.all(
    `SELECT lr.*, u.username, u.email, u.user_type, u.company_name, 
            p.plan_name, p.price, p.duration
     FROM license_requests lr
     JOIN users u ON lr.user_id = u.id
     JOIN pricing p ON lr.plan_id = p.id
     ORDER BY lr.created_at DESC`,
    [],
    (err, requests) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(requests || []);
    }
  );
});

// Lisans talebini onayla (Admin)
router.post("/:id/approve", auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Yetkiniz yok" });
  }
  
  const requestId = req.params.id;
  const { duration_days } = req.body; // Kaç gün lisans verileceği
  
  // Talebi getir
  db.get(
    `SELECT lr.*, p.plan_name FROM license_requests lr
     JOIN pricing p ON lr.plan_id = p.id
     WHERE lr.id = ?`,
    [requestId],
    (err, request) => {
      if (!request) {
        return res.status(404).json({ error: "Talep bulunamadı" });
      }
      
      if (request.status !== 'pending') {
        return res.status(400).json({ error: "Bu talep zaten işlenmiş" });
      }
      
      // Lisans anahtarı oluştur
      const licenseKey = `NXV-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      
      // Son kullanma tarihi hesapla
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (duration_days || 30));
      
      // Lisans oluştur
      db.run(
        `INSERT INTO licenses (license_key, user_id, owner, plan_id, status, expires_at) 
         VALUES (?, ?, ?, ?, 'active', ?)`,
        [licenseKey, request.user_id, request.user_id, request.plan_id, expiresAt.toISOString()],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          
          const licenseId = this.lastID;
          
          // Talebi onayla
          db.run(
            "UPDATE license_requests SET status = 'approved', admin_response = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [`Lisans onaylandı. Anahtar: ${licenseKey}`, requestId],
            () => {
              // Kullanıcıya bildirim gönder
              db.run(
                `INSERT INTO notifications (user_id, title, message, type) 
                 VALUES (?, ?, ?, ?)`,
                [
                  request.user_id,
                  "Lisans Talebiniz Onaylandı! 🎉",
                  `${request.plan_name} planı için lisansınız onaylandı.\nLisans Anahtarı: ${licenseKey}\nGeçerlilik: ${duration_days || 30} gün`,
                  "success"
                ]
              );
              
              // Transaction kaydı oluştur
              db.run(
                `INSERT INTO transactions (user_id, license_id, amount, type, description) 
                 VALUES (?, ?, 0, 'license_granted', ?)`,
                [request.user_id, licenseId, `${request.plan_name} lisansı verildi`]
              );
              
              res.json({ 
                status: "ok", 
                licenseKey,
                message: "Lisans başarıyla oluşturuldu"
              });
            }
          );
        }
      );
    }
  );
});

// Lisans talebini reddet (Admin)
router.post("/:id/reject", auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Yetkiniz yok" });
  }
  
  const requestId = req.params.id;
  const { reason } = req.body;
  
  // Talebi getir
  db.get(
    "SELECT * FROM license_requests WHERE id = ?",
    [requestId],
    (err, request) => {
      if (!request) {
        return res.status(404).json({ error: "Talep bulunamadı" });
      }
      
      // Talebi reddet
      db.run(
        "UPDATE license_requests SET status = 'rejected', admin_response = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [reason || 'Talep reddedildi', requestId],
        () => {
          // Kullanıcıya bildirim gönder
          db.run(
            `INSERT INTO notifications (user_id, title, message, type) 
             VALUES (?, ?, ?, ?)`,
            [
              request.user_id,
              "Lisans Talebiniz Reddedildi ❌",
              `Lisans talebiniz reddedildi.\nSebep: ${reason || 'Belirtilmedi'}`,
              "error"
            ]
          );
          
          res.json({ status: "ok" });
        }
      );
    }
  );
});

module.exports = router;
