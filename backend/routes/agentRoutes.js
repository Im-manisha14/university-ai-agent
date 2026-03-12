// ============================================================
// AGENT ROUTES — RESTful API for agent management
// ============================================================

const express = require("express");
const router = express.Router();
const {
  getAllAgents,
  getAgent,
  createAgent,
  deleteAgent,
  getAgentLogs,
} = require("../controllers/agentController");

// GET  /api/agents          — List all agents
router.get("/", getAllAgents);

// GET  /api/agents/:id      — Get single agent details
router.get("/:id", getAgent);

// POST /api/agents          — Create a new agent (auto-generates from purpose)
router.post("/", createAgent);

// DELETE /api/agents/:id    — Delete an agent
router.delete("/:id", deleteAgent);

// GET  /api/agents/:id/logs — Get action logs for an agent
router.get("/:id/logs", getAgentLogs);

module.exports = router;
