// ============================================================
// DATA ROUTES — Direct access to raw data for analytics/reports
// ============================================================

const express = require("express");
const router = express.Router();
const { readData } = require("../services/dataService");

// GET /api/data/stats — Overview statistics for the dashboard
router.get("/stats", (req, res) => {
  const students = readData("students.json");
  const faculty = readData("faculty.json");
  const courses = readData("courses.json");
  const agents = readData("agents.json");
  const logs = readData("logs.json");

  res.json({
    success: true,
    data: {
      totalStudents: students.length,
      totalFaculty: faculty.length,
      totalCourses: courses.length,
      totalAgents: agents.length,
      totalInteractions: logs.length,
      recentLogs: logs.slice(-10).reverse(),
    },
  });
});

// GET /api/data/logs — All action logs
router.get("/logs", (req, res) => {
  const logs = readData("logs.json");
  res.json({ success: true, data: logs.reverse() });
});

module.exports = router;
