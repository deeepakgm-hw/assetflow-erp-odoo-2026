const prisma = require("../lib/prisma");

/**
 * Helper to log system/user activities to database
 * @param {Object} params
 * @param {number} params.userId - ID of the user performing the action
 * @param {string} params.action - Description of the action (e.g. 'Create Department')
 * @param {string} params.entityType - Type of the entity (e.g. 'Department', 'Employee')
 * @param {number} params.entityId - ID of the entity
 */
const logActivity = async ({ userId, action, entityType, entityId }) => {
  try {
    // Include user information when querying/inserting or fetching
    const log = await prisma.activityLog.create({
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

    // Emit live events to Socket.io client
    const { getIO } = require("../lib/socket");
    const io = getIO();
    if (io) {
      io.emit("activity_logged", log);
      io.emit("dashboard_update", { type: "ACTIVITY_LOGGED", data: log });
    }

    return log;
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

module.exports = logActivity;
