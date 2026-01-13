const express = require("express");
const cors = require("cors");
const compression = require("compression");
const path = require("path");
const http = require("http");

const authRoutes = require("./routes/auth");
const registerRoutes = require("./routes/register");
const licenseRoutes = require("./routes/license");
const licenseCheckRoutes = require("./routes/licenseCheck");
const cmsRoutes = require("./routes/cms");
const settingsRoutes = require("./routes/settings");
const notificationsRoutes = require("./routes/notifications");
const licenseRequestsRoutes = require("./routes/licenseRequests");
const dashboardRoutes = require("./routes/dashboard");
const zorluEcuRoutes = require("./routes/zorluEcu");
const adminRoutes = require("./routes/admin");
const modelsRoutes = require("./routes/models");
const { router: sseRoutes } = require("./routes/sse");
const { startQueue } = require("./services/aiWorker");
const { setupWebSocket } = require("./services/realtime");
const { apiLimiter, authLimiter, tuningLimiter } = require("./services/cache");

const app = express();
const server = http.createServer(app);

// Compression + CORS
app.use(compression());
app.use(cors());
app.use(express.json());

// Global rate limiter
app.use("/api/", apiLimiter);

// Setup WebSocket
setupWebSocket(server);

// Static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "../data/uploads"), {
  maxAge: "1d",
  etag: false
}));

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/license", licenseRoutes);
app.use("/api/license-check", licenseCheckRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/license-requests", licenseRequestsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/zorlu-ecu", zorluEcuRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/models", modelsRoutes);
app.use("/api/sse", sseRoutes);

// Tuning endpoint'ine özel rate limit
app.post("/api/zorlu-ecu/tuning", tuningLimiter, zorluEcuRoutes);

app.get("/", (req, res) => {
  res.json({ 
    status: "Nexaven Backend Online",
    version: "3.0",
    features: ["CMS", "Notifications", "License", "Zorlu ECU AI", "WebSocket+SSE", "Caching", "Compression", "Rate Limiting"]
  });
});

// Start AI worker queue
startQueue();

server.listen(5000, () => {
  console.log("✅ Nexaven Backend 5000 portunda çalışıyor");
  console.log("📁 Upload klasörü: ./data/uploads");
  console.log("🔄 WebSocket + SSE realtime enabled");
  console.log("💾 Caching ve Compression aktif");
  console.log("🛡️ Rate limiting aktif");
});

