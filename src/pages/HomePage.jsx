import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalMinutes: 0,
    totalDays: 0,
    streak: 0,
    tasksCompleted: 0,
    totalTasks: 0
  });
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const texts = React.useMemo(() => [
    "פה לומדים יותר",
    "מפוקחים יותר",
    "מתקדמים יותר", 
    "מצליחים יותר",
    "בונים את העתיד"
  ], []);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("dailydev-user"));
    if (savedUser) {
      setUser(savedUser);
      loadUserStats(savedUser.email);
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = texts[currentIndex];
      
      if (!isDeleting) {
        setCurrentText(current.substring(0, currentText.length + 1));
        
        if (currentText === current) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setCurrentText(current.substring(0, currentText.length - 1));
        
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentIndex, texts]);

  const loadUserStats = async (userEmail) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stats/${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        throw new Error('Server response not ok');
      }
    } catch {
      const tasksKey = `dailydev-tasks-${userEmail}`;
      const journalKey = `dailydev-journal-${userEmail}`;
      
      const savedTasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');
      const savedJournal = JSON.parse(localStorage.getItem(journalKey) || '[]');
      
      const completedTasks = savedTasks.filter(t => t.completed).length;
      const totalMinutes = savedJournal.reduce((sum, entry) => sum + (entry.timeSpent || 0), 0);
      
      setStats({
        totalMinutes,
        totalDays: savedJournal.length,
        streak: savedJournal.length,
        tasksCompleted: completedTasks,
        totalTasks: savedTasks.length
      });
    }
  };


  const services = [
    {
      title: "יומן למידה",
      description: "תעד את מה שלמדת היום, האתגרים שפגשת והזמן שהשקעת בלמידה",
      path: "/Journal",
      icon: "📝",
      mockupContent: {
        title: "רשימת הלמידה של היום",
        fields: ["מה למדת היום?", "אילו אתגרים פגשת?", "כמה זמן הקדשת?"],
        stats: [`${stats.totalDays} ימי למידה`, `${stats.totalMinutes} דקות סה"כ`]
      }
    },
    {
      title: "ניהול משימות",
      description: "ארגן את המשימות שלך לפי עדיפות, עקוב אחר ההתקדמות ושמור על פרודוקטיביות",
      path: "/MissionPage",
      icon: "✅",
      mockupContent: {
        title: "ניהול משימות",
        fields: [
          "הוספת משימה חדשה",
          "תאריך יעד",
          "עדיפות"
        ],
        stats: [`${stats.totalTasks} משימות`, `${stats.tasksCompleted} הושלמו`]
      }
    },
    {
      title: "מעקב קורסים",
      description: "נהל את הקורסים שלך, עקוב אחר ההתקדמות בכל קורס והשג את המטרות שלך",
      path: "/Courses",
      icon: "🎓",
      mockupContent: {
        title: "הקורסים שלי",
        fields: ["הוספת קורס חדש", "משך הקורס", "סוג הקורס"],
        stats: ["Frontend", "Backend", "Full Stack"]
      }
    }
  ];

  return (
    <>
      <Navbar />
      <div className="home-page">
        {user ? (
          <>
            {/* Hero Section */}
            <div className="home-hero">
              <div className="hero-content">
                <div className="hero-left">
                  <div className="hero-graphics">
                    <div className="phone-mockup">
                      <div className="phone-screen">
                        <div className="screen-content">
                          <div className="app-header">
                            <div className="profile-section">
                              <div className="profile-pic"></div>
                              <span>שלום {user.name}</span>
                            </div>
                          </div>
                          <div className="stats-cards">
                            <div className="stat-card-mini">
                              <span className="stat-icon">📚</span>
                              <span className="stat-value">{stats.totalDays}</span>
                              <span className="stat-label">ימי למידה</span>
                            </div>
                            <div className="stat-card-mini">
                              <span className="stat-icon">⏱️</span>
                              <span className="stat-value">{Math.round(stats.totalMinutes/60)}</span>
                              <span className="stat-label">שעות</span>
                            </div>
                          </div>
                          <div className="progress-section">
                            <div className="progress-item">
                              <span>React Course</span>
                              <div className="progress-bar-mini">
                                <div className="progress-fill-mini" style={{width: '70%'}}></div>
                              </div>
                            </div>
                            <div className="progress-item">
                              <span>JavaScript</span>
                              <div className="progress-bar-mini">
                                <div className="progress-fill-mini" style={{width: '85%'}}></div>
                              </div>
                            </div>
                          </div>
                          <div className="play-button">
                            <div className="play-icon">▶</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="floating-elements">
                      <div className="chart-widget">
                        <div className="chart-bars">
                          <div className="bar" style={{height: '20px'}}></div>
                          <div className="bar" style={{height: '35px'}}></div>
                          <div className="bar" style={{height: '25px'}}></div>
                          <div className="bar" style={{height: '40px'}}></div>
                          <div className="bar" style={{height: '30px'}}></div>
                        </div>
                      </div>
                      
                      <div className="checklist-widget">
                        <div className="check-item completed">
                          <span className="checkmark">✓</span>
                          <span>HTML & CSS</span>
                        </div>
                        <div className="check-item">
                          <span className="checkmark">○</span>
                          <span>React Hooks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hero-right">
                  <h1 className="hero-title">
                    <span className="title-line">המשתמשים</span>
                    <span className="title-line">שכבר מתפתחים</span>
                    <span className="brand-name">איתנו</span>
                
                  </h1>
                  
                  <h2 className="dynamic-text">
                    {currentText}
                    <span className="cursor">|</span>
                  </h2>
                  
                  <p className="hero-description">
                    אנו מאמינים שתוכלו לנהל את הלמידה, המטרות והמשימות שלכם בקלות וביעילות עם הפלטפורמה שלנו – מערכת חכמה להתפתחות אישית ומקצועית, הכוללת יומן יומי, ניהול משימות ומעקב אחר ההתקדמות שלכם.
                  </p>
                  
                  <button className="cta-button" onClick={() => navigate('/Journal')}>
                    להתחיל
                  </button>
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div className="services-section">
              <div className="services-content">
                <h2 className="services-title">השירותים שלנו</h2>
                <p className="services-subtitle">מערכת מתקדמת לניהול עצמי, למידה יעילה והשגת מטרות אישיות ומקצועיות.</p>
                
                <div className="services-list">
                  {services.map((service, index) => (
                    <div key={index} className="service-item">
                      <div className="service-info">
                        <div className="service-header">
                          <span className="service-icon">{service.icon}</span>
                          <h3 className="service-title">{service.title}</h3>
                        </div>
                        <p className="service-description">{service.description}</p>
                        <button 
                          className="service-btn"
                          onClick={() => navigate(service.path)}
                        >
                          התחל עכשיו
                        </button>
                      </div>
                      
                      <div className="service-mockup">
                        <div className="mockup-window">
                          <div className="mockup-header">
                            <div className="mockup-controls">
                              <span className="control red"></span>
                              <span className="control yellow"></span>
                              <span className="control green"></span>
                            </div>
                          </div>
                          <div className="mockup-content">
                            <h4 className="mockup-title">{service.mockupContent.title}</h4>
                            <div className="mockup-form">
                              {service.mockupContent.fields.map((field, fieldIndex) => (
                                <div key={fieldIndex} className="mockup-field">
                                  <div className="field-label">{field}</div>
                                  <div className="field-input"></div>
                                </div>
                              ))}
                            </div>
                            <div className="mockup-stats">
                              {service.mockupContent.stats.map((stat, statIndex) => (
                                <div key={statIndex} className="stat-badge">{stat}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="loading-container">
            <div className="spinner large"></div>
            <p>טוען...</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}