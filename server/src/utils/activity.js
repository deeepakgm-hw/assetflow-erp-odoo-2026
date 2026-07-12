const prisma = require("../config/prisma");
const socketManager = require("../lib/socket");

/**
 * Log an activity to the database and broadcast it to subscribers.
 * @param {number} userId - ID of the user performing the action
 * @param {string} action - Description of the action performed
 * @param {string} entityType - Type of entity acted upon (e.g. "Asset", "Department")
 * @param {number} entityId - ID of the entity
 */
const logActivity = async (userId, action, entityType, entityId) => {
  try {
    // Save to the database using the ActivityLog model from prisma
    const activity = await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Broadcast update via Socket.io
    socketManager.broadcast("activity-logged", activity);

    return activity;
  } catch (error) {
    console.error("⚠️ Failed to log activity:", error);
    // Don't throw the error, we don't want audit logging failures to interrupt main processes
  }
};

module.exports = {
  logActivity
};
