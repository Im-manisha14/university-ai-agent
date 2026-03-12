import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AgentsPage from "./pages/AgentsPage";
import ChatPage from "./pages/ChatPage";
import CreateAgentPage from "./pages/CreateAgentPage";
import AnalyticsPage from "./pages/AnalyticsPage";

export default function App() {
  return (
    <Router>
      <div className="app-shell">
        <Sidebar />
        <div className="main-area">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/create" element={<CreateAgentPage />} />
            <Route path="/chat/:agentId" element={<ChatPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
