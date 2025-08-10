import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("נא למלא את כל השדות");
      setLoading(false);
      return;
    }

    try {
      const response = await api.login(email, password);
      console.log("Login successful:", response);

      // Store user info in localStorage for backward compatibility
      localStorage.setItem(
        "dailydev-user",
        JSON.stringify({
          name: response.user?.name || "User",
          email: email,
        })
      );

      navigate("/HomePage");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "שגיאה בהתחברות. אנא נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="centered-container">
        <div className="login-card main-card">
          <h1 className="login-title">!ברוך הבא</h1>
          <h2 className="login-subtitle">מערכת לניהול למידה נכונה</h2>

          {error && (
            <div
              className="error-message"
              style={{
                color: "#e74c3c",
                backgroundColor: "#fdf2f2",
                padding: "10px",
                borderRadius: "5px",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              disabled={loading}
            />
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "מתחבר..." : "התחבר"}
            </button>
          </form>
          <p className="login-switch-text">
            אין לך חשבון?{" "}
            <span
              className="login-switch-link"
              onClick={() => navigate("/register")}
            >
              להרשמה
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
