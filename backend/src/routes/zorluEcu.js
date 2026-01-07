const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roles");
const db = require("../db/sqlite");

const router = express.Router();
const uploadDir = path.join(__dirname, "../data/zorlu-ecu/uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "zorlu-ecu" });
});

router.get("/dashboard", auth, (req, res) => {
  res.json({
    userId: req.user?.id,
    summary: {
      tunedVehicles: 12,
      pendingComparisons: 3,
      aiModels: 2,
      lastRunAt: new Date().toISOString()
    }
  });
});

// Meta veri çıkarım (basit: boyut aralığından ECU tipi)
function extractMetadata(buf, filename) {
  const size = buf.length;
  let ecuType = "Unknown";
  let ecuVersion = "v1.0";
  
  // Dosya adından version çıkar
  const verMatch = filename.match(/v(\d+\.\d+)/i);
  if (verMatch) ecuVersion = verMatch[0];
  
  // Boyut aralığından ECU tipi tahmin et
  if (size < 50000) ecuType = "Stage1";
  else if (size < 150000) ecuType = "Stage2";
  else ecuType = "Full";
  
  return { ecuType, ecuVersion, size };
}

// Dosya yükleme (tek dosya) — meta veri çıkarımlı
router.post("/files/upload", auth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Dosya gerekli" });
  const filePath = req.file.path;
  const buf = fs.readFileSync(filePath);
  const checksum = crypto.createHash("sha256").update(buf).digest("hex");
  const metadata = extractMetadata(buf, req.file.originalname);

  db.run(
    `INSERT INTO ecu_files (user_id, original_name, path, size, checksum, ecu_type, ecu_version, metadata_json) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, req.file.originalname, filePath, req.file.size, checksum, metadata.ecuType, metadata.ecuVersion, JSON.stringify(metadata)],
    function (err) {
      if (err) return res.status(500).json({ error: "Kayıt hatası" });
      res.json({ 
        id: this.lastID, 
        originalName: req.file.originalname, 
        size: req.file.size, 
        checksum,
        metadata
      });
    }
  );
});

// Kullanıcıya ait dosyaları listele + eşleşme önerileri
router.get("/files", auth, (req, res) => {
  db.all(
    `SELECT id, original_name, size, checksum, ecu_type, ecu_version, metadata_json, created_at 
     FROM ecu_files WHERE user_id = ? ORDER BY id DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Sorgu hatası" });
      
      // Eşleşme önerileri: aynı ECU type'ı olanları bulver
      const suggestions = {};
      rows.forEach(f => {
        if (!suggestions[f.ecu_type]) suggestions[f.ecu_type] = [];
        suggestions[f.ecu_type].push(f.id);
      });
      
      res.json({ 
        files: rows,
        suggestions: Object.fromEntries(
          Object.entries(suggestions).filter(([_, ids]) => ids.length > 1)
        )
      });
    }
  );
});

// Basit benzerlik: Byte histogram cosine similarity
function histogram(buf) {
  const h = new Array(256).fill(0);
  for (let i = 0; i < buf.length; i++) h[buf[i]]++;
  return h;
}
function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < 256; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

router.post("/compare", auth, (req, res) => {
  const { fileA, fileB } = req.body || {};
  if (!fileA || !fileB) return res.status(400).json({ error: "fileA ve fileB gerekli" });

  db.get(`SELECT * FROM ecu_files WHERE id = ? AND user_id = ?`, [fileA, req.user.id], (err, A) => {
    if (err || !A) return res.status(404).json({ error: "fileA bulunamadı" });
    db.get(`SELECT * FROM ecu_files WHERE id = ? AND user_id = ?`, [fileB, req.user.id], (err2, B) => {
      if (err2 || !B) return res.status(404).json({ error: "fileB bulunamadı" });
      try {
        const bufA = fs.readFileSync(A.path);
        const bufB = fs.readFileSync(B.path);
        const sim = cosine(histogram(bufA), histogram(bufB));
        const result = { similarity: sim, method: "byte-histogram-cosine" };
        db.run(
          `INSERT INTO ecu_comparisons (user_id, file_a, file_b, similarity, result_json) VALUES (?, ?, ?, ?, ?)`,
          [req.user.id, fileA, fileB, sim, JSON.stringify(result)],
          function (e3) {
            if (e3) return res.status(500).json({ error: "Kayıt hatası" });
            res.json({ id: this.lastID, ...result });
          }
        );
      } catch (e) {
        res.status(500).json({ error: "Karşılaştırma hatası" });
      }
    });
  });
});

router.post("/tuning", auth, (req, res) => {
  const { strategy, model, parameters } = req.body || {};
  const params = JSON.stringify(parameters || {});
  const selectedModel = model || "balanced";
  
  db.run(
    `INSERT INTO tuning_jobs (user_id, strategy, model, parameters_json, status) VALUES (?, ?, ?, ?, 'queued')`,
    [req.user.id, strategy || "default", selectedModel, params],
    function (err) {
      if (err) return res.status(500).json({ error: "İş oluşturma hatası" });
      const jobId = this.lastID;
      // Worker queue tarafından alınacak
      res.json({ status: "queued", jobId, model: selectedModel, message: "Job queue'ya eklendi" });
    }
  );
});

router.get("/tuning/:id", auth, (req, res) => {
  db.get(`SELECT id, status, strategy, parameters_json, result_json, created_at, updated_at FROM tuning_jobs WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: "İş bulunamadı" });
    res.json({
      id: row.id,
      status: row.status,
      strategy: row.strategy,
      parameters: JSON.parse(row.parameters_json || "{}"),
      result: row.result_json ? JSON.parse(row.result_json) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  });
});

router.get("/chat/history", auth, (req, res) => {
  res.json({
    messages: [
      { id: 1, role: "system", text: "Zorlu ECU asistanına hoş geldiniz" },
      { id: 2, role: "user", text: "Son tuning sonucu?" },
      { id: 3, role: "assistant", text: "Son iş demo-job-001 olarak kuyruğa alındı." }
    ]
  });
});

router.post("/chat/message", auth, (req, res) => {
  const { text } = req.body || {};
  res.json({ reply: `Demo cevap: ${text || "(boş)"}` });
});

// Admin istatistikleri
router.get("/admin/stats", auth, requireRole("admin"), (req, res) => {
  const out = {};
  db.get(`SELECT COUNT(*) as users FROM users`, (_, row1) => {
    out.users = row1?.users || 0;
    db.get(`SELECT COUNT(*) as files FROM ecu_files`, (_, row2) => {
      out.files = row2?.files || 0;
      db.get(`SELECT COUNT(*) as comparisons FROM ecu_comparisons`, (_, row3) => {
        out.comparisons = row3?.comparisons || 0;
        db.get(`SELECT COUNT(*) as jobs FROM tuning_jobs`, (_, row4) => {
          out.tuningJobs = row4?.jobs || 0;
          res.json(out);
        });
      });
    });
  });
});

module.exports = router;
