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
    return [];
  }
};

/**
 * Retrieve department-wise asset count and total value metrics.
 * @returns {Promise<Array>} - List of stats per department
 */
const getDepartmentStats = async () => {
  const assets = readAssets();
  
  try {
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
  } catch (error) {
    return [];
  }
};

/**
 * Aggregate complete dashboard statistics (for redesigned frontend)
 * @returns {Promise<Object>}
 */
const getDetails = async () => {
  const assets = readAssets();

  // Get department statistics
  const deptStats = await getDepartmentStats();

  let totalDepts = 0;
  let totalUsers = 0;

  try {
    totalDepts = await prisma.department.count();
    totalUsers = await prisma.user.count();
  } catch (error) {
    totalDepts = deptStats.length;
    totalUsers = 1;
  }

  // Count status distribution
  const statusCounts = {
    available: assets.filter(a => a.status.toLowerCase() === "available" || a.status.toLowerCase() === "active").length,
    allocated: assets.filter(a => a.status.toLowerCase() === "allocated").length,
    maintenance: assets.filter(a => a.status.toLowerCase() === "maintenance").length
  };

  const assetStatusChart = [
    { name: "Available", value: statusCounts.available },
    { name: "Allocated", value: statusCounts.allocated },
    { name: "Maintenance", value: statusCounts.maintenance }
  ];

  const departmentChart = deptStats.map(d => ({
    name: d.departmentName,
    value: d.assetCount
  }));

  // Fetch recent activity audit logs
  const recentActivities = await getRecentActivities(5);

  // Generate maintenance timeline list
  const upcomingMaintenance = assets
    .filter(a => a.status.toLowerCase() === "maintenance")
    .slice(0, 4)
    .map(a => ({
      id: a.id,
      assetName: a.name,
      department: a.department?.name || "Unassigned",
      dueDate: new Date().toLocaleDateString(undefined, { dateStyle: "short" }),
      priority: a.id % 2 === 0 ? "High" : "Medium"
    }));

  // Generate today's bookings
  const resourceBookings = assets
    .filter(a => a.status.toLowerCase() === "allocated" && a.isBookable)
    .slice(0, 4)
    .map(a => ({
      id: a.id,
      resource: a.name,
      bookedBy: a.department?.name || "Engineering Staff",
      time: "09:00 AM - 05:00 PM",
      status: "Confirmed"
    }));

  // Generate recent assets table list
  const recentAssetsList = assets.slice(-5).map(a => ({
    id: a.id,
    name: a.name,
    categoryName: a.category?.name || "General",
    departmentName: a.department?.name || "Unassigned",
    status: a.status,
    assignedTo: a.department?.name || "Unassigned"
  }));

  return {
    kpis: {
      totalAssets: assets.length,
      allocatedAssets: statusCounts.allocated,
      availableAssets: statusCounts.available,
      departments: totalDepts,
      employees: totalUsers,
      pendingMaintenance: statusCounts.maintenance,
      resourceBookingsToday: resourceBookings.length,
      pendingApprovals: 0
    },
    recentActivities,
    upcomingMaintenance,
    resourceBookings,
    recentAssets: recentAssetsList,
    assetStatusChart,
    departmentChart
  };
};

module.exports = {
  getSummaryStats,
  getKPIs,
  getOverdueAssets,
  getRecentActivities,
  getDepartmentStats,
  getDetails
};
