// ============================================================
// AUTH CONTROLLER — Handles login for students and faculty
// ============================================================

const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const pool   = require("../db");

const JWT_SECRET  = process.env.JWT_SECRET  || "zenai_jwt_secret_university_2026";
const JWT_EXPIRES = "8h";

// ---- Student Login ----
async function studentLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM students WHERE email = $1", [email.toLowerCase().trim()]
    );
    const student = result.rows[0];
    if (!student) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, student.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: student.id, email: student.email, name: student.name, role: "student" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        department: student.department,
        year: student.year,
        gpa: student.gpa,
        roll_number: student.roll_number,
        role: "student",
      },
    });
  } catch (err) {
    console.error("Student login error:", err.message);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
}

// ---- Faculty Login ----
async function facultyLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM faculty WHERE email = $1", [email.toLowerCase().trim()]
    );
    const faculty = result.rows[0];
    if (!faculty) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, faculty.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: faculty.id, email: faculty.email, name: faculty.name, role: "faculty" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        designation: faculty.designation,
        subjects: faculty.subjects,
        role: "faculty",
      },
    });
  } catch (err) {
    console.error("Faculty login error:", err.message);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
}

// ---- Get current user profile (protected) ----
async function getMe(req, res) {
  const { id, role } = req.user;
  try {
    let result;
    if (role === "student") {
      result = await pool.query(
        "SELECT id, name, email, department, year, gpa, roll_number FROM students WHERE id = $1", [id]
      );
    } else {
      result = await pool.query(
        "SELECT id, name, email, department, designation, subjects FROM faculty WHERE id = $1", [id]
      );
    }
    const user = result.rows[0];
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.json({ success: true, user: { ...user, role } });
  } catch (err) {
    console.error("getMe error:", err.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

module.exports = { studentLogin, facultyLogin, getMe };
