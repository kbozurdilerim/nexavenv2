const express = require("express");
const db = require("../db/sqlite");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// CMS içeriklerini getir
router.get("/", (req, res) => {
  const content = {
    features: [],
    vehicles: [],
    pricing: [],
    downloads: []
  };

  // Özellikleri getir
  db.all("SELECT * FROM features ORDER BY order_index", [], (err, features) => {
    if (features) content.features = features;

    // Araçları getir
    db.all("SELECT * FROM vehicles ORDER BY order_index", [], (err, vehicles) => {
      if (vehicles) content.vehicles = vehicles;

      // Fiyatları getir
      db.all("SELECT * FROM pricing ORDER BY order_index", [], (err, pricing) => {
        if (pricing) content.pricing = pricing;

        // İndirmeleri getir
        db.all("SELECT * FROM downloads ORDER BY order_index", [], (err, downloads) => {
          if (downloads) content.downloads = downloads;
          res.json(content);
        });
      });
    });
  });
});

// Özellik ekle/güncelle
router.post("/features", auth, (req, res) => {
  const { id, title, description, icon, order_index } = req.body;
  
  if (id) {
    db.run(
      "UPDATE features SET title = ?, description = ?, icon = ?, order_index = ? WHERE id = ?",
      [title, description, icon, order_index, id],
      () => res.json({ status: "ok" })
    );
  } else {
    db.run(
      "INSERT INTO features (title, description, icon, order_index) VALUES (?, ?, ?, ?)",
      [title, description, icon, order_index],
      () => res.json({ status: "ok" })
    );
  }
});

// Özellik sil
router.delete("/features/:id", auth, (req, res) => {
  db.run("DELETE FROM features WHERE id = ?", [req.params.id], () => {
    res.json({ status: "ok" });
  });
});

// Araç ekle/güncelle
router.post("/vehicles", auth, (req, res) => {
  const { id, name, type, specs, image, order_index } = req.body;
  
  if (id) {
    db.run(
      "UPDATE vehicles SET name = ?, type = ?, specs = ?, image = ?, order_index = ? WHERE id = ?",
      [name, type, specs, image, order_index, id],
      () => res.json({ status: "ok" })
    );
  } else {
    db.run(
      "INSERT INTO vehicles (name, type, specs, image, order_index) VALUES (?, ?, ?, ?, ?)",
      [name, type, specs, image, order_index],
      () => res.json({ status: "ok" })
    );
  }
});

// Araç sil
router.delete("/vehicles/:id", auth, (req, res) => {
  db.run("DELETE FROM vehicles WHERE id = ?", [req.params.id], () => {
    res.json({ status: "ok" });
  });
});

// Fiyat ekle/güncelle
router.post("/pricing", auth, (req, res) => {
  const { id, plan_name, price, duration, features, order_index } = req.body;
  
  if (id) {
    db.run(
      "UPDATE pricing SET plan_name = ?, price = ?, duration = ?, features = ?, order_index = ? WHERE id = ?",
      [plan_name, price, duration, features, order_index, id],
      () => res.json({ status: "ok" })
    );
  } else {
    db.run(
      "INSERT INTO pricing (plan_name, price, duration, features, order_index) VALUES (?, ?, ?, ?, ?)",
      [plan_name, price, duration, features, order_index],
      () => res.json({ status: "ok" })
    );
  }
});

// Fiyat sil
router.delete("/pricing/:id", auth, (req, res) => {
  db.run("DELETE FROM pricing WHERE id = ?", [req.params.id], () => {
    res.json({ status: "ok" });
  });
});

// İndirme ekle/güncelle
router.post("/downloads", auth, (req, res) => {
  const { id, title, version, download_url, file_size, order_index } = req.body;
  
  if (id) {
    db.run(
      "UPDATE downloads SET title = ?, version = ?, download_url = ?, file_size = ?, order_index = ? WHERE id = ?",
      [title, version, download_url, file_size, order_index, id],
      () => res.json({ status: "ok" })
    );
  } else {
    db.run(
      "INSERT INTO downloads (title, version, download_url, file_size, order_index) VALUES (?, ?, ?, ?, ?)",
      [title, version, download_url, file_size, order_index],
      () => res.json({ status: "ok" })
    );
  }
});

// İndirme sil
router.delete("/downloads/:id", auth, (req, res) => {
  db.run("DELETE FROM downloads WHERE id = ?", [req.params.id], () => {
    res.json({ status: "ok" });
  });
});

module.exports = router;