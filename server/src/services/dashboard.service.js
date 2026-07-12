const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");

const dbPath = path.join(__dirname, "../uploads/assets.json");

const readAssets = () => {
  try {
    if (!fs.existsSync(dbPath)) {
      return [];
    }
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    return [];
  }
};

/**
 * Retrieve total asset counts, active maintenance, and value metrics.
 * @returns {Promise<Object>} - Dashboard KPI metrics
 */
const getSummaryStats = async () => {
  const assets = readAssets();
  
  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, asset) => sum + (asset.purchaseCost || 0), 0);
  const activeMaintenanceCount = assets.filter(a => a.status.toLowerCase() === "maintenance").length;

  return {
    totalAssets,
    totalValue,
    activeMaintenanceCount
  };
};

/**
 * Retrieve recent activity audit logs using the existing ActivityLog model.
 * @param {number} limit - Maximum number of logs to return
 * @returns {Promise<Array>} - List of recent activity logs
 */
const getRecentActivities = async (limit) => {
  try {
    const logs = await prisma.activityLog.findMany({
      take: limit,
      orderBy: {
        timestamp: "desc"
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
    return logs;
  } catch (error) {
    console.error("❌ Error fetching recent activities:", error);
    throw error;
  }
};

/**
 * Retrieve department-wise asset count and total value metrics.
 * @returns {Promise<Array>} - List of stats per department
 */
const getDepartmentStats = async () => {
  const assets = readAssets();
  
  // Fetch actual departments from PostgreSQL using Prisma
  const departments = await prisma.department.findMany({
    select: {
      id: true,
      name: true
    }
  });

  const stats = departments.map((dept) => {
    const deptAssets = assets.filter(a => a.departmentId === dept.id);
    const totalValue = deptAssets.reduce((sum, asset) => sum + (asset.purchaseCost || 0), 0);

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      assetCount: deptAssets.length,
      totalValue
    };
  });

  // Include a category/row for "Unassigned" assets
  const unassignedAssets = assets.filter(a => !a.departmentId);
  if (unassignedAssets.length > 0) {
    const unassignedValue = unassignedAssets.reduce((sum, asset) => sum + (asset.purchaseCost || 0), 0);
    stats.push({
      departmentId: null,
      departmentName: "Unassigned",
      assetCount: unassignedAssets.length,
      totalValue: unassignedValue
    });
  }

  return stats;
};

module.exports = {
  getSummaryStats,
  getRecentActivities,
  getDepartmentStats
};
