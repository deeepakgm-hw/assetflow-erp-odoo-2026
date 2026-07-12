import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BellIcon, CheckIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import notificationService from "../services/notificationService";

const TopNavbar = ({ title = "Dashboard", unreadCount = 0, onNotificationRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch latest 5 notifications when dropdown opens or unreadCount changes
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await notificationService.getAll({ limit: 5 });
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Failed to load notifications in header:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen || unreadCount > 0) {
      fetchNotifications();
    }
  }, [isOpen, unreadCount]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      await Promise.all(unreadNotifications.map((n) => notificationService.markAsRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getRelativeTime = (timestamp) => {
    const diff = new Date() - new Date(timestamp);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <header className="glass-nav h-16 flex items-center justify-between px-8 select-none border-b border-zinc-900/60 z-30 relative">
      {/* Page Title */}
      <h2 className="text-sm font-bold text-zinc-200 tracking-wider uppercase">
        {title}
      </h2>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Live Indicator */}
        <div className="flex items-center space-x-2 bg-zinc-900/80 border border-zinc-800/80 px-3 py-1 rounded-full text-[10px] font-semibold text-zinc-400 shadow-inner">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="uppercase tracking-wider text-zinc-300">Live Sync</span>
        </div>

        {/* Notifications Icon and Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative text-zinc-400 hover:text-zinc-200 transition-colors p-2 hover:bg-zinc-900 rounded-lg border border-transparent ${
              isOpen ? "bg-zinc-905 text-zinc-100" : ""
            }`}
          >
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-650 text-[9px] font-bold text-white ring-2 ring-zinc-950 animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Panel */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-zinc-950 border border-zinc-850 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-900/30">
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Notifications
                </span>
                {notifications.some((n) => !n.isRead) && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-zinc-900/80">
                {loading && notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-zinc-500">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-zinc-500">
                    No new alerts
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start p-3 hover:bg-zinc-900/40 transition-colors relative group ${
                        !n.isRead ? "bg-blue-900/5" : ""
                      }`}
                    >
                      {/* Icon */}
                      <div className="mr-3 mt-0.5 text-zinc-500">
                        <InformationCircleIcon className="h-4 w-4 text-blue-500" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-xs text-zinc-300 font-medium leading-relaxed break-words">
                          {n.message}
                        </p>
                        <span className="text-[9px] text-zinc-500 font-semibold block mt-1">
                          {getRelativeTime(n.createdAt)}
                        </span>
                      </div>

                      {/* Unread mark action */}
                      {!n.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          className="absolute right-3 top-3.5 h-4 w-4 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:border-zinc-700"
                          title="Mark Read"
                        >
                          <CheckIcon className="h-2.5 w-2.5 text-zinc-400" />
                        </button>
                      )}

                      {!n.isRead && (
                        <div className="absolute right-3.5 top-4 h-1.5 w-1.5 bg-blue-500 rounded-full group-hover:opacity-0 transition-opacity" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center py-2.5 text-[11px] font-bold text-zinc-400 hover:text-zinc-200 border-t border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/20 transition-all uppercase tracking-wider"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
