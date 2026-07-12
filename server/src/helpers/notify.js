const prisma = require("../lib/prisma");
const { getIO } = require("../lib/socket");

/**
 * Helper to create a notification in database and emit it via Socket.io
 * @param {Object} params
 * @param {number} params.userId - ID of the user receiving the notification
 * @param {string} params.type - Type of notification ('Alerts', 'Approvals', 'Bookings')
 * @param {string} params.message - Content of notification
 */
const notify = async ({ userId, type, message }) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        isRead: false
      }
    });

    const io = getIO();
    if (io) {
      io.to(`user-${userId}`).emit("notification", notification);
      console.log(`Socket emitted notification to user-${userId}:`, message);
    } else {
      console.warn("Socket.io is not initialized; notification saved to DB only");
    }

    return notification;
  } catch (error) {
    console.error("Failed to create or send notification:", error);
  }
};

module.exports = notify;
