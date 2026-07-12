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
 * Live KPI calculation using Prisma queries if models exist, with local JSON fallback.
 * @returns {Promise<Object>} - Counts for KPIs
 */
const getKPIs = async () => {
  const assets = readAssets();
  const today = new Date();
  
  // Set date ranges
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const next7Days = new Date(today);
  next7Days.setDate(today.getDate() + 7);

  // Initialize KPI counts
  let assetsAvailable = 0;
  let assetsAllocated = 0;
  let maintenanceToday = 0;
  let activeBookings = 0;
  let pendingTransfers = 0;
  let upcomingReturns = 0;

  try {
    // ----------------------------------------------------
    // TODO: Live Prisma DB Queries
    // These will execute successfully once the teammate defines the models.
    // ----------------------------------------------------
    
    // 1. Assets Available
    assetsAvailable = await prisma.asset.count({
      where: { status: { in: ["Available", "Active"] } }
    });

    // 2. Assets Allocated
    assetsAllocated = await prisma.asset.count({
      where: { status: "Allocated" }
    });

    // 3. Maintenance Scheduled Today
    maintenanceToday = await prisma.maintenance.count({
      where: {
        scheduledDate: {
          gte: startOfToday,
          lte: endOfToday
        }
      }
    });

    // 4. Active Bookings
    activeBookings = await prisma.booking.count({
      where: { status: "Active" }
    });

    // 5. Pending Transfers
    pendingTransfers = await prisma.transfer.count({
      where: { status: "Pending" }
    });

    // 6. Upcoming Returns (bookings expiring in next 7 days)
    upcomingReturns = await prisma.booking.count({
      where: {
        status: "Active",
        expectedReturnDate: {
          gte: today,
          lte: next7Days
        }
      }
    });

  } catch (error) {
    // Fallback: Compute values using local JSON store & simulation
    console.log("ℹ️ Prisma Asset/Booking models not found in schema.prisma yet. Using fallback JSON calculations.");
    
    assetsAvailable = assets.filter(a => 
      a.isBookable && (a.status.toLowerCase() === "available" || a.status.toLowerCase() === "active")
    ).length;

    assetsAllocated = assets.filter(a => 
      a.status.toLowerCase() === "allocated"
    ).length;

    maintenanceToday = assets.filter(a => 
      a.status.toLowerCase() === "maintenance"
    ).length;

    // Simulate other tables
    activeBookings = assetsAllocated; // Assume allocated assets have active bookings
    pendingTransfers = assets.filter(a => a.status.toLowerCase() === "transfer").length;
    upcomingReturns = Math.min(activeBookings, 2); // Simulating upcoming returns
  }

  return {
    assetsAvailable,
    assetsAllocated,
    maintenanceToday,
    activeBookings,
    pendingTransfers,
    upcomingReturns
  };
};

/**
 * Retrieve overdue assets where expectedReturnDate < today.
 * @returns {Promise<Array>} - List of overdue assets
 */
const getOverdueAssets = async () => {
  const assets = readAssets();
  const today = new Date();

  try {
    // TODO: Query from Prisma once Booking model is defined
    const overdueBookings = await prisma.booking.findMany({
      where: {
        status: "Active",
        expectedReturnDate: {
          lt: today
        }
      },
      include: {
        asset: true,
        user: true
      }
    });
    return overdueBookings.map(b => ({
      bookingId: b.id,
      expectedReturnDate: b.expectedReturnDate,
      asset: b.asset,
      user: b.user
    }));
  } catch (error) {
    console.log("ℹ️ Prisma Booking models not found. Using fallback local JSON calculations.");

    // Fallback: Check if any local mock asset has expectedReturnDate < today
    const overdue = assets.filter(a => {
      if (!a.expectedReturnDate) return false;
      return new Date(a.expectedReturnDate) < today;
    });

    // Resolve category/dept relations dynamically
    return await Promise.all(
      overdue.map(async (asset) => {
        const category = asset.categoryId ? await prisma.category.findUnique({ where: { id: asset.categoryId } }).catch(() => null) : null;
        const department = asset.departmentId ? await prisma.department.findUnique({ where: { id: asset.departmentId } }).catch(() => null) : null;
        return {
          ...asset,
          category,
          department
        };
      })
    );
  }
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
  getKPIs,
  getOverdueAssets,
  getRecentActivities,
  getDepartmentStats
};
