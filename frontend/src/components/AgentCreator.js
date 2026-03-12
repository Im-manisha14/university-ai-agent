import React, { useState } from "react";
import { createAgent } from "../services/api";
import { useNavigate } from "react-router-dom";

const TEMPLATES = [
  { label: "Student Mgmt", purpose: "Manage student records, enrollment, and GPA tracking" },
  { label: "Faculty Mgmt", purpose: "Manage faculty records, subject assignments, and workload" },
  { label: "Course Mgmt", purpose: "Manage courses, curriculum, and semester scheduling" },
  { label: "Attendance", purpose: "Track and report student attendance across courses" },
  { label: "Exam Mgmt", purpose: "Schedule and manage examinations and assessments" },
];

const DOMAIN_LABEL = {
  students: "Student Management",
  faculty: "Faculty Management",
  courses: "Course Management",
  attendance: "Attendance",
  exams: "Exam Management",
};

export default function AgentCreator({ onCreated }) {
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!purpose.trim()) { setError("Please describe the agent's purpose"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await createAgent(purpose.trim());
      setResult(res.data.data);
      setPurpose("");
      if (onCreated) onCreated(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create agent. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>

      {/* Section heading */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-1)", marginBottom: 6 }}>
          New AI Agent
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)", lineHeight: 1.6 }}>
          Describe what the agent should manage. The system will auto-generate its name,
          domain, allowed actions, and system prompt.
        </p>
      </div>

      {/* Quick templates */}
      <div style={{ marginBottom: 20 }}>
        <div className="text-label" style={{ marginBottom: 8 }}>Quick Templates</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              className="btn btn-secondary btn-sm"
              onClick={() => { setPurpose(t.purpose); setError(""); }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input form */}
      <div className="card" style={{ padding: "24px 24px 20px", marginBottom: 0 }}>
        <label className="form-label" htmlFor="agent-purpose">Agent Purpose</label>
        <textarea
          id="agent-purpose"
          className="form-input"
          style={{ minHeight: 88, resize: "vertical" }}
          value={purpose}
          onChange={(e) => { setPurpose(e.target.value); setError(""); }}
          placeholder="e.g. Manage student records, enrollment, and GPA tracking across departments…"
          rows={3}
        />

        {error && (
          <p style={{ marginTop: 6, fontSize: "0.8125rem", color: "var(--color-danger)" }}>{error}</p>
        )}

        <button
          className="btn btn-primary"
          style={{ marginTop: 16, width: "100%", justifyContent: "center" }}
          onClick={handleCreate}
          disabled={loading || !purpose.trim()}
        >
          {loading ? "Generating agent…" : "Generate Agent"}
        </button>
      </div>

      {/* Success result */}
      {result && (
        <div
          className="card"
          style={{
            marginTop: 20, padding: 24,
            borderColor: "var(--color-success-lt)",
            background: "var(--color-success-bg, #f0fdf4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-success)", display: "inline-block" }} />
            <span style={{ fontSize: "0.8125rem", color: "var(--color-success)", fontWeight: 600 }}>
              Agent created successfully
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8, background: "var(--color-accent-lt)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "var(--color-accent)", flexShrink: 0,
            }}>
              {result.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "var(--color-text-1)", fontSize: "0.9375rem" }}>
                {result.name}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", marginTop: 2 }}>
                {result.description}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
            <div>
              <div className="text-caption">Domain</div>
              <span className="badge badge-indigo" style={{ marginTop: 4, display: "inline-block" }}>
                {DOMAIN_LABEL[result.domain] || result.domain}
              </span>
            </div>
            <div>
              <div className="text-caption">Capabilities</div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-1)", marginTop: 4 }}>
                {result.allowedActions.length} actions
              </div>
            </div>
            <div>
              <div className="text-caption">Agent ID</div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-1)", marginTop: 4 }}>
                #{result.id}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/chat/${result.id}`)}
            >
              Open Chat
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setResult(null)}
            >
              Create Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
