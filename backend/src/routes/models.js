const express = require("express");
const db = require("../db/sqlite");
const auth = require("../middleware/authMiddleware");
const { getActiveJobs, getMaxWorkers } = require("../services/aiWorker");

const router = express.Router();

// Mevcut AI modelleri
const MODELS = {
  "lightweight": { name: "Lightweight", speed: "fast", accuracy: "medium", desc: "Hızlı, az kaynak", multiplier: 1.0 },
  "balanced": { name: "Balanced", speed: "medium", accuracy: "high", desc: "Dengeli hız-doğruluk", multiplier: 1.5 },
  "advanced": { name: "Advanced", speed: "slow", accuracy: "very-high", desc: "En yüksek doğruluk", multiplier: 2.5 },
  "expert": { name: "Expert", speed: "very-slow", accuracy: "expert", desc: "Maksimum detay analizi", multiplier: 4.0 }
};

router.get("/models", (req, res) => {
  res.json({ models: MODELS, activeJobs: getActiveJobs(), maxWorkers: getMaxWorkers() });
});

router.get("/benchmark", (req, res) => {
  // Demo: Model performans karşılaştırması
  res.json({
    benchmarks: {
      "lightweight": { throughput: "1000 files/min", latency: "100ms", memory: "50MB", quality: "70%" },
      "balanced": { throughput: "500 files/min", latency: "250ms", memory: "150MB", quality: "85%" },
      "advanced": { throughput: "100 files/min", latency: "2000ms", memory: "500MB", quality: "95%" },
      "expert": { throughput: "20 files/min", latency: "5000ms", memory: "1GB", quality: "99%" }
    },
    activeJobs: getActiveJobs(),
    maxWorkers: getMaxWorkers()
  });
});

// Queue durumu ve istatistikler
router.get("/queue-status", auth, (req, res) => {
  db.get(
    `SELECT 
      COUNT(CASE WHEN status = 'queued' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
     FROM tuning_jobs`,
    (err, stats) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        ...stats,
        activeJobs: getActiveJobs(),
        maxWorkers: getMaxWorkers(),
        timestamp: new Date()
      });
    }
  );
});

module.exports = router;
