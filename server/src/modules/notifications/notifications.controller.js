const notificationsService = require("./notifications.service");

class NotificationsController {
  getAll = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { type } = req.query;

      const notifications = await notificationsService.getUserNotifications(userId, { type });

      return res.status(200).json({
        success: true,
        message: "Notifications retrieved successfully",
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const idInt = parseInt(id);

      const notification = await notificationsService.markAsRead(userId, idInt);

      return res.status(200).json({
        success: true,
        message: "Notification marked as read successfully",
        data: notification
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new NotificationsController();
