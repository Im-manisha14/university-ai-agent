// ============================================================
// EXPRESS SERVER — Entry point for the ZENAI backend
//
// Architecture:
//   Client → Express Routes → Controllers → AI Service → Action Router → JSON Data
//
// The server exposes 3 main API groups:
//   /api/agents  — Agent CRUD
//   /api/chat    — Conversational AI interface
//   /api/data    — Analytics and raw data access
// ============================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

// Route imports
const agentRoutes     = require("./routes/agentRoutes");
const chatRoutes      = require("./routes/chatRoutes");
const dataRoutes      = require("./routes/dataRoutes");
const authRoutes      = require("./routes/authRoutes");
const alertRoutes     = require("./routes/alertRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const profileRoutes   = require("./routes/profileRoutes");
const exportRoutes    = require("./routes/exportRoutes");

// Alert scheduler
const { startAlertScheduler } = require("./services/alertService");

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// Request logger for demo/debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ---- API Routes ----
app.use("/api/auth",      authRoutes);
app.use("/api/agents",    agentRoutes);
app.use("/api/chat",      chatRoutes);
app.use("/api/data",      dataRoutes);
app.use("/api/alerts",    alertRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/profile",   profileRoutes);
app.use("/api/export",    exportRoutes);

// ---- Health Check ----
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    platform: "ZENAI — AI Agent Platform for University Management",
    timestamp: new Date().toISOString(),
  });
});

// ---- Start Server ----
app.listen(PORT, () => {
  // Start the proactive alert scheduler (checks every 30s)
  startAlertScheduler(30000);

  console.log(`
╔══════════════════════════════════════════════════════════╗
║   ZENAI — AI Agent Platform for University Management   ║
║   Server running on http://localhost:${PORT}               ║
║                                                          ║
║   API Endpoints:                                         ║
║     GET    /api/health               Health check         ║
║     GET    /api/agents               List all agents      ║
║     POST   /api/agents               Create agent         ║
║     POST   /api/chat/:agentId        Send message         ║
║     GET    /api/alerts               User alerts          ║
║     GET    /api/analytics/student/*  Student analytics    ║
║     GET    /api/analytics/faculty/*  Faculty analytics    ║
║     GET    /api/profile/student      Student profile      ║
║     PUT    /api/profile/student      Update profile       ║
║     POST   /api/export/pdf           Export PDF           ║
║     POST   /api/export/excel         Export Excel         ║
╚══════════════════════════════════════════════════════════╝
  `);
});
