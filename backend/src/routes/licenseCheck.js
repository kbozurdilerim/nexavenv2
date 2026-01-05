const express = require("express");
const db = require("../db/sqlite");
const rateLimit = require("../middleware/rateLimit");

const router = express.Router();

/**
 * Client / Game Server doğrulaması
 * POST /api/license/check
 * body: { license_key, hwid }
 */
router.post("/check", rateLimit(5, 60000), (req, res) => {
  const { license_key, hwid } = req.body;
  const ip = req.ip;
  const now = new Date();

  db.get(
    "SELECT * FROM licenses WHERE license_key = ?",
    [license_key],
    (err, lic) => {
      if (!lic)
        return res.json({ valid: false, reason: "Lisans yok" });

      if (lic.status !== "active")
        return res.json({ valid: false, reason: "Pasif lisans" });

      if (lic.expires_at && new Date(lic.expires_at) < now)
        return res.json({ valid: false, reason: "Lisans süresi dolmuş" });

      // İlk bağlanma - HWID bind
      if (!lic.hwid) {
        db.run(
          "UPDATE licenses SET hwid = ?, ip = ? WHERE id = ?",
          [hwid, ip, lic.id]
        );
      } else if (lic.hwid !== hwid) {
        return res.json({ valid: false, reason: "HWID uyuşmazlığı" });
      }

      res.json({
        valid: true,
        owner: lic.owner,
        expires_at: lic.expires_at
      });
    }
  );
});

module.exports = router;
