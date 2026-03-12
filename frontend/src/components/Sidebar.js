// ─── Sidebar Navigation ───────────────────────────────────────
// Persistent left-side nav — enterprise SaaS layout pattern
// ─────────────────────────────────────────────────────────────

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  {
    section: "Overview",
    items: [
      { to: "/", label: "Dashboard", exact: true, icon: <GridIcon /> },
      { to: "/analytics", label: "Analytics", icon: <ChartIcon /> },
    ],
  },
  {
    section: "Agents",
    items: [
      { to: "/agents", label: "All Agents", icon: <AgentIcon /> },
      { to: "/create", label: "New Agent", icon: <PlusIcon /> },
    ],
  },
  {
    section: "Account",
    items: [
      { to: "/profile", label: "My Profile", icon: <ProfileIcon /> },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
    if (onClose) onClose();
  }

  const initials = user
    ? user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <aside className={`sidebar${isOpen ? " sidebar-open" : ""}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">ZN</div>
        <span className="sidebar-logo-text">
          ZEN<span>AI</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.map((group) => (
          <div key={group.section}>
            <div className="sidebar-section-label">{group.section}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `nav-item${isActive ? " active" : ""}`
                }
                onClick={onClose}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className={`sidebar-user-avatar ${user.role === "faculty" ? "faculty-avatar" : "student-avatar"}`}>
              {initials}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className={`sidebar-user-role ${user.role === "faculty" ? "faculty-role" : "student-role"}`}>
                {user.role === "faculty" ? "Faculty" : "Student"} · {user.department}
              </div>
            </div>
          </div>
        )}
        <button className="sidebar-logout-btn" onClick={handleLogout} title="Sign out">
          <LogoutIcon /> Sign Out
        </button>
        <div style={{ marginTop: "0.75rem", fontSize: "0.7rem", color: "var(--color-text-4)" }}>
          University Portal · v1.0
        </div>
      </div>
    </aside>
  );
}

// ─── Icon primitives (inline SVG, no dependencies) ───────────

function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg" style={{width:16,height:16}}>
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    </svg>
  );
}

function AgentIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg" style={{width:16,height:16}}>
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg" style={{width:16,height:16}}>
      <polyline points="1.5,12.5 5.5,7.5 8.5,9.5 14.5,3.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1.5" y1="14.5" x2="14.5" y2="14.5" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg" style={{width:16,height:16}}>
      <line x1="8" y1="2.5" x2="8" y2="13.5" strokeLinecap="round" />
      <line x1="2.5" y1="8" x2="13.5" y2="8" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg" style={{width:14,height:14,marginRight:6}}>
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" strokeLinecap="round"/>
      <polyline points="10.5,5 14,8 10.5,11" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="14" y1="8" x2="6" y2="8" strokeLinecap="round"/>
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg" style={{width:16,height:16}}>
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M3 14c0-2.761 2.239-4.5 5-4.5s5 1.739 5 4.5" strokeLinecap="round" />
    </svg>
  );
}
