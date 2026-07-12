import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard";
import AllocationPage from "./pages/AllocationPage";
import BookingPage from "./pages/BookingPage";
import ComingSoonPage from "./pages/ComingSoonPage";

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0F172A] text-[#F8FAFC] font-sans antialiased overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content frame */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar setSidebarOpen={setSidebarOpen} />

        {/* Dynamic page mount area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0F172A] focus:outline-none">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/allocation" element={<AllocationPage />} />
            <Route path="/booking" element={<BookingPage />} />
            
            {/* Placeholders */}
            <Route path="/maintenance" element={<ComingSoonPage title="Maintenance Approval" />} />
            <Route path="/audit" element={<ComingSoonPage title="Audit & Compliance" />} />
            <Route path="/reports" element={<ComingSoonPage title="Analytics Reports" />} />
            <Route path="/settings" element={<ComingSoonPage title="Workspace Settings" />} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
