import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Feed from "./pages/Feed.jsx";
import Analytics from "./pages/Analytics.jsx";
import Saved from "./pages/Saved.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-bg bg-grid">
      <div className="mx-auto max-w-[1400px] px-4 py-4">
        <Navbar />
        <div className="mt-4">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

