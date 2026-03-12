const express = require("express");
const router  = express.Router();
const { studentLogin, facultyLogin, getMe } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

// POST /api/auth/student/login
router.post("/student/login", studentLogin);

// POST /api/auth/faculty/login
router.post("/faculty/login", facultyLogin);

// GET  /api/auth/me  (protected — returns logged-in user profile)
router.get("/me", authenticateToken, getMe);

module.exports = router;
