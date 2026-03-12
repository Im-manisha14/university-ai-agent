// ─── Sidebar Navigation ───────────────────────────────────────
// Persistent left-side nav — enterprise SaaS layout pattern
// ─────────────────────────────────────────────────────────────

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

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
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
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
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ fontWeight: 500, color: "var(--color-text-3)", marginBottom: 2 }}>
          University Portal
        </div>
        <div>v1.0 · Hackathon Build</div>
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
