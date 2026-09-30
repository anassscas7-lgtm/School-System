import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDashboardForRole } from "../../components/ProtectedRoute";
import { clearAuthStorage } from "../../utils/authStorage";
import "./Login.css";

const AuthIcon = ({ type }) => {
  const paths = {
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    cap: <><path d="m22 10-10-5-10 5 10 5 10-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    lock: <><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    eyeOff: <><path d="m3 3 18 18" /><path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" /><path d="M9.88 4.24A10.9 10.9 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.36 3.56" /><path d="M6.61 6.61C3.98 8.38 2 12 2 12s3 8 10 8a10.8 10.8 0 0 0 4.39-.91" /></>,
    arrow: <path d="M5 12h14M13 5l7 7-7 7" />
  };

  return (
    <svg className="auth-line-icon" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

const Login = () => {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.loggedOut) {
      clearAuthStorage();
      setEmail("");
      setPassword("");
      setError("");
      setShowPassword(false);
      return;
    }

    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser?.role) {
        navigate(getDashboardForRole(savedUser.role), { replace: true });
      }
    } catch {
      localStorage.removeItem("user");
    }
  }, [location.state?.loggedOut, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (data.success) {
        clearAuthStorage();
        localStorage.setItem("user", JSON.stringify(data.user));
        setEmail("");
        setPassword("");
        navigate(getDashboardForRole(data.user.role), { replace: true });
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Cannot connect to server. Please ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="bg-dot bg-dot-left" />
      <div className="bg-dot bg-dot-right" />
      <div className="bg-orb bg-orb-top" />
      <div className="bg-orb bg-orb-bottom-left" />
      <div className="bg-orb bg-orb-bottom" />
      <div className="bg-line bg-line-right" />
      <div className="card">
        <div className="icon">ED</div>

        <h2>EduSync</h2>
        <p className="welcome">Welcome back</p>
        <span className="subtitle">Sign in to your account to continue</span>

        <div className="tabs">
          {[
            { key: "admin", icon: "shield" },
            { key: "teacher", icon: "users" },
            { key: "student", icon: "cap" }
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              className={role === item.key ? "tab active" : "tab"}
              onClick={() => {
                setRole(item.key);
                setError("");
              }}
            >
              <AuthIcon type={item.icon} />
              {item.key.charAt(0).toUpperCase() + item.key.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ color: "red", fontSize: "12px", marginBottom: "10px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form className="form" onSubmit={handleLogin} autoComplete="off">
          <label className="input-shell">
            <span className="input-icon"><AuthIcon type="mail" /></span>
            <input
              type="email"
              placeholder="Enter Your Email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
          </label>
          <label className="input-shell">
            <span className="input-icon"><AuthIcon type="lock" /></span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">
              <AuthIcon type="eyeOff" />
            </button>
          </label>
          <button type="submit" className="loginBtn" disabled={isLoading}>
            <span>{isLoading ? "Signing in..." : "Sign in"}</span>
            <AuthIcon type="arrow" />
          </button>
        </form>

        <div className="divider"><span>or</span></div>

        <p className="forgot"><AuthIcon type="lock" /> Forgot password?</p>
      </div>
    </div>
  );
};

export default Login;
