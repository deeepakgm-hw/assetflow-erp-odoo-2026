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
    const log = await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId
      }
    });
    return log;
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

module.exports = logActivity;
