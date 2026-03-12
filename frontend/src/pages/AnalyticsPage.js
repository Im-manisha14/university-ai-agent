import React, { useState, useEffect } from "react";
import { getStats, getLogs } from "../services/api";

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getLogs()])
      .then(([sRes, lRes]) => { setStats(sRes.data.data); setLogs(lRes.data.data); })
      .catch((e) => console.error("Analytics fetch failed:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-content" style={{ color: "var(--color-text-4)", paddingTop: 60, textAlign: "center" }}>
        Loading analytics…
      </div>
    );
  }

  return (
    <div className="page-content">

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-1)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          Analytics
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)" }}>
          Agent activity, action logs, and platform-wide statistics.
        </p>
      </div>

      {/* Metric row */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { label: "Agents", value: stats.totalAgents },
            { label: "Students", value: stats.totalStudents },
            { label: "Faculty", value: stats.totalFaculty },
            { label: "Courses", value: stats.totalCourses },
            { label: "Interactions", value: stats.totalInteractions },
          ].map((s) => (
            <div key={s.label} className="metric-card">
              <div className="metric-value">{s.value ?? 0}</div>
              <div className="metric-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Action log */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text-1)" }}>Interaction Log</span>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-4)" }}>{logs.length} entries</span>
        </div>

        {logs.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "0.875rem", color: "var(--color-text-4)", marginBottom: 6 }}>No interactions yet</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-4)" }}>Chat with an agent to see activity here.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Agent</th>
                <th>Message</th>
                <th>Action Taken</th>
                <th>Result</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ color: "var(--color-text-4)", fontVariantNumeric: "tabular-nums" }}>{log.id}</td>
                  <td>
                    <span className="badge badge-indigo">{log.agentName}</span>
                  </td>
                  <td style={{
                    maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    color: "var(--color-text-2)",
                  }}>
                    {log.userMessage}
                  </td>
                  <td>
                    {log.aiAction
                      ? <span className="badge badge-gray">{log.aiAction.replace(/_/g, " ")}</span>
                      : <span style={{ color: "var(--color-text-4)" }}>—</span>}
                  </td>
                  <td>
                    {log.result === true
                      ? <span style={{ color: "var(--color-success)", fontWeight: 600, fontSize: "0.8125rem" }}>✓ OK</span>
                      : log.result === false
                        ? <span style={{ color: "var(--color-danger)", fontWeight: 600, fontSize: "0.8125rem" }}>✗ Fail</span>
                        : <span style={{ color: "var(--color-text-4)" }}>—</span>}
                  </td>
                  <td style={{ color: "var(--color-text-4)", whiteSpace: "nowrap" }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
