// ─── AgentRow ────────────────────────────────────────────────
// A table-row-style agent display used on the Agents page.
// Clean, structured, enterprise-grade — no colorful tiles.
// ─────────────────────────────────────────────────────────────

import React from "react";
import { useNavigate } from "react-router-dom";

const DOMAIN_LABEL = {
  students:   "Student Management",
  faculty:    "Faculty Management",
  courses:    "Course Management",
  attendance: "Attendance",
  exams:      "Exam Management",
};

export default function AgentCard({ agent, onDelete }) {
  const navigate = useNavigate();

  return (
    <tr>
      {/* Agent name + description */}
      <td style={{ minWidth: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 7,
              background: "var(--color-accent-lt)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "var(--color-accent)",
              flexShrink: 0,
            }}
          >
            {agent.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text-1)" }}>
              {agent.name}
            </div>
            <div className="text-caption" style={{ marginTop: 1, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {agent.description}
            </div>
          </div>
        </div>
      </td>

      {/* Domain */}
      <td>
        <span className="badge badge-indigo">
          {DOMAIN_LABEL[agent.domain] || agent.domain}
        </span>
      </td>

      {/* Capabilities count */}
      <td>
        <span style={{ fontSize: "0.8125rem", color: "var(--color-text-3)" }}>
          {agent.allowedActions?.length || 0} actions
        </span>
      </td>

      {/* Status */}
      <td>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", color: "var(--color-success)" }}>
          <span className="status-dot active" />
          Active
        </span>
      </td>

      {/* Last activity */}
      <td className="text-caption">
        {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : "—"}
      </td>

      {/* Actions */}
      <td>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(`/chat/${agent.id}`)}
          >
            Open Chat
          </button>
          <button
            className="btn btn-danger-ghost btn-sm"
            onClick={() => onDelete(agent.id, agent.name)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
