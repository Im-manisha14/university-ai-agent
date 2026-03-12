// ============================================================
// API SERVICE — Axios client for communicating with the backend
// ============================================================

import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ---- Agent APIs ----

export const getAgents = () => api.get("/agents");

export const getAgent = (id) => api.get(`/agents/${id}`);

export const createAgent = (purpose) => api.post("/agents", { purpose });

export const deleteAgent = (id) => api.delete(`/agents/${id}`);

export const getAgentLogs = (id) => api.get(`/agents/${id}/logs`);

// ---- Chat APIs ----

export const sendMessage = (agentId, message) =>
  api.post(`/chat/${agentId}`, { message });

export const getChatHistory = (agentId) =>
  api.get(`/chat/${agentId}/history`);

// ---- Data / Analytics APIs ----

export const getStats = () => api.get("/data/stats");

export const getLogs = () => api.get("/data/logs");

export default api;
