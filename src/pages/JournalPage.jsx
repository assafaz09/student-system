import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Navbar from "./Navbar";

import "./JournalPage.css";

export default function JournalPage() {
  const navigate = useNavigate();
  const [learned, setLearned] = useState("");
  const [challenges, setChallenges] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("dailydev-user"));
    if (savedUser && api.isAuthenticated()) {
      loadEntries();
    } else {
      navigate("/");
    }
  }, [navigate]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const response = await api.getJournalEntries();
      const serverEntries = response.data || [];
      setEntries(serverEntries);
    } catch (error) {
      console.error("Failed to load journal entries:", error);
      alert("שגיאה בטעינת היומן. אנא נסה שוב.");
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!learned || !challenges || !timeSpent) {
      alert("נא למלא את כל השדות");
      return;
    }

    if (isNaN(timeSpent) || timeSpent <= 0) {
      alert("נא להזין מספר דקות תקין");
      return;
    }

    setIsLoading(true);

    try {
      const newEntry = {
        learned,
        challenges,
        timeSpent: parseInt(timeSpent),
        mood: "בסדר", // default mood
        tags: [], // default empty tags
        isPublic: false, // default private
      };

      // Save to server
      const response = await api.saveJournalEntry(newEntry);
      console.log("Journal entry saved:", response);

      // Update local state with the response data
      setEntries([response.data, ...entries]);

      // Reset form
      setLearned("");
      setChallenges("");
      setTimeSpent("");

      alert("היומן נשמר בהצלחה! 🎉");
    } catch (error) {
      console.error("Failed to save journal entry:", error);
      alert("שגיאה בשמירת היומן. אנא נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStats = () => {
    const totalEntries = entries.length;
    const totalMinutes = entries.reduce(
      (sum, entry) => sum + (entry.timeSpent || 0),
      0
    );
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const averageMinutes =
      totalEntries > 0 ? Math.round(totalMinutes / totalEntries) : 0;
    const thisWeek = entries.filter((entry) => {
      const entryDate = new Date(entry.date || entry.Date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    }).length;

    return { totalEntries, totalMinutes, totalHours, averageMinutes, thisWeek };
  };

  const stats = getStats();

  const filteredEntries = entries.filter((entry) => {
    if (filter === "week") {
      const entryDate = new Date(entry.date || entry.Date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    }
    if (filter === "month") {
      const entryDate = new Date(entry.date || entry.Date);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return entryDate >= monthAgo;
    }
    return true;
  });

  return (
    <>
      <Navbar />
      <div className="journal-page">
        {/* Header Section */}
        <div className="journal-header">
          <div className="header-content">
            <h1>
              <span className="icon"></span>
              יומן הלמידה שלי
            </h1>
            <p>בוא נתעד את הלמידה שלך ונעקוב אחרי ההתקדמות</p>
            <div className="inspiration-quote">
              <span className="quote-icon">💡</span>
              <p>
                "אנחנו מכירים את זה מקרוב – שעות ארוכות מול המסך, למידה אינסופית
                בלי רגע לעצור ולעכל. כאן תוכלו לקחת הפסקה קטנה, לעצור לרגע
                ולרשום לעצמכם מה למדתם, באילו דברים התקדמתם, וגם אילו קשיים
                פגשתם בדרך."
              </p>
            </div>
          </div>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalEntries}</div>
              <div className="stat-label">רשומות ביומן</div>
            </div>
            <div className="stat-card time">
              <div className="stat-number">{stats.totalHours}h</div>
              <div className="stat-label">סה"כ שעות</div>
            </div>
            <div className="stat-card average">
              <div className="stat-number">{stats.averageMinutes}m</div>
              <div className="stat-label">ממוצע יומי</div>
            </div>
            <div className="stat-card week">
              <div className="stat-number">{stats.thisWeek}</div>
              <div className="stat-label">השבוע</div>
            </div>
          </div>
        </div>
        {/* Main Content Grid */}
        <div className="journal-content">
          <div className="journal-form-container">
            <h2>
              <span className="icon"></span>
              רשימת הלמידה של היום
            </h2>
            <form className="journal-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>מה למדת היום?</label>
                <textarea
                  placeholder="ספר על הטכנולוגיות, המושגים או הכלים החדשים שלמדת..."
                  value={learned}
                  onChange={(e) => setLearned(e.target.value)}
                  disabled={isLoading}
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label>אילו אתגרים פגשת?</label>
                <textarea
                  placeholder="תאר את הקשיים שנתקלת בהם, באגים שפתרת, או בעיות שעדיין מחכות לפתרון..."
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  disabled={isLoading}
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label>כמה זמן הקדשת ללמידה? (בדקות)</label>
                <input
                  type="number"
                  placeholder="120"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(e.target.value)}
                  disabled={isLoading}
                  min="1"
                  required
                />
              </div>
              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    שומר...
                  </>
                ) : (
                  <>
                    <span className="icon"></span>
                    שמור ביומן
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="entries-container">
            <div className="entries-header">
              <h2>
                <span className="icon"></span>
                היסטוריית הלמידה ({filteredEntries.length})
              </h2>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  הכל
                </button>
                <button
                  className={`filter-btn ${filter === "week" ? "active" : ""}`}
                  onClick={() => setFilter("week")}
                >
                  השבוע
                </button>
                <button
                  className={`filter-btn ${filter === "month" ? "active" : ""}`}
                  onClick={() => setFilter("month")}
                >
                  החודש
                </button>
              </div>
            </div>
            {isLoading ? (
              <div className="loading-container">
                <div className="spinner large"></div>
                <p>טוען רשומות...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"></div>
                <h3>אין רשומות ביומן</h3>
                <p>התחל לתעד את הלמידה שלך כדי לעקוב אחר ההתקדמות</p>
              </div>
            ) : (
              <div className="entries-list">
                {filteredEntries.map((entry, index) => (
                  <div key={entry.id || index} className="entry-card">
                    <div className="entry-header">
                      <div className="entry-date">
                        <span className="icon"></span>
                        {new Date(entry.date || entry.Date).toLocaleDateString(
                          "he-IL"
                        )}
                      </div>
                      <div className="entry-time">
                        <span className="icon"></span>
                        {entry.timeSpent} דקות
                      </div>
                    </div>
                    <div className="entry-content">
                      <div className="entry-section">
                        <h4>
                          <span className="section-icon">✔</span>
                          מה למדתי:
                        </h4>
                        <p>{entry.learned}</p>
                      </div>
                      <div className="entry-section">
                        <h4>
                          <span className="section-icon">➶</span>
                          אתגרים:
                        </h4>
                        <p>{entry.challenges}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
