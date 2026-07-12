import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import notificationService from "../services/notificationService";
import Badge from "../components/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Sparkles, Inbox, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const Notifications = () => {
  const { refetchNotificationCount } = useOutletContext() || {};
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const filterChips = ["All", "Alerts", "Approvals", "Bookings"];

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAll({ type: activeFilter });
      setNotifications(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      toast.success("Notification processed");
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (refetchNotificationCount) refetchNotificationCount();
    } catch (error) {
      toast.error("Failed to mark notification as read.");
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "Alerts":
        return "danger";
      case "Approvals":
        return "warning";
      case "Bookings":
        return "info";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto font-sans pb-10">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <Inbox className="h-5 w-5 text-blue-500" />
            <span>Workspace Notifications</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Audit and approve operational actions and infrastructure alerts.
          </p>
        </div>
        <button
          onClick={fetchNotifications}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Refresh Feed"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap bg-zinc-900/40 p-1.5 rounded-xl border border-zinc-850 max-w-max">
        {filterChips.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 focus:outline-none ${
              activeFilter === filter
                ? "bg-zinc-800 border-zinc-700 text-white shadow-md"
                : "text-zinc-500 hover:text-zinc-350"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 flex justify-center">
            <span className="h-6 w-6 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="border border-zinc-850/60 rounded-2xl bg-zinc-900/10 p-16 text-center text-zinc-550">
            <Bell className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider">Inbox Clean</p>
            <p className="text-xs text-zinc-500 mt-1">All clear for today.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <AnimatePresence>
              {notifications.map((n) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={n.id}
                  className={`flex items-start justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    n.isRead
                      ? "bg-zinc-900/10 border-zinc-900/60 opacity-60"
                      : "bg-zinc-900/30 border-zinc-850/60 hover:border-zinc-800 shadow-md"
                  }`}
                >
                  <div className="space-y-2 flex-1 mr-4">
                    <div className="flex items-center space-x-2.5">
                      <Badge variant={getNotificationColor(n.type)} className="uppercase tracking-wider text-[8px] font-black">
                        {n.type}
                      </Badge>
                      {!n.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${n.isRead ? "text-zinc-400" : "text-zinc-200 font-semibold"}`}>
                      {n.message}
                    </p>
                    <p className="text-[9px] text-zinc-550 font-bold">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                      title="Mark as Read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
