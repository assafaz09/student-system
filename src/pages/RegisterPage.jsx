import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./LoginPage.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError("נא למלא את כל השדות");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("הסיסמה חייבת להיות לפחות 6 תווים");
      setLoading(false);
      return;
    }

    try {
      const response = await api.register(name, email, password);
      console.log("Registration successful:", response);

      // Store user info in localStorage for backward compatibility
      localStorage.setItem(
        "dailydev-user",
        JSON.stringify({
          name: name,
          email: email,
        })
      );

      navigate("/HomePage");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "שגיאה בהרשמה. אנא נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="centered-container">
        <div className="login-card main-card">
          <h1 className="login-title">הרשמה</h1>
          <h2 className="login-subtitle">הצטרף למערכת לניהול למידה</h2>

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

          <form className="login-form" onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="שם מלא"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="login-input"
              disabled={loading}
            />
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
            <input
              type="password"
              placeholder="אימות סיסמה"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="login-input"
              disabled={loading}
            />
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "נרשם..." : "הרשמה"}
            </button>
          </form>
          <p className="login-switch-text">
            כבר רשום?{" "}
            <span className="login-switch-link" onClick={() => navigate("/")}>
              התחבר
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
