const express = require("express");
const router = express.Router();

// Import route modules
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const recordRoutes = require("./recordRoutes");
const patientRoutes = require("./patientRoutes");

// Use routes
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/records", recordRoutes);
router.use("/patients", patientRoutes);

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    message: "Plural Backend API",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      auth: "/api/auth",
      records: "/api/records",
      patients: "/api/patients",
      health: "/health",
    },
  });
});

module.exports = router;
