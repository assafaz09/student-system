// src/pages/homePcards.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./homePcards.css";

export default function HomePCards() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "יומן למידה",
      description: "תעד את מה שלמדת היום",

      path: "/journal",
      color: "#667eea",
    },
    {
      title: "ניהול משימות",
      description: "ארגן את המשימות שלך",

      path: "/MissionPage",
      color: "#764ba2",
    },
    {
      title: "מעקב קורסים",
      description: "נהל את הקורסים שלך",

      path: "/Courses",
      color: "#f093fb",
    },
    {
      title: "צור קשר",
      description: "יש לך שאלות? צור איתנו קשר",

      path: "/ThxPage",
      color: "#f5576c",
    },
  ];

  return (
    <div className="home-cards-grid">
      {cards.map((card, index) => (
        <div
          key={index}
          className="home-card"
          onClick={() => navigate(card.path)}
          style={{ "--card-color": card.color }}
        >
          <div className="card-icon">{card.icon}</div>
          <h3>{card.title}</h3>
          <p>{card.description}</p>
          <div
            className="card-background"
            style={
              card.background
                ? { backgroundImage: `url(${card.background})` }
                : {}
            }
          ></div>

          <div className="card-arrow">→</div>
        </div>
      ))}
    </div>
  );
}
