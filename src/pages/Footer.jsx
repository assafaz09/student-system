import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="modern-footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section brand-section">
            <div className="brand-logo">
              <span className="logo-icon">🚀</span>
              <span className="brand-name">DailyDev</span>
            </div>
            <p className="brand-description">
              פלטפורמה דיגיטלית מתקדמת לניהול למידה והתקדמות אישית. בונים את
              העתיד של הלמידה הדיגיטלית.
            </p>
            <div className="social-links">
              <a
                href="https://www.linkedin.com/in/assafazran"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <span className="social-icon">💼</span>
                LinkedIn
              </a>
              <a href="mailto:assafaz09@gmail.com" className="social-link">
                <span className="social-icon">📧</span>
                Email
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="section-title">ניווט מהיר</h3>
            <ul className="footer-links">
              <li>
                <a href="/HomePage" className="footer-link">
                  <span className="link-icon">🏠</span>
                  דף הבית
                </a>
              </li>
              <li>
                <a href="/Journal" className="footer-link">
                  <span className="link-icon">📝</span>
                  יומן למידה
                </a>
              </li>
              <li>
                <a href="/MissionPage" className="footer-link">
                  <span className="link-icon">✅</span>
                  משימות
                </a>
              </li>
              <li>
                <a href="/Courses" className="footer-link">
                  <span className="link-icon">🎓</span>
                  קורסים
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <div className="footer-bottom-content">
            <div className="copyright">
              <span className="copyright-text">
                © 2025 DailyDev - כל הזכויות שמורות
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
