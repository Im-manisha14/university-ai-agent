// ─── Dashboard ───────────────────────────────────────────────
// High-level overview: metrics, recent agents, activity log
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAgents, deleteAgent, getStats } from "../services/api";

const DOMAIN_LABEL = {
  students: "Student Mgmt",
  faculty: "Faculty Mgmt",
  courses: "Course Mgmt",
  attendance: "Attendance",
  exams: "Exams",
};

export default function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [agentsRes, statsRes] = await Promise.all([getAgents(), getStats()]);
      setAgents(agentsRes.data.data);
      setStats(statsRes.data.data);
    } catch {
      showToast("Could not reach backend. Is the server running?", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function showToast(msg, type = "info") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Remove agent "${name}"?`)) return;
    try {
      await deleteAgent(id);
      setAgents((prev) => prev.filter((a) => a.id !== id));
      showToast(`Agent "${name}" removed.`);
    } catch {
      showToast("Failed to delete agent.", "error");
    }
  }

  const metrics = stats
    ? [
        { label: "Active Agents",    value: stats.totalAgents },
        { label: "Students",         value: stats.totalStudents },
        { label: "Faculty Members",  value: stats.totalFaculty },
        { label: "Courses",          value: stats.totalCourses },
        { label: "Total Interactions", value: stats.totalInteractions },
      ]
    : [];

  return (
    <div className="page-content">
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="text-heading" style={{marginBottom:4}}>
          University AI Operations
        </h1>
        <p className="text-body" style={{color:"var(--color-text-3)"}}>
          Manage your AI agents and monitor institutional data from one place.
        </p>
      </div>

      {/* Metrics */}
      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:32 }}>
          {[...Array(5)].map((_,i) => (
            <div key={i} className="metric-card" style={{height:80, background:"#f3f4f6"}} />
          ))}
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:32 }}>
          {metrics.map((m) => (
            <div key={m.label} className="metric-card">
              <div className="metric-value">{m.value}</div>
              <div className="metric-label">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Agents table */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, alignItems:"start" }}>
        {/* Left: Agents */}
        <section>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <h2 className="text-subheading" style={{fontSize:"0.9375rem"}}>Configured Agents</h2>
            <div style={{display:"flex",gap:8}}>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate("/agents")}>
                View all
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/create")}>
                + New Agent
              </button>
            </div>
          </div>

          {loading ? (
            <div className="card" style={{padding:"40px 0",textAlign:"center",color:"var(--color-text-4)"}}>
              Loading…
            </div>
          ) : agents.length === 0 ? (
            <div className="card" style={{padding:"40px 24px",textAlign:"center"}}>
              <p className="text-body" style={{marginBottom:12,color:"var(--color-text-3)"}}>
                No agents configured yet.
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/create")}>
                Create your first agent
              </button>
            </div>
          ) : (
            <div className="card" style={{overflow:"hidden"}}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Domain</th>
                    <th>Status</th>
                    <th style={{width:72}}></th>
                  </tr>
                </thead>
                <tbody>
                  {agents.slice(0, 6).map((agent) => (
                    <tr key={agent.id}>
                      <td>
                        <span style={{fontWeight:500,color:"var(--color-text-1)"}}>
                          {agent.name}
                        </span>
                        <div className="text-caption" style={{marginTop:1}}>
                          {agent.chatHistory?.length || 0} conversations
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-indigo">
                          {DOMAIN_LABEL[agent.domain] || agent.domain}
                        </span>
                      </td>
                      <td>
                        <span style={{display:"flex",alignItems:"center",gap:5,fontSize:"0.75rem",color:"var(--color-success)"}}>
                          <span className="status-dot active" />
                          Active
                        </span>
                      </td>
                      <td>
                        <div style={{display:"flex",gap:4}}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => navigate(`/chat/${agent.id}`)}
                            title="Open Chat"
                          >
                            Chat
                          </button>
                          <button
                            className="btn btn-danger-ghost btn-sm"
                            onClick={() => handleDelete(agent.id, agent.name)}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Right: Recent activity */}
        <section>
          <div style={{ marginBottom:14 }}>
            <h2 className="text-subheading" style={{fontSize:"0.9375rem"}}>Recent Activity</h2>
          </div>
          <div className="card" style={{overflow:"hidden"}}>
            {!stats || !stats.recentLogs || stats.recentLogs.length === 0 ? (
              <div style={{padding:"40px 24px",textAlign:"center",color:"var(--color-text-4)",fontSize:"0.8125rem"}}>
                No activity yet. Start chatting with an agent.
              </div>
            ) : (
              <div>
                {stats.recentLogs.slice(0, 7).map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display:"flex", alignItems:"flex-start", gap:12,
                      padding:"11px 16px",
                      borderBottom:"1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        width:28, height:28, borderRadius:6,
                        background:"var(--color-accent-lt)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:10, fontWeight:700, color:"var(--color-accent)",
                        flexShrink:0, marginTop:1
                      }}
                    >
                      {(log.agentName || "?").substring(0,2).toUpperCase()}
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                        <span style={{fontSize:"0.75rem",fontWeight:600,color:"var(--color-text-2)"}}>
                          {log.agentName}
                        </span>
                        <span className="text-caption">
                          {new Date(log.timestamp).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
                        </span>
                      </div>
                      <p style={{fontSize:"0.8125rem",color:"var(--color-text-3)",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {log.userMessage}
                      </p>
                      {log.aiAction && (
                        <span className="chat-action-pill" style={{marginTop:4}}>
                          {log.aiAction.replace(/_/g," ")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast" style={{background: toast.type==="error" ? "var(--color-danger)" : "var(--color-text-1)"}}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}


