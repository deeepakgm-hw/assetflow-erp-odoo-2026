import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const useSocket = (userId, onNotificationReceived) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Connect to socket.io
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.io connected:", socket.id);
      // Join user room
      socket.emit("join", userId);
    });

    socket.on("notification", (notification) => {
      console.log("Real-time notification received:", notification);
      // Show toaster alert
      toast.success(notification.message, {
        duration: 5000,
        position: "top-right",
        style: {
          background: "#18181b",
          color: "#fff",
          border: "1px solid #2563eb",
        },
      });
      // Fire callback to update UI list
      if (onNotificationReceived && typeof onNotificationReceived === 'function') {
        onNotificationReceived(notification);
      }
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId, onNotificationReceived]);

  return socketRef.current;
};
