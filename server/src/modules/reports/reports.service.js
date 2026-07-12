const prisma = require("../../lib/prisma");

class ReportsService {
  /**
   * GET /reports/utilization-by-department
   * Counts total, available, inUse assets per department.
   */
  async utilizationByDepartment() {
    const assets = await prisma.asset.findMany({
      select: { id: true, department: true, status: true }
    });

    const grouped = assets.reduce((acc, asset) => {
      const key = asset.department || "Unassigned";
      if (!acc[key]) acc[key] = { department: key, total: 0, available: 0, inUse: 0, underMaintenance: 0 };
      acc[key].total += 1;
      if (asset.status === "Available") acc[key].available += 1;
      else if (asset.status === "UnderMaintenance" || asset.status === "Maintenance") acc[key].underMaintenance += 1;
      else acc[key].inUse += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }

  /**
   * GET /reports/maintenance-frequency
   * Returns maintenance request counts by individual asset and by asset category.
   */
  async maintenanceFrequency() {
    const requests = await prisma.maintenanceRequest.findMany({
      include: { asset: { select: { name: true, type: true } } }
    });

    const byAssetMap = {};
    const byCategoryMap = {};

    for (const req of requests) {
      const assetName = req.asset?.name || "Unknown";
      const category = req.asset?.type || "Unknown";

      byAssetMap[assetName] = (byAssetMap[assetName] || 0) + 1;
      byCategoryMap[category] = (byCategoryMap[category] || 0) + 1;
    }

    return {
      byAsset: Object.entries(byAssetMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
      byCategory: Object.entries(byCategoryMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    };
  }

  /**
   * GET /reports/most-used-idle-assets
   * Computes per-asset usage score from allocation + booking counts.
   */
  async mostUsedIdleAssets() {
    const assets = await prisma.asset.findMany({
      select: { id: true, name: true, type: true, department: true, status: true },
      orderBy: { name: "asc" }
    });

    // Count allocations per asset
    const allocationCounts = await prisma.allocation.groupBy({
      by: ["assetId"],
      _count: { id: true }
    });
    const allocMap = Object.fromEntries(allocationCounts.map((a) => [a.assetId, a._count.id]));

    // Count bookings per resource (resources ≠ assets in schema, but bookings reveal usage intent)
    // We score assets by: allocations only (bookings are for Resource, not Asset in this schema)
    const scored = assets.map((asset) => ({
      ...asset,
      usageScore: allocMap[asset.id] || 0
    }));

    const mostUsed = scored
      .filter((a) => a.usageScore > 0)
      .sort((a, b) => b.usageScore - a.usageScore)
      .slice(0, 10);

    const idle = scored
      .filter((a) => a.status === "Available" && a.usageScore === 0)
      .slice(0, 10);

    return { mostUsed, idle };
  }

  /**
   * GET /reports/due-for-maintenance-or-retirement
   * Assets with active maintenance requests + Lost/Scrapped assets.
   */
  async dueForMaintenanceOrRetirement() {
    const [activeRequests, retiredAssets] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where: { status: { in: ["Pending", "Approved", "TechnicianAssigned", "InProgress"] } },
        include: {
          asset: { select: { id: true, name: true, type: true, department: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.asset.findMany({
        where: { status: { in: ["Lost", "Scrapped", "Retired"] } },
        select: { id: true, name: true, type: true, department: true, status: true }
      })
    ]);

    return {
      maintenance: activeRequests.map((r) => ({
        requestId: r.id,
        assetId: r.asset.id,
        name: r.asset.name,
        type: r.asset.type,
        department: r.asset.department,
        reason: "Maintenance required",
        status: r.status,
        priority: r.priority,
        since: r.createdAt
      })),
      retirement: retiredAssets
    };
  }

  /**
   * GET /reports/booking-heatmap
   * Returns booking density by day-of-week and hour.
   */
  async bookingHeatmap() {
    const bookings = await prisma.booking.findMany({
      select: { date: true, startTime: true, status: true }
    });

    // Build a day × hour grid
    const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const grid = {};

    for (const booking of bookings) {
      if (booking.status === "Cancelled") continue;
      const day = DAYS[new Date(booking.date).getDay()];
      const hour = booking.startTime ? parseInt(booking.startTime.split(":")[0], 10) : 9;
      const key = `${day}-${String(hour).padStart(2, "0")}:00`;
      grid[key] = (grid[key] || 0) + 1;
    }

    return Object.entries(grid)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }

  /**
   * GET /reports/export?type=utilizationByDepartment|maintenanceFrequency|dueForMaintenanceOrRetirement|mostUsedIdleAssets
   * Returns CSV string.
   */
  async exportReport(type = "utilizationByDepartment") {
    const methodMap = {
      utilizationByDepartment: () => this.utilizationByDepartment(),
      maintenanceFrequency: async () => {
        const d = await this.maintenanceFrequency();
        return d.byAsset; // flat array for CSV
      },
      dueForMaintenanceOrRetirement: async () => {
        const d = await this.dueForMaintenanceOrRetirement();
        return [...d.maintenance, ...d.retirement.map((a) => ({ ...a, reason: "Retirement/Lost", status: a.status }))];
      },
      mostUsedIdleAssets: async () => {
        const d = await this.mostUsedIdleAssets();
        return [...d.mostUsed.map((a) => ({ ...a, category: "MostUsed" })), ...d.idle.map((a) => ({ ...a, category: "Idle" }))];
      },
      bookingHeatmap: () => this.bookingHeatmap()
    };

    const fn = methodMap[type] || methodMap.utilizationByDepartment;
    const data = await fn();

    if (!Array.isArray(data) || data.length === 0) {
      return "No data available\n";
    }

    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        if (typeof val === "object") return JSON.stringify(val).replace(/,/g, ";");
        const str = String(val);
        return str.includes(",") ? `"${str}"` : str;
      }).join(",")
    );

    return [headers.join(","), ...rows].join("\n");
  }
}

module.exports = new ReportsService();
