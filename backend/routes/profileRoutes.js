// ============================================================
// PROFILE ROUTES — View and update student/faculty profiles
// ============================================================

const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

// ── Student Profile ─────────────────────────────────────────

// GET /api/profile/student
router.get("/student", authenticateToken, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ success: false, message: "Student access only" });
  }
  try {
    const result = await pool.query(
      `SELECT id, name, email, department, year, gpa, roll_number, created_at FROM students WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    const s = result.rows[0];
    res.json({
      success: true,
      data: {
        id: s.id,
        name: s.name,
        email: s.email,
        department: s.department,
        year: s.year,
        gpa: parseFloat(s.gpa),
        roll_number: s.roll_number,
        phone: s.phone || null,
        address: s.address || null,
        emergency_contact: s.emergency_contact || null,
        status: "active",
        created_at: s.created_at,
      },
    });
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/profile/student
router.put("/student", authenticateToken, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ success: false, message: "Student access only" });
  }

  const ALLOWED_FIELDS = ["phone", "email", "address", "emergency_contact"];
  const updates = {};
  for (const field of ALLOWED_FIELDS) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: "No valid fields to update" });
  }

  // Validation
  if (updates.phone && !/^\d{10}$/.test(updates.phone)) {
    return res.status(400).json({ success: false, message: "Phone must be 10 digits" });
  }
  if (updates.email && !/^[\w.-]+@[\w.-]+\.\w+$/.test(updates.email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  try {
    // Check if columns exist, add them if not
    const VALID_COLS = ["phone", "address", "emergency_contact"];
    for (const col of VALID_COLS) {
      if (updates[col] !== undefined) {
        await pool.query(
          `ALTER TABLE students ADD COLUMN IF NOT EXISTS "${col}" VARCHAR(200)`
        );
      }
    }

    const setClauses = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(updates)) {
      setClauses.push(`"${key}" = $${idx}`);
      values.push(val);
      idx++;
    }
    values.push(req.user.id);

    await pool.query(
      `UPDATE students SET ${setClauses.join(", ")} WHERE id = $${idx}`,
      values
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      updated_fields: Object.keys(updates),
    });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── Faculty Profile ─────────────────────────────────────────

// GET /api/profile/faculty
router.get("/faculty", authenticateToken, async (req, res) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ success: false, message: "Faculty access only" });
  }
  try {
    const result = await pool.query(
      `SELECT id, name, email, department, designation, subjects, created_at FROM faculty WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }
    const f = result.rows[0];
    res.json({
      success: true,
      data: {
        id: f.id,
        name: f.name,
        email: f.email,
        department: f.department,
        designation: f.designation,
        subjects: f.subjects,
        phone: f.phone || null,
        address: f.address || null,
        specialization: f.specialization || null,
        research_areas: f.research_areas || null,
        qualification: f.qualification || null,
        experience: f.experience || null,
        created_at: f.created_at,
      },
    });
  } catch (err) {
    console.error("Faculty profile fetch error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/profile/faculty
router.put("/faculty", authenticateToken, async (req, res) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ success: false, message: "Faculty access only" });
  }

  const ALLOWED_FIELDS = ["phone", "email", "address", "specialization", "research_areas", "qualification", "experience"];
  const updates = {};
  for (const field of ALLOWED_FIELDS) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: "No valid fields to update" });
  }

  if (updates.phone && !/^\d{10}$/.test(updates.phone)) {
    return res.status(400).json({ success: false, message: "Phone must be 10 digits" });
  }
  if (updates.email && !/^[\w.-]+@[\w.-]+\.\w+$/.test(updates.email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  try {
    // Ensure columns exist
    const VALID_COLS = ["phone", "address", "specialization", "research_areas", "qualification", "experience"];
    for (const col of VALID_COLS) {
      if (updates[col] !== undefined) {
        const colType = col === "experience" ? "INTEGER" : "VARCHAR(200)";
        await pool.query(
          `ALTER TABLE faculty ADD COLUMN IF NOT EXISTS "${col}" ${colType}`
        );
      }
    }

    const setClauses = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(updates)) {
      setClauses.push(`"${key}" = $${idx}`);
      values.push(val);
      idx++;
    }
    values.push(req.user.id);

    await pool.query(
      `UPDATE faculty SET ${setClauses.join(", ")} WHERE id = $${idx}`,
      values
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      updated_fields: Object.keys(updates),
    });
  } catch (err) {
    console.error("Faculty profile update error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
