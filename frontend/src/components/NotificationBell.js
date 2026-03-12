import React, { useState, useEffect, useRef, useCallback } from "react";
import { getAlerts, getAlertCount, markAlertRead, markAllAlertsRead } from "../services/api";

const SEVERITY_COLORS = {
  high:   { bg: "#fef2f2", border: "#fca5a5", text: "#dc2626", dot: "#ef4444" },
  medium: { bg: "#fffbeb", border: "#fcd34d", text: "#d97706", dot: "#f59e0b" },
  low:    { bg: "#f0fdf4", border: "#86efac", text: "#16a34a", dot: "#22c55e" },
};

export default function NotificationBell() {
  const [alerts, setAlerts] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchCount = useCallback(async () => {
    try {
      const res = await getAlertCount();
      setUnread(res.data.data.unreadCount);
    } catch { /* ignore */ }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await getAlerts();
      setAlerts(res.data.data.alerts || []);
      setUnread(res.data.data.unreadCount || 0);
    } catch { /* ignore */ }
  }, []);

  // Poll unread count every 30s
  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => clearInterval(id);
  }, [fetchCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleToggle() {
    if (!open) fetchAlerts();
    setOpen((v) => !v);
  }

  async function handleMarkRead(alertId) {
    await markAlertRead(alertId);
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)));
    setUnread((c) => Math.max(0, c - 1));
  }

  async function handleMarkAllRead() {
    await markAllAlertsRead();
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    setUnread(0);
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={handleToggle}
        style={{
          background: "none", border: "none", cursor: "pointer",
          position: "relative", padding: 4, display: "flex", alignItems: "center",
        }}
        title="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-2)"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 0, right: 0,
            background: "#ef4444", color: "#fff",
            fontSize: 10, fontWeight: 700,
            width: unread > 9 ? 20 : 16, height: 16,
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid var(--color-surface)",
          }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="notification-dropdown" style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: 380, maxHeight: 460,
          background: "var(--color-surface)", border: "1px solid var(--color-border)",
          borderRadius: 10, boxShadow: "0 12px 32px rgba(0,0,0,.12)",
          zIndex: 1000, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px", borderBottom: "1px solid var(--color-border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text-1)" }}>
              Notifications {unread > 0 && <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>({unread})</span>}
            </span>
            {unread > 0 && (
              <button onClick={handleMarkAllRead} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "0.75rem", color: "var(--color-accent)", fontWeight: 600,
              }}>
                Mark all read
              </button>
            )}
          </div>

          {/* Alerts list */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {alerts.length === 0 ? (
              <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--color-text-4)", fontSize: "0.85rem" }}>
                No notifications yet
              </div>
            ) : (
              alerts.map((alert) => {
                const sev = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.low;
                return (
                  <div
                    key={alert.id}
                    onClick={() => !alert.isRead && handleMarkRead(alert.id)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--color-border)",
                      background: alert.isRead ? "transparent" : sev.bg,
                      cursor: alert.isRead ? "default" : "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      {/* Severity dot */}
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: sev.dot, marginTop: 5, flexShrink: 0,
                        opacity: alert.isRead ? 0.3 : 1,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: "0.8125rem", fontWeight: alert.isRead ? 500 : 700,
                          color: alert.isRead ? "var(--color-text-3)" : "var(--color-text-1)",
                          marginBottom: 2,
                        }}>
                          {alert.title}
                        </div>
                        <div style={{
                          fontSize: "0.75rem",
                          color: alert.isRead ? "var(--color-text-4)" : "var(--color-text-2)",
                          lineHeight: 1.4,
                        }}>
                          {alert.message}
                        </div>
                        <div style={{
                          fontSize: "0.6875rem", color: "var(--color-text-4)",
                          marginTop: 4, display: "flex", alignItems: "center", gap: 8,
                        }}>
                          <span style={{
                            padding: "1px 6px", borderRadius: 4,
                            background: sev.bg, border: `1px solid ${sev.border}`,
                            color: sev.text, fontSize: "0.625rem", fontWeight: 600,
                            textTransform: "uppercase",
                          }}>
                            {alert.severity}
                          </span>
                          <span>{timeAgo(alert.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
