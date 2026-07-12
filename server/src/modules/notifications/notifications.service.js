const prisma = require("../../lib/prisma");

class NotificationsService {
  async getUserNotifications(userId, { type }) {
    const where = { userId };

    if (type && type !== "All") {
      where.type = type;
    }

    return await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
  }

  async markAsRead(userId, id) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      const error = new Error("Notification not found");
      error.statusCode = 404;
      throw error;
    }

    return await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }
}

module.exports = new NotificationsService();
