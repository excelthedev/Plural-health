const express = require("express");
const router = express.Router();

// GET /api/users - Get all users
router.get("/", (req, res) => {
  res.json({
    message: "Get all users",
    users: [],
  });
});

// GET /api/users/:id - Get user by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  res.json({
    message: `Get user with ID: ${id}`,
    user: null,
  });
});

// POST /api/users - Create new user
router.post("/", (req, res) => {
  const userData = req.body;
  res.status(201).json({
    message: "User created successfully",
    user: userData,
  });
});

// PUT /api/users/:id - Update user
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  res.json({
    message: `User ${id} updated successfully`,
    user: updateData,
  });
});

// DELETE /api/users/:id - Delete user
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  res.json({
    message: `User ${id} deleted successfully`,
  });
});

module.exports = router;
