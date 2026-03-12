// ============================================================
// CHAT CONTROLLER — Processes conversational queries
// Pipeline: User Query → AI Service → Action Router → Response
// ============================================================

const { processQuery } = require("../services/aiService");
const { executeAction } = require("../services/actionRouter");
const { readData, writeData } = require("../services/dataService");

// OpenAI API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "your-gemini-api-key-here";

/**
 * POST /api/chat/:agentId — Send a message to an agent
 *
 * Complete workflow:
 *  1. Validate the agent exists
 *  2. Send query + system prompt to AI service
 *  3. Validate the AI's chosen action is allowed for this agent
 *  4. Execute the action via the action router
 *  5. Log the interaction
 *  6. Return conversational response + data to frontend
 */
async function sendMessage(req, res) {
  try {
    const agentId = parseInt(req.params.agentId);
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // Step 1: Find the agent
    const agents = readData("agents.json");
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    // Step 2: Send to AI service (Gemini or mock)
    const aiResult = await processQuery(agent.systemPrompt, message, GEMINI_API_KEY);

    let actionResult = null;
    let actionExecuted = null;

    // Step 3: If AI returned a structured action, validate and execute it
    if (aiResult.action && aiResult.action.action) {
      const actionName = aiResult.action.action;

      // Domain restriction check — agent can only execute its allowed actions
      if (agent.allowedActions.includes(actionName)) {
        // Step 4: Execute via action router
        actionResult = executeAction(actionName, aiResult.action.data || {});
        actionExecuted = actionName;
      } else {
        actionResult = {
          success: false,
          message: `Action "${actionName}" is not allowed for this agent. Allowed actions: ${agent.allowedActions.join(", ")}`,
          data: null,
        };
      }
    }

    // Step 5: Log the interaction
    const logs = readData("logs.json");
    const logEntry = {
      id: logs.length + 1,
      agentId: agent.id,
      agentName: agent.name,
      userMessage: message,
      aiAction: actionExecuted,
      actionData: aiResult.action?.data || null,
      result: actionResult ? actionResult.success : null,
      timestamp: new Date().toISOString(),
    };
    logs.push(logEntry);
    writeData("logs.json", logs);

    // Also store in agent's chat history
    const agentIdx = agents.findIndex((a) => a.id === agentId);
    if (!agents[agentIdx].chatHistory) agents[agentIdx].chatHistory = [];
    agents[agentIdx].chatHistory.push({
      user: message,
      ai: aiResult.response,
      action: actionExecuted,
      timestamp: new Date().toISOString(),
    });
    if (!agents[agentIdx].actionLog) agents[agentIdx].actionLog = [];
    if (actionExecuted) {
      agents[agentIdx].actionLog.push(logEntry);
    }
    writeData("agents.json", agents);

    // Step 6: Build final response for chat UI
    let responseText = aiResult.response;
    if (actionResult) {
      responseText = actionResult.message;
    }

    res.json({
      success: true,
      data: {
        response: responseText,
        action: actionExecuted,
        actionResult: actionResult,
        aiRawAction: aiResult.action,
      },
    });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * GET /api/chat/:agentId/history — Get chat history for an agent
 */
function getChatHistory(req, res) {
  const agents = readData("agents.json");
  const agent = agents.find((a) => a.id === parseInt(req.params.agentId));
  if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });
  res.json({ success: true, data: agent.chatHistory || [] });
}

module.exports = { sendMessage, getChatHistory };
