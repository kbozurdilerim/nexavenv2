const { spawn } = require("child_process");
const path = require("path");
const cluster = require("cluster");
const os = require("os");
const db = require("../db/sqlite");
const { broadcastJobUpdate } = require("./realtime");

const workerScript = path.join(__dirname, "../../ai_worker.py");
const NUM_WORKERS = Math.min(os.cpus().length, 4); // Max 4 workers

let activeJobs = 0;
let maxConcurrentJobs = NUM_WORKERS;

// Job'u işle: Python worker'ı çağır
function processJob(jobId, fileIds, strategy, model, parameters) {
  activeJobs++;
  const args = [workerScript, jobId, JSON.stringify(fileIds), strategy, JSON.stringify(parameters || {}), model];

  broadcastJobUpdate(jobId, { type: "progress", jobId, message: "Worker başlıyor...", model, activeJobs });

  const worker = spawn("python", args, {
    cwd: path.join(__dirname, "../.."),
    stdio: ["pipe", "pipe", "pipe"]
  });

  let stdout = "";
  let stderr = "";

  worker.stdout.on("data", (data) => { stdout += data.toString(); });
  worker.stderr.on("data", (data) => { stderr += data.toString(); });

  worker.on("close", (code) => {
    activeJobs--;
    let result = { ok: false, error: stderr || "Unknown error" };
    if (code === 0) {
      try { result = JSON.parse(stdout); } catch (e) { result.error = "Parse error: " + stdout; }
    }
    
    const status = result.ok ? "completed" : "failed";
    const message = result.ok ? "İş tamamlandı" : `İş başarısız: ${result.error}`;
    
    db.run(
      `UPDATE tuning_jobs SET status = ?, result_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, JSON.stringify(result), jobId]
    );

    broadcastJobUpdate(jobId, { type: status, jobId, message, result, activeJobs });
  });

  worker.on("error", (err) => {
    activeJobs--;
    db.run(
      `UPDATE tuning_jobs SET status = 'failed', result_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [JSON.stringify({ error: err.message }), jobId]
    );

    broadcastJobUpdate(jobId, { type: "error", jobId, message: `Hata: ${err.message}`, activeJobs });
  });
}

// Queue'u poll et ve işle (Multi-job parallelism)
function startQueue() {
  setInterval(() => {
    // Eğer worker'ları doldurabiliyorsak, başka job yükle
    if (activeJobs < maxConcurrentJobs) {
      db.get(
        `SELECT * FROM tuning_jobs WHERE status = 'queued' ORDER BY id ASC LIMIT 1`,
        (err, job) => {
          if (!job) return;
          
          db.run(`UPDATE tuning_jobs SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [job.id]);
          
          broadcastJobUpdate(job.id, { type: "progress", jobId: job.id, message: "İşlem başlandı", activeJobs });
          
          let fileIds = [];
          db.all(`SELECT id FROM ecu_files WHERE user_id = ? LIMIT 2`, [job.user_id], (err, files) => {
            fileIds = files.map(f => f.id);
            const params = JSON.parse(job.parameters_json || "{}");
            processJob(job.id, fileIds, job.strategy, job.model || "balanced", params);
          });
        }
      );
    }
  }, 1000); // Daha sık poll (1 saniye)
}

module.exports = { processJob, startQueue, getActiveJobs: () => activeJobs, getMaxWorkers: () => NUM_WORKERS };
