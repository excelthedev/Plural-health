const express = require("express");
const router = express.Router();

// POST /api/auth/register - User registration
router.post("/register", (req, res) => {
  const { email, password, name } = req.body;

  // Basic validation
  if (!email || !password || !name) {
    return res.status(400).json({
      message: "Email, password, and name are required",
    });
  }

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: "temp-id",
      email,
      name,
    },
  });
});

// POST /api/auth/login - User login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  res.json({
    message: "Login successful",
    token: "temp-jwt-token",
    user: {
      id: "temp-id",
      email,
    },
  });
});

// POST /api/auth/logout - User logout
router.post("/logout", (req, res) => {
  res.json({
    message: "Logout successful",
  });
});

// GET /api/auth/me - Get current user
router.get("/me", (req, res) => {
  res.json({
    message: "Current user info",
    user: {
      id: "temp-id",
      email: "user@example.com",
      name: "John Doe",
    },
  });
});

module.exports = router;
