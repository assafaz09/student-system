import React, { useState, useEffect } from "react";
import EntryCard from "../pages/EntryCard";
import { useNavigate } from "react-router-dom";
import "../App.css";
import Navbar from "./Navbar";

export default function CardsPage() {
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("dailydev-user"));
  const entriesKey = `dailydev-entries-${user.email}`;

  useEffect(() => {
    const savedUser = localStorage.getItem("dailydev-user");
    if (!savedUser) {
      navigate("/");
      return;
    }
    const savedEntries = JSON.parse(localStorage.getItem(entriesKey)) || [];
    const sorted = [...savedEntries].reverse();
    setEntries(sorted);
  }, [navigate, entriesKey]);

  return (
    <>
   
    <Navbar />

    <div className="cards-container">
      <h1 className="cardH">כרטיסיות הלמידה שלך</h1>
      {entries.length === 0 ? (
        <p>עדיין אין פה כלום ... תרשום משהו</p>
      ) : (
        entries.map((entry, index) => <EntryCard key={index} entry={entry} />)
      )}
    </div>
    </>
  );
}
