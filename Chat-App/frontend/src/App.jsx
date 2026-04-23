import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import ChatDashboard from "./pages/ChatDashboard";

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [authUser, setAuthUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return {
      token,
      userId:      localStorage.getItem("userId")      || "",
      username:    localStorage.getItem("username")    || "",
      displayName: localStorage.getItem("displayName") || "",
      avatarColor: localStorage.getItem("avatarColor") || "#2563eb",
    };
  });

  const handleLogout = () => {
    localStorage.clear();
    setAuthUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUp onAuth={setAuthUser} />} />
        <Route path="/login" element={<Login onAuth={setAuthUser} />} />
        <Route path="/" element={<ChatDashboard authUser={authUser} onLogout={handleLogout} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
