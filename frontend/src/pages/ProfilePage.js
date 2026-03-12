import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getStudentProfile, updateStudentProfile,
  getFacultyProfile, updateFacultyProfile,
} from "../services/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const isFaculty = user?.role === "faculty";
  return isFaculty ? <FacultyProfile /> : <StudentProfile />;
}

// ── Student Profile ────────────────────────────────────────

function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    getStudentProfile()
      .then((r) => { setProfile(r.data.data); setForm(r.data.data); })
      .catch(() => setMsg({ type: "error", text: "Failed to load profile" }));
  }, []);

  const EDITABLE = ["phone", "email", "address", "emergency_contact"];

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const payload = {};
      EDITABLE.forEach((k) => { if (form[k] !== undefined) payload[k] = form[k]; });
      await updateStudentProfile(payload);
      // Re-fetch updated profile
      const r = await getStudentProfile();
      setProfile(r.data.data);
      setForm(r.data.data);
      setEditing(false);
      setMsg({ type: "success", text: "Profile updated!" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-4)" }}>Loading profile…</div>;
  }

  const fields = [
    { key: "name", label: "Full Name" },
    { key: "email", label: "Email", editable: true },
    { key: "phone", label: "Phone", editable: true },
    { key: "roll_number", label: "Roll Number" },
    { key: "department", label: "Department" },
    { key: "year", label: "Year" },
    { key: "gpa", label: "GPA" },
    { key: "address", label: "Address", editable: true },
    { key: "emergency_contact", label: "Emergency Contact", editable: true },
  ];

  return (
    <ProfileShell
      title="Student Profile"
      initials={getInitials(profile.name)}
      subtitle={`${profile.department} · Year ${profile.year}`}
      avatarClass="student-avatar"
      editing={editing} setEditing={setEditing}
      saving={saving} onSave={handleSave} msg={msg}
    >
      <ProfileFields fields={fields} profile={profile} form={form} setForm={setForm} editing={editing} />
    </ProfileShell>
  );
}

// ── Faculty Profile ────────────────────────────────────────

function FacultyProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    getFacultyProfile()
      .then((r) => { setProfile(r.data.data); setForm(r.data.data); })
      .catch(() => setMsg({ type: "error", text: "Failed to load profile" }));
  }, []);

  const EDITABLE = ["phone", "email", "address", "specialization", "research_areas", "qualification", "experience"];

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const payload = {};
      EDITABLE.forEach((k) => { if (form[k] !== undefined) payload[k] = form[k]; });
      await updateFacultyProfile(payload);
      // Re-fetch updated profile
      const r = await getFacultyProfile();
      setProfile(r.data.data);
      setForm(r.data.data);
      setEditing(false);
      setMsg({ type: "success", text: "Profile updated!" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-4)" }}>Loading profile…</div>;
  }

  const fields = [
    { key: "name", label: "Full Name" },
    { key: "email", label: "Email", editable: true },
    { key: "phone", label: "Phone", editable: true },
    { key: "department", label: "Department" },
    { key: "designation", label: "Designation" },
    { key: "specialization", label: "Specialization", editable: true },
    { key: "qualification", label: "Qualification", editable: true },
    { key: "experience", label: "Experience", editable: true },
    { key: "research_areas", label: "Research Areas", editable: true },
    { key: "address", label: "Address", editable: true },
  ];

  return (
    <ProfileShell
      title="Faculty Profile"
      initials={getInitials(profile.name)}
      subtitle={`${profile.department} · ${profile.designation}`}
      avatarClass="faculty-avatar"
      editing={editing} setEditing={setEditing}
      saving={saving} onSave={handleSave} msg={msg}
    >
      <ProfileFields fields={fields} profile={profile} form={form} setForm={setForm} editing={editing} />
    </ProfileShell>
  );
}

// ── Shared Components ──────────────────────────────────────

function ProfileShell({ title, initials, subtitle, avatarClass, editing, setEditing, saving, onSave, msg, children }) {
  return (
    <div className="page-content">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-1)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          {title}
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)" }}>
          View and manage your personal information.
        </p>
      </div>

      {msg && (
        <div style={{
          padding: "10px 16px", borderRadius: 8, marginBottom: 16,
          background: msg.type === "success" ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${msg.type === "success" ? "#86efac" : "#fca5a5"}`,
          color: msg.type === "success" ? "#16a34a" : "#dc2626",
          fontSize: "0.85rem", fontWeight: 600,
        }}>
          {msg.text}
        </div>
      )}

      <div className="card card-padded">
        {/* Avatar header */}
        <div className="profile-header" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--color-border)" }}>
          <div className={`sidebar-user-avatar ${avatarClass}`} style={{ width: 56, height: 56, fontSize: "1.2rem" }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--color-text-1)" }}>{initials}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-3)" }}>{subtitle}</div>
          </div>
          <div className="profile-actions" style={{ display: "flex", gap: 8 }}>
            {editing ? (
              <>
                <button className="btn btn-secondary" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
                <button className="btn btn-primary" onClick={onSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
            )}
          </div>
        </div>

        {/* Fields */}
        {children}
      </div>
    </div>
  );
}

function ProfileFields({ fields, profile, form, setForm, editing }) {
  return (
    <div className="profile-grid">
      {fields.map((f) => {
        const value = editing ? (form[f.key] ?? "") : (profile[f.key] ?? "–");
        const canEdit = editing && f.editable;

        return (
          <div key={f.key}>
            <label style={{
              display: "block", fontSize: "0.75rem", fontWeight: 600,
              color: "var(--color-text-4)", marginBottom: 4, textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}>
              {f.label}
              {f.editable && <span style={{ color: "var(--color-accent)", marginLeft: 4 }}>•</span>}
            </label>
            {canEdit ? (
              <input
                type="text"
                value={value}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                style={{
                  width: "100%", padding: "8px 12px",
                  border: "1px solid var(--color-border)", borderRadius: 6,
                  fontSize: "0.875rem", color: "var(--color-text-1)",
                  background: "var(--color-surface)",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--color-accent)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--color-border)"; }}
              />
            ) : (
              <div style={{
                padding: "8px 12px", borderRadius: 6,
                background: "var(--color-bg)", border: "1px solid transparent",
                fontSize: "0.875rem", color: "var(--color-text-2)",
              }}>
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
