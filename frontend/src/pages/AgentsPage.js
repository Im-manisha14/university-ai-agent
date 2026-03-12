// ─── Agents Page ─────────────────────────────────────────────
// Full agents management table — list, open chat, delete
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AgentCard from "../components/AgentCard";
import { getAgents, deleteAgent } from "../services/api";

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const fetchAgents = useCallback(async () => {
    try {
      const res = await getAgents();
      setAgents(res.data.data);
    } catch {
      showToast("Failed to load agents.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  function showToast(msg, type = "info") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Remove agent "${name}"?`)) return;
    try {
      await deleteAgent(id);
      setAgents((prev) => prev.filter((a) => a.id !== id));
      showToast(`"${name}" deleted.`);
    } catch {
      showToast("Failed to delete.", "error");
    }
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="text-heading" style={{ marginBottom: 3 }}>Agents</h1>
          <p className="text-body" style={{ color: "var(--color-text-3)" }}>
            {agents.length} agent{agents.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/create")}>
          + New Agent
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card" style={{ padding: "60px 0", textAlign: "center", color: "var(--color-text-4)" }}>
          Loading…
        </div>
      ) : agents.length === 0 ? (
        <div className="card" style={{ padding: "60px 24px", textAlign: "center" }}>
          <p className="text-body" style={{ color: "var(--color-text-3)", marginBottom: 14 }}>
            No agents yet. Create one to get started.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/create")}>
            Create Agent
          </button>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Domain</th>
                <th>Capabilities</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div className="toast" style={{ background: toast.type === "error" ? "var(--color-danger)" : "var(--color-text-1)" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
