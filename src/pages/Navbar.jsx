import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("dailydev-user"));
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm("האם אתה בטוח שברצונך להתנתק?")) {
      // Clear API token
      api.logout();

      // Clear localStorage
      localStorage.removeItem("dailydev-user");

      // Navigate to login page
      navigate("/");
    }
  };

  const navItems = [
    {
      path: "/HomePage",
      icon: "☖",
      label: "בית",
      description: "עמוד הבית",
    },
    {
      path: "/Journal",
      icon: "📝",
      label: "יומן",
      description: "יומן למידה",
    },
    {
      path: "/MissionPage",
      icon: "✅",
      label: "משימות",
      description: "ניהול משימות",
    },
    {
      path: "/Courses",
      icon: "🎓",
      label: "קורסים",
      description: "מעקב קורסים",
    },
  ];

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        {/* User Profile Section */}
        <div className="navbar-profile">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="profile-info">
            <span className="profile-name">{user?.name || "משתמש"}</span>
            <span className="profile-status">🟢 פעיל</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="navbar-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${
                location.pathname === item.path ? "active" : ""
              }`}
              title={item.description}
            >
              <div className="nav-icon">{item.icon}</div>
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
              <div className="nav-indicator"></div>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <div className="navbar-footer">
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="התנתק מהמערכת"
          >
            <span className="logout-icon"></span>
            <span className="logout-text">התנתק</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
