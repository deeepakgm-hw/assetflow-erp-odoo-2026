import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Bell, Search, Clock, CheckCircle } from "lucide-react";
import { allocationApi } from "../../services/allocationApi";

export default function Navbar({ setSidebarOpen }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      const data = await allocationApi.fetchNotifications();
      setNotifications(data || []);
      setApiConnected(true);
    } catch (error) {
      console.warn("Using mock notifications because API is unavailable:", error.message);
      const data = allocationApi.getNotifications();
      setNotifications(data || []);
      setApiConnected(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Listen for storage changes or trigger events
    const interval = setInterval(() => {
      loadNotifications();
    }, 2000); // Check for updates from API state changes
    
    return () => clearInterval(interval);
  }, []);

  // Click outside listener for notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Map path to Breadcrumbs
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/") return ["Workspace", "Dashboard"];
    if (path === "/allocation") return ["Workspace", "Assets & Allocation"];
    if (path === "/booking") return ["Workspace", "Resource Booking"];
    
    // Fallback/Placeholder pathnames
    const cleanPath = path.substring(1);
    const capitalized = cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
    return ["Workspace", capitalized];
  };

  const breadcrumbs = getBreadcrumbs();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id) => {
    if (apiConnected) {
      await allocationApi.markNotificationReadRemote(id);
    } else {
      allocationApi.markNotificationRead(id);
    }
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    if (apiConnected) {
      await allocationApi.markAllNotificationsReadRemote(notifications);
    } else {
      allocationApi.markAllNotificationsRead();
    }
    loadNotifications();
  };

  const formatClock = (date) => {
    const options = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true 
    };
    // Force specific mock date base for consistency with user metadata
    // but keep running minute calculations live
    const mockBase = new Date(date);
    mockBase.setFullYear(2026);
    mockBase.setMonth(6); // July (0-indexed)
    mockBase.setDate(12);
    return mockBase.toLocaleDateString("en-US", options);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80">
      
      {/* Left side: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 lg:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              {idx > 0 && <span className="text-slate-650">/</span>}
              <span className={idx === breadcrumbs.length - 1 ? "text-slate-200 font-semibold" : ""}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right side: Time, Search, Notifications, Profile */}
      <div className="flex items-center gap-4">
        
        {/* Dynamic Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800/50 bg-slate-950/20 text-xs font-medium text-slate-450">
          <Clock className="w-3.5 h-3.5 text-blue-500/80" />
          <span>{formatClock(currentTime)}</span>
        </div>

        {/* Global Search Bar (Visual Only) */}
        <div className="relative hidden lg:block w-48 xl:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Quick search..."
            className="w-full bg-slate-950/40 border border-slate-800/80 rounded-lg text-slate-350 text-xs py-1.5 pl-9 pr-3 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className={`
              relative p-2 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-450 hover:text-slate-200 focus:outline-none transition-colors cursor-pointer
              ${notifDropdownOpen ? "border-slate-700 bg-slate-900 text-slate-200" : ""}
            `}
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {/* Dropdown list */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden rounded-xl border border-slate-750 bg-slate-800 shadow-2xl z-50 flex flex-col scale-100 origin-top-right transition-all">
              {/* Dropdown Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-850">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Notifications</h4>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-semibold text-blue-450 hover:text-blue-350 cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto flex-1 divide-y divide-slate-700/40">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-slate-550 text-xs gap-1.5">
                    <CheckCircle className="w-8 h-8 text-slate-600" />
                    <span>No notifications yet.</span>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id)}
                      className={`
                        p-3 text-xs transition-colors cursor-pointer flex gap-2.5 items-start
                        ${notif.read ? "bg-slate-800 hover:bg-slate-750/30" : "bg-slate-750/20 hover:bg-slate-750/40"}
                      `}
                    >
                      <div className={`
                        w-1.5 h-1.5 rounded-full mt-1.5 shrink-0
                        ${notif.type === "danger" ? "bg-rose-500" : ""}
                        ${notif.type === "warning" ? "bg-amber-500" : ""}
                        ${notif.type === "success" ? "bg-emerald-500" : ""}
                        ${notif.type === "info" ? "bg-blue-500" : ""}
                        ${notif.read ? "opacity-0" : "opacity-100"}
                      `} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <p className="font-semibold text-slate-250 truncate">{notif.title}</p>
                          <span className="text-[10px] text-slate-500">{notif.time}</span>
                        </div>
                        <p className="text-slate-400 leading-normal">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Small avatar shortcut */}
        <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/25 flex items-center justify-center text-xs font-bold text-blue-400">
          CT
        </div>
      </div>
    </header>
  );
}
