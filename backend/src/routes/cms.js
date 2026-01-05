const express = require("express");
const db = require("../db/sqlite");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Image upload konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "./data/uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) return cb(null, true);
    cb(new Error("Sadece resim dosyaları yüklenebilir!"));
  }
});

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

// ================ IMAGE UPLOAD ================
router.post("/upload", auth, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Dosya yüklenmedi" });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// ================ PUT ENDPOINTS (EDIT) ================

// Özellik güncelle
router.put("/features/:id", auth, (req, res) => {
  const { id } = req.params;
  const { title, description, icon, image_url, order_index } = req.body;
  
  db.run(
    "UPDATE features SET title = ?, description = ?, icon = ?, image_url = ?, order_index = ? WHERE id = ?",
    [title, description, icon, image_url, order_index, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: "ok" });
    }
  );
});

// Araç güncelle
router.put("/vehicles/:id", auth, (req, res) => {
  const { id } = req.params;
  const { name, type, specs, image_url, order_index } = req.body;
  
  db.run(
    "UPDATE vehicles SET name = ?, type = ?, specs = ?, image_url = ?, order_index = ? WHERE id = ?",
    [name, type, specs, image_url, order_index, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: "ok" });
    }
  );
});

// Fiyat güncelle
router.put("/pricing/:id", auth, (req, res) => {
  const { id } = req.params;
  const { plan_name, price, duration, features, image_url, order_index } = req.body;
  
  db.run(
    "UPDATE pricing SET plan_name = ?, price = ?, duration = ?, features = ?, image_url = ?, order_index = ? WHERE id = ?",
    [plan_name, price, duration, features, image_url, order_index, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: "ok" });
    }
  );
});

// İndirme güncelle
router.put("/downloads/:id", auth, (req, res) => {
  const { id } = req.params;
  const { title, version, download_url, file_size, image_url, order_index } = req.body;
  
  db.run(
    "UPDATE downloads SET title = ?, version = ?, download_url = ?, file_size = ?, image_url = ?, order_index = ? WHERE id = ?",
    [title, version, download_url, file_size, image_url, order_index, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: "ok" });
    }
  );
});

module.exports = router;