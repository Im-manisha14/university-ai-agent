import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { studentLogin as apiStudentLogin } from "../services/api";

export default function StudentLoginPage() {
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
      const res = await apiStudentLogin(email, password);
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
          <div className="login-role-icon student-icon" style={{ margin: "0 auto 1rem" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L1 9l11 6 9-4.91V17M1 9v8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 13.5V18a8 8 0 01-16 0v-4.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="login-title">Student Login</h1>
          <p style={{ color: "var(--color-text-3)", fontSize: "0.875rem" }}>
            Sign in to access your university portal
          </p>
        </div>

        {/* Demo hint */}
        <div
          className="login-hint"
          style={{ cursor: "pointer" }}
          title="Click to fill demo credentials"
          onClick={() => { setEmail("rahul.sharma@university.edu"); setPassword("Student123"); setError(""); }}
        >
          <strong>Demo:</strong> rahul.sharma@university.edu · Student123 <span style={{fontSize:"0.75rem",opacity:0.7}}>(click to fill)</span>
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

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In as Student"}
          </button>
        </form>

        <p className="login-footer-text" style={{ textAlign: "center", marginTop: "1.5rem" }}>
          Are you faculty? <Link to="/login/faculty" className="login-link">Faculty Login →</Link>
        </p>
      </div>
    </div>
  );
}
