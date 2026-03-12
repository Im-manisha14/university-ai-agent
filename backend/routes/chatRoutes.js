// ============================================================
// CHAT ROUTES — API endpoints for conversational interactions
// ============================================================

const express = require("express");
const router = express.Router();
const { sendMessage, getChatHistory } = require("../controllers/chatController");

// POST /api/chat/:agentId          — Send a message to an agent
router.post("/:agentId", sendMessage);

// GET  /api/chat/:agentId/history   — Get chat history for an agent
router.get("/:agentId/history", getChatHistory);

module.exports = router;
