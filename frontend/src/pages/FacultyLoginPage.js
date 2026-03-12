import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { facultyLogin as apiFacultyLogin } from "../services/api";

export default function FacultyLoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiFacultyLogin(email, password);
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate("/");
      } else {
        setError(res.data.message || "Login failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        {/* Back */}
        <Link to="/login" className="login-back-link">← Back to role selection</Link>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="login-role-icon faculty-icon" style={{ margin: "0 auto 1rem" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" strokeLinecap="round"/>
              <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" strokeLinecap="round"/>
              <path d="M17 3l1.5 1.5L21 2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="login-title">Faculty Login</h1>
          <p style={{ color: "var(--color-text-3)", fontSize: "0.875rem" }}>
            Sign in to manage your courses and students
          </p>
        </div>

        {/* Demo hint */}
        <div
          className="login-hint faculty-hint"
          style={{ cursor: "pointer" }}
          title="Click to fill demo credentials"
          onClick={() => { setEmail("r.kumar@university.edu"); setPassword("Faculty123"); setError(""); }}
        >
          <strong>Demo:</strong> r.kumar@university.edu · Faculty123 <span style={{fontSize:"0.75rem",opacity:0.7}}>(click to fill)</span>
        </div>

        {/* Error */}
        {error && <div className="login-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">University Email</label>
            <input
              type="email"
              className="login-input"
              placeholder="you@university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-input-wrap">
              <input
                type={showPw ? "text" : "password"}
                className="login-input"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className="login-pw-toggle" onClick={() => setShowPw(p => !p)}>
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn faculty-submit-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In as Faculty"}
          </button>
        </form>

        <p className="login-footer-text" style={{ textAlign: "center", marginTop: "1.5rem" }}>
          Are you a student? <Link to="/login/student" className="login-link">Student Login →</Link>
        </p>
      </div>
    </div>
  );
}
