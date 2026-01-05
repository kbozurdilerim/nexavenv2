const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const registerRoutes = require("./routes/register");
const licenseRoutes = require("./routes/license");
const licenseCheckRoutes = require("./routes/licenseCheck");
const cmsRoutes = require("./routes/cms");
const notificationsRoutes = require("./routes/notifications");
const licenseRequestsRoutes = require("./routes/licenseRequests");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
app.use(cors());
app.use(express.json());

// Static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "../data/uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/license", licenseRoutes);
app.use("/api/license-check", licenseCheckRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/license-requests", licenseRequestsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.json({ 
    status: "Nexaven Backend Online",
    version: "2.0",
    features: ["CMS", "Notifications", "License Requests", "Dashboard", "Image Upload"]
  });
});

app.listen(5000, () => {
  console.log("✅ Nexaven Backend 5000 portunda çalışıyor");
  console.log("📁 Upload klasörü: ./data/uploads");
});

