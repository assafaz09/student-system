import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JournalPage from "./pages/JournalPage";
import CardsPage from "./pages/CardsPage";
import HomePage from "./pages/HomePage";
import MissionPage from "./pages/MissionPage";
import CoursesPage from "./pages/CoursesPage";
import ThxPage from "./pages/ThxPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="ThxPage" element={<ThxPage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/HomePage" element={<HomePage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/MissionPage" element={<MissionPage />} />
          <Route path="/courses" element={<CoursesPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
