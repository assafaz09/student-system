import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import Navbar from "./Navbar";

import "./Mission.css";

export default function MissionPage() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("MissionPage useEffect - checking authentication");
    console.log("API isAuthenticated:", api.isAuthenticated());
    console.log("Token:", localStorage.getItem("dailydev-token"));

    if (api.isAuthenticated()) {
      loadTasks();
    } else {
      console.log("User not authenticated, redirecting to login");
      // You might want to redirect to login here
    }
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const response = await api.getTasks();
      const serverTasks = response.data || [];
      setTasks(serverTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      alert("שגיאה בטעינת המשימות. אנא נסה שוב.");
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName || !dueDate) {
      alert("אנא מלא את כל השדות הנדרשים");
      return;
    }

    setIsLoading(true);

    try {
      const newTask = {
        title: taskName,
        description,
        priority:
          priority === "medium"
            ? "בינוני"
            : priority === "high"
            ? "גבוה"
            : priority === "low"
            ? "נמוך"
            : "בינוני",
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        status: "לעשות", // default status
        category: "אישי", // default category
        estimatedTime: 30, // default 30 minutes instead of 0
        tags: [], // default empty tags
      };

      // Save to server
      const response = await api.saveTask(newTask);
      console.log("Task saved:", response);

      // Update local state with the response data
      setTasks([...tasks, response.data]);

      // Reset form
      setTaskName("");
      setDueDate("");
      setDescription("");
      setPriority("medium");
    } catch (error) {
      console.error("Failed to save task:", error);
      alert("שגיאה בשמירת המשימה. אנא נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      const currentStatus = task.status || (task.completed ? "הושלם" : "לעשות");
      const newStatus = currentStatus === "הושלם" ? "לעשות" : "הושלם";

      // Update server
      await api.updateTask(taskId, { status: newStatus });

      // Update local state
      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus, completed: newStatus === "הושלם" }
            : t
        )
      );
    } catch (error) {
      console.error("Failed to toggle task:", error);
      alert("שגיאה בעדכון המשימה. אנא נסה שוב.");
    }
  };
  const deleteTask = async (id) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק משימה זו?")) {
      try {
        // Delete from server
        await api.deleteTask(id);

        // Update local state
        const updatedTasks = tasks.filter((task) => task.id !== id);
        setTasks(updatedTasks);
      } catch (error) {
        console.error("Failed to delete task:", error);
        alert("שגיאה במחיקת המשימה. אנא נסה שוב.");
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
      case "גבוה":
        return "#ff4757";
      case "medium":
      case "בינוני":
        return "#ffa502";
      case "low":
      case "נמוך":
        return "#7bed9f";
      default:
        return "#70a1ff";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const isCompleted = task.completed || task.status === "הושלם";
    if (filter === "completed") return isCompleted;
    if (filter === "pending") return !isCompleted;
    return true;
  });

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(
      (t) => t.completed || t.status === "הושלם"
    ).length;
    const pending = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, completionRate };
  };

  const stats = getStats();

  return (
    <div>
      <Navbar />
      <div className="mission-page">
        <div className="mission-header">
          <div className="header-content">
            <h1>
              <span className="icon"></span>
              ניהול משימות
            </h1>
            <p>ארגן את המשימות שלך ועקוב אחר ההתקדמות</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">סה"כ משימות</div>
            </div>
            <div className="stat-card completed">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">הושלמו</div>
            </div>
            <div className="stat-card pending">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">ממתינות</div>
            </div>
            <div className="stat-card progress">
              <div className="stat-number">{stats.completionRate}%</div>
              <div className="stat-label">שיעור השלמה</div>
            </div>
          </div>
        </div>

        <div className="mission-content">
          {/* Add Task Form */}
          <div className="task-form-container">
            <h2>
              <span className="icon"></span>
              הוספת משימה חדשה
            </h2>
            <form className="task-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>שם המשימה</label>
                <input
                  type="text"
                  placeholder="הכנס את שם המשימה..."
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>תאריך יעד</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>עדיפות</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="low">נמוכה</option>
                    <option value="medium">בינונית</option>
                    <option value="high">גבוהה</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>תיאור (אופציונלי)</label>
                <textarea
                  placeholder="הוסף תיאור למשימה..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  rows="3"
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
                    הוסף משימה
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Tasks List */}
          <div className="tasks-container">
            <div className="tasks-header">
              <h2>
                <span className="icon"></span>
                רשימת המשימות ({filteredTasks.length})
              </h2>

              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  הכל
                </button>
                <button
                  className={`filter-btn ${
                    filter === "pending" ? "active" : ""
                  }`}
                  onClick={() => setFilter("pending")}
                >
                  ממתינות
                </button>
                <button
                  className={`filter-btn ${
                    filter === "completed" ? "active" : ""
                  }`}
                  onClick={() => setFilter("completed")}
                >
                  הושלמו
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="loading-container">
                <div className="spinner large"></div>
                <p>טוען משימות...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"></div>
                <h3>אין משימות להצגה</h3>
                <p>
                  {filter === "all"
                    ? "הוסף משימה חדשה כדי להתחיל"
                    : `אין משימות ${
                        filter === "completed" ? "שהושלמו" : "ממתינות"
                      }`}
                </p>
              </div>
            ) : (
              <div className="tasks-grid">
                {filteredTasks.map((task) => {
                  const isCompleted = task.completed || task.status === "הושלם";
                  return (
                    <div
                      key={task.id}
                      className={`task-card ${isCompleted ? "completed" : ""}`}
                    >
                      <div className="task-header">
                        <div className="task-checkbox">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => toggleTask(task.id)}
                            id={`task-${task.id}`}
                          />
                          <label htmlFor={`task-${task.id}`}></label>
                        </div>

                        <div
                          className="priority-indicator"
                          style={{
                            backgroundColor: getPriorityColor(
                              task.priority || priority
                            ),
                          }}
                          title={`עדיפות: ${
                            task.priority === "גבוה" || task.priority === "high"
                              ? "גבוהה"
                              : task.priority === "בינוני" ||
                                task.priority === "medium"
                              ? "בינונית"
                              : task.priority === "נמוך" ||
                                task.priority === "low"
                              ? "נמוכה"
                              : "בינונית"
                          }`}
                        ></div>
                      </div>

                      <div className="task-content">
                        <h3 className={isCompleted ? "completed-text" : ""}>
                          {task.taskName || task.title || task.name}
                        </h3>

                        {task.description && (
                          <p className="task-description">{task.description}</p>
                        )}

                        <div className="task-footer">
                          <div className="task-date">
                            <span className="icon"></span>
                            {new Date(
                              task.dueDate || task.date
                            ).toLocaleDateString("he-IL")}
                          </div>

                          <button
                            className="delete-btn"
                            onClick={() => deleteTask(task.id)}
                            title="מחק משימה"
                          >
                            מחק
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
