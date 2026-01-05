const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const licenseRoutes = require("./routes/license");
const licenseCheckRoutes = require("./routes/licenseCheck");
const cmsRoutes = require("./routes/cms");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/license", licenseRoutes);
app.use("/api/license", licenseCheckRoutes);
app.use("/api/cms", cmsRoutes);

app.get("/", (req, res) => {
  res.json({ status: "Nexaven Backend Online" });
});

app.listen(5000, () => {
  console.log("✅ Nexaven Backend 5000 portunda çalışıyor");
});
