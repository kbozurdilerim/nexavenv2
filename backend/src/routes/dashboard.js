const express = require("express");
const db = require("../db/sqlite");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

// Dashboard istatistiklerini getir (Admin)
router.get("/stats", auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Yetkiniz yok" });
  }
  
  const stats = {};
  
  // Toplam kullanıcı sayısı
  db.get("SELECT COUNT(*) as count FROM users WHERE role != 'admin'", [], (err, row) => {
    stats.totalUsers = row ? row.count : 0;
    
    // Aktif lisans sayısı
    db.get("SELECT COUNT(*) as count FROM licenses WHERE status = 'active'", [], (err, row) => {
      stats.activeLicenses = row ? row.count : 0;
      
      // Bekleyen talepler
      db.get("SELECT COUNT(*) as count FROM license_requests WHERE status = 'pending'", [], (err, row) => {
        stats.pendingRequests = row ? row.count : 0;
        
        // Toplam gelir
        db.get("SELECT SUM(amount) as total FROM transactions WHERE type = 'income'", [], (err, row) => {
          stats.totalIncome = row && row.total ? row.total : 0;
          
          // Toplam gider
          db.get("SELECT SUM(amount) as total FROM transactions WHERE type = 'expense'", [], (err, row) => {
            stats.totalExpense = row && row.total ? row.total : 0;
            stats.netIncome = stats.totalIncome - stats.totalExpense;
            
            // Son 7 günde eklenen kullanıcılar
            db.get(
              "SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-7 days')",
              [],
              (err, row) => {
                stats.newUsersWeek = row ? row.count : 0;
                
                // Son 7 günde eklenen lisanslar
                db.get(
                  "SELECT COUNT(*) as count FROM licenses WHERE created_at >= datetime('now', '-7 days')",
                  [],
                  (err, row) => {
                    stats.newLicensesWeek = row ? row.count : 0;
                    
                    // Kullanıcı tipleri dağılımı
                    db.all(
                      "SELECT user_type, COUNT(*) as count FROM users GROUP BY user_type",
                      [],
                      (err, rows) => {
                        stats.userTypeDistribution = rows || [];
                        
                        // Son işlemler
                        db.all(
                          `SELECT t.*, u.username FROM transactions t
                           LEFT JOIN users u ON t.user_id = u.id
                           ORDER BY t.created_at DESC LIMIT 10`,
                          [],
                          (err, rows) => {
                            stats.recentTransactions = rows || [];
                            
                            res.json(stats);
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          });
        });
      });
    });
  });
});

// Aylık gelir/gider grafiği
router.get("/monthly-revenue", auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Yetkiniz yok" });
  }
  
  db.all(
    `SELECT 
      strftime('%Y-%m', created_at) as month,
      type,
      SUM(amount) as total
     FROM transactions
     WHERE created_at >= datetime('now', '-12 months')
     GROUP BY month, type
     ORDER BY month DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// Kullanıcı aktivite grafiği
router.get("/user-activity", auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Yetkiniz yok" });
  }
  
  db.all(
    `SELECT 
      strftime('%Y-%m-%d', created_at) as date,
      COUNT(*) as count
     FROM users
     WHERE created_at >= datetime('now', '-30 days')
     GROUP BY date
     ORDER BY date ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

module.exports = router;
