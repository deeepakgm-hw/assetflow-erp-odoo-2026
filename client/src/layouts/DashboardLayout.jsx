import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import CommandPalette from "../components/CommandPalette";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import notificationService from "../services/notificationService";

const DashboardLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getAll({ type: "All" });
      const unread = response.data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch unread notifications count:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user, fetchUnreadCount, location.pathname]);

  const handleNewNotification = useCallback(() => {
    setUnreadCount((prev) => prev + 1);
  }, []);

  useSocket(user?.id, handleNewNotification);

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "Dashboard Overview";
    if (path.startsWith("/organization")) return "Organization Setup";
    if (path.startsWith("/notifications")) return "Real-time Notifications";
    if (path.startsWith("/activity")) return "Activity Audit Trail";
    return "AssetFlow ERP";
  };

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          title={getHeaderTitle()}
          unreadCount={unreadCount}
          onNotificationRead={fetchUnreadCount}
        />

        {/* Content View */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet context={{ refetchNotificationCount: fetchUnreadCount }} />
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
