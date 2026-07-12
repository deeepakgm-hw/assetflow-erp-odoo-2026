import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import notificationService from "../services/notificationService";
import Button from "../components/Button";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import { BellIcon, CheckIcon } from "@heroicons/react/24/outline";
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
      toast.success("Notification marked as read");
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
    <div className="space-y-6 select-none max-w-4xl">
      {/* Title Header */}
      <div>
        <h3 className="text-xl font-bold text-zinc-100">Live Notifications</h3>
        <p className="text-sm text-zinc-400 mt-1">
          Stay updated with real-time approvals, system alerts, and resource bookings.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap pb-2">
        {filterChips.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 focus:outline-none ${
              activeFilter === filter
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/15"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="border border-zinc-800/80 rounded-xl bg-zinc-900/10 p-12 text-center text-zinc-500 font-medium">
            <BellIcon className="h-10 w-10 text-zinc-650 mx-auto mb-3" />
            <p className="text-sm">No notifications found in this category.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between p-5 rounded-xl border transition-all duration-300 ${
                n.isRead
                  ? "bg-zinc-900/10 border-zinc-900/50"
                  : "bg-zinc-900/40 border-zinc-800/60 shadow-md shadow-blue-500/[0.01]"
              }`}
            >
              <div className="space-y-2 flex-1 mr-4">
                <div className="flex items-center space-x-2.5">
                  <Badge variant={getNotificationColor(n.type)} className="uppercase tracking-wider">
                    {n.type}
                  </Badge>
                  {!n.isRead && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>
                <p className={`text-sm leading-relaxed ${n.isRead ? "text-zinc-400" : "text-zinc-200 font-semibold"}`}>
                  {n.message}
                </p>
                <p className="text-[10px] text-zinc-500 font-semibold">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>

              {!n.isRead && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAsRead(n.id)}
                  className="py-1 px-2.5 hover:bg-zinc-800"
                  title="Mark as Read"
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
