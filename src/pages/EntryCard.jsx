import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css" ;

function EntryCard({ entry }) {
  const navigate = useNavigate();

  return (
    <div className="entry-card">
      <h3> {entry.date}</h3>
      <p>
        <strong> מה למדת:</strong> {entry.learned}
      </p>
      <p>
        <strong> אתגר:</strong> {entry.challenges}
      </p>
      <p>
        <strong> זמן:</strong> {entry.timeSpent} דקות
      </p>
      <button onClick={() => navigate("/stats")}>סטטיסטיקות</button>
    </div>
  );
}

export default EntryCard;
