import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Navbar from "./Navbar";

import "./CoursesPage.css";

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [courseType, setCourseType] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("dailydev-user"));
    if (savedUser && api.isAuthenticated()) {
      loadCourses();
    } else {
      navigate("/");
    }
  }, [navigate]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const response = await api.getCourses();
      const serverCourses = response.data || [];
      setCourses(serverCourses);
    } catch (error) {
      console.error("Failed to load courses:", error);
      alert("שגיאה בטעינת הקורסים. אנא נסה שוב.");
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();

    if (!courseName || !courseDuration) {
      alert("נא למלא את כל השדות הנדרשים");
      return;
    }

    if (isNaN(courseDuration) || courseDuration <= 0) {
      alert("נא להזין מספר שעות תקין");
      return;
    }

    setIsLoading(true);

    try {
      const newCourse = {
        name: courseName,
        duration: parseInt(courseDuration) * 60, // convert hours to minutes
        type:
          courseType === "general"
            ? "כללי"
            : courseType === "programming"
            ? "תכנות"
            : courseType === "design"
            ? "עיצוב"
            : courseType === "marketing"
            ? "שיווק"
            : courseType === "management"
            ? "ניהול"
            : "כללי",
        status: "לא התחלתי", // default status
        progress: 0, // default progress
        difficulty: "מתחיל", // default difficulty
        platform: "אחר", // default platform
        tags: [], // default empty tags
      };

      // Save to server
      const response = await api.saveCourse(newCourse);
      console.log("Course saved:", response);

      // Update local state with the response data
      setCourses([...courses, response.data]);

      // Reset form
      setCourseName("");
      setCourseDuration("");
      setCourseType("general");

      alert("הקורס נוסף בהצלחה! 🎉");
    } catch (error) {
      console.error("Failed to save course:", error);
      alert("שגיאה בשמירת הקורס. אנא נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק קורס זה?")) {
      try {
        await api.deleteCourse(id);
        const updatedCourses = courses.filter((course) => course.id !== id);
        setCourses(updatedCourses);
      } catch (error) {
        console.error("Failed to delete course:", error);
        alert("שגיאה במחיקת הקורס. אנא נסה שוב.");
      }
    }
  };

  const toggleCourseCompletion = (courseId) => {
    const updatedCourses = courses.map((course) => {
      if ((course.id || course.name) === courseId) {
        return {
          ...course,
          completed: !course.completed,
          progress: !course.completed ? 100 : 0,
        };
      }
      return course;
    });

    setCourses(updatedCourses);
  };

  const getStats = () => {
    const totalCourses = courses.length;
    const completedCourses = courses.filter(
      (course) => course.completed
    ).length;
    const totalHours = courses.reduce(
      (sum, course) => sum + (course.duration || course.courseDuration || 0),
      0
    );
    const completionRate =
      totalCourses > 0
        ? Math.round((completedCourses / totalCourses) * 100)
        : 0;

    return { totalCourses, completedCourses, totalHours, completionRate };
  };

  const stats = getStats();

  const filteredCourses = courses.filter((course) => {
    if (filter === "completed") return course.completed;
    if (filter === "pending") return !course.completed;
    return true;
  });

  const getCourseTypeColor = (type) => {
    switch (type) {
      case "frontend":
        return "#667eea";
      case "backend":
        return "#f093fb";
      case "fullstack":
        return "#4facfe";
      case "mobile":
        return "#43e97b";
      default:
        return "#764ba2";
    }
  };

  return (
    <>
      <Navbar />
      <div className="courses-page">
        {/* Header Section */}
        <div className="courses-header">
          <div className="header-content">
            <h1>
              <span className="icon">🎓</span>
              מעקב קורסים
            </h1>
            <p>נהל את הקורסים שלך ועקוב אחר ההתקדמות</p>

            <div className="motivation-quote">
              <span className="quote-icon">💡</span>
              <p>
                "למידה היא השקעה לעתיד שלך - כל קורס שאתה מסיים מקרב אותך צעד
                נוסף למטרה"
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalCourses}</div>
              <div className="stat-label">סה"כ קורסים</div>
            </div>
            <div className="stat-card completed">
              <div className="stat-number">{stats.completedCourses}</div>
              <div className="stat-label">הושלמו</div>
            </div>
            <div className="stat-card hours">
              <div className="stat-number">{stats.totalHours}h</div>
              <div className="stat-label">סה"כ שעות</div>
            </div>
            <div className="stat-card progress">
              <div className="stat-number">{stats.completionRate}%</div>
              <div className="stat-label">שיעור השלמה</div>
            </div>
          </div>
        </div>

        <div className="courses-content">
          {/* Course Form */}
          <div className="course-form-container">
            <h2>
              <span className="icon"></span>
              הוספת קורס חדש
            </h2>

            <form className="course-form" onSubmit={handleAddCourse}>
              <div className="form-group">
                <label>שם הקורס</label>
                <input
                  type="text"
                  placeholder="React - Complete Guide"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>משך הקורס (שעות)</label>
                  <input
                    type="number"
                    placeholder="40"
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(e.target.value)}
                    disabled={isLoading}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>סוג הקורס</label>
                  <select
                    value={courseType}
                    onChange={(e) => setCourseType(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="general">כללי</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="fullstack">Full Stack</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
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
                    הוסף קורס
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Courses List */}
          <div className="courses-container">
            <div className="courses-header-section">
              <h2>
                <span className="icon"></span>
                הקורסים שלי ({filteredCourses.length})
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
                  בתהליך
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
                <p>טוען קורסים...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"></div>
                <h3>אין קורסים להצגה</h3>
                <p>
                  {filter === "all"
                    ? "הוסף קורס חדש כדי להתחיל"
                    : `אין קורסים ${
                        filter === "completed" ? "שהושלמו" : "בתהליך"
                      }`}
                </p>
              </div>
            ) : (
              <div className="courses-grid">
                {filteredCourses.map((course, index) => (
                  <div
                    key={course.id || course.name || index}
                    className={`course-card ${
                      course.completed ? "completed" : ""
                    }`}
                  >
                    <div className="course-header">
                      <div className="course-checkbox">
                        <input
                          type="checkbox"
                          checked={course.completed || false}
                          onChange={() =>
                            toggleCourseCompletion(course.id || course.name)
                          }
                          id={`course-${course.id || index}`}
                        />
                        <label htmlFor={`course-${course.id || index}`}></label>
                      </div>

                      <div
                        className="type-indicator"
                        style={{
                          backgroundColor: getCourseTypeColor(
                            course.courseType || course.type || "general"
                          ),
                        }}
                        title={`סוג: ${
                          course.courseType || course.type || "כללי"
                        }`}
                      ></div>
                    </div>

                    <div className="course-content">
                      <h3 className={course.completed ? "completed-text" : ""}>
                        {course.courseName || course.name}
                      </h3>

                      <div className="course-info">
                        <div className="course-duration">
                          <span className="icon"></span>
                          {course.courseDuration || course.duration} שעות
                        </div>

                        <div className="course-type">
                          <span className="icon"></span>
                          {course.courseType || course.type || "כללי"}
                        </div>
                      </div>

                      <div className="progress-section">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${
                                course.progress || (course.completed ? 100 : 0)
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {course.progress || (course.completed ? 100 : 0)}%
                        </span>
                      </div>

                      <div className="course-footer">
                        <div className="course-date">
                          <span className="icon"></span>
                          {course.createdAt
                            ? new Date(course.createdAt).toLocaleDateString(
                                "he-IL"
                              )
                            : "היום"}
                        </div>

                        <button
                          className="delete-btn"
                          onClick={() => deleteCourse(course.id || course.name)}
                          title="מחק קורס"
                        >
                          מחק
                        </button>
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
