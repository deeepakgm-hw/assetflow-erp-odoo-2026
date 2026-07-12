const prisma = require("../../lib/prisma");
const logActivity = require("../../helpers/logActivity");
const notify = require("../../helpers/notify");

class AuditService {
  /**
   * Create an audit cycle with optional department/location scope.
   * Auto-creates AuditItems for each assetId provided.
   * If no assetIds provided, auto-scopes to all assets in the specified department.
   */
  async createCycle(payload) {
    const { name, department, location, startDate, endDate, auditorIds = [], assetIds, createdById } = payload;

    if (!name || !startDate || !endDate) {
      const error = new Error("name, startDate, and endDate are required");
      error.statusCode = 400;
      throw error;
    }

    const cycle = await prisma.auditCycle.create({
      data: {
        name,
        department: department || null,
        location: location || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        auditorIds: Array.isArray(auditorIds) ? auditorIds.map(Number) : [],
        createdById: createdById || null,
        status: "Open"
      }
    });

    // Determine assets to include in this cycle
    let targetAssetIds = Array.isArray(assetIds) ? assetIds : [];

    // If no explicit assetIds given, auto-include all assets in the department scope
    if (!targetAssetIds.length && department) {
      const deptAssets = await prisma.asset.findMany({
        where: { department: { equals: department, mode: "insensitive" } },
        select: { id: true }
      });
      targetAssetIds = deptAssets.map((a) => a.id);
    }

    if (targetAssetIds.length) {
      await prisma.auditItem.createMany({
        data: targetAssetIds.map((assetId) => ({
          auditCycleId: cycle.id,
          assetId,
          status: "Pending"
        })),
        skipDuplicates: true
      });
    }

    if (createdById) {
      await logActivity({
        userId: createdById,
        action: `Created audit cycle "${cycle.name}" with ${targetAssetIds.length} asset(s)`,
        entityType: "AuditCycle",
        entityId: cycle.id
      });
    }

    return this.getCycle(cycle.id);
  }

  /**
   * List all audit cycles with items, discrepancy counts, and auditor info.
   */
  async listCycles() {
    const cycles = await prisma.auditCycle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true } },
        items: {
          include: {
            asset: { select: { id: true, name: true, type: true, department: true, status: true } }
          }
        }
      }
    });

    return cycles.map((cycle) => {
      const discrepancies = cycle.items.filter(
        (item) => item.status === "Missing" || item.status === "Damaged"
      );
      const verified = cycle.items.filter((item) => item.status === "Verified").length;
      const pending = cycle.items.filter((item) => item.status === "Pending").length;
      return { ...cycle, discrepancies, stats: { total: cycle.items.length, verified, pending, discrepancyCount: discrepancies.length } };
    });
  }

  /**
   * Get a single audit cycle with all items.
   */
  async getCycle(id) {
    const cycle = await prisma.auditCycle.findUnique({
      where: { id: Number(id) },
      include: {
        createdBy: { select: { id: true, name: true } },
        items: {
          include: {
            asset: { select: { id: true, name: true, type: true, department: true, status: true } }
          },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!cycle) {
      const error = new Error("Audit cycle not found");
      error.statusCode = 404;
      throw error;
    }

    const discrepancies = cycle.items.filter(
      (item) => item.status === "Missing" || item.status === "Damaged"
    );
    const verified = cycle.items.filter((item) => item.status === "Verified").length;
    const pending = cycle.items.filter((item) => item.status === "Pending").length;

    return {
      ...cycle,
      discrepancies,
      stats: { total: cycle.items.length, verified, pending, discrepancyCount: discrepancies.length }
    };
  }

  /**
   * Auditor marks an audit item as Verified / Missing / Damaged.
   * PATCH /audit-cycles/:cycleId/items/:itemId
   */
  async updateItem(cycleId, itemId, payload, actorId) {
    const allowedStatuses = ["Verified", "Missing", "Damaged", "Pending"];
    if (!allowedStatuses.includes(payload.status)) {
      const error = new Error(`Status must be one of: ${allowedStatuses.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }

    // Verify the item belongs to the specified cycle
    const existing = await prisma.auditItem.findFirst({
      where: { id: Number(itemId), auditCycleId: Number(cycleId) }
    });
    if (!existing) {
      const error = new Error("Audit item not found in this cycle");
      error.statusCode = 404;
      throw error;
    }

    const item = await prisma.auditItem.update({
      where: { id: Number(itemId) },
      data: {
        status: payload.status,
        notes: payload.notes !== undefined ? payload.notes : existing.notes
      },
      include: {
        asset: { select: { id: true, name: true, type: true } },
        auditCycle: { select: { id: true, name: true, status: true } }
      }
    });

    // If cycle is already closed, prevent updates
    if (item.auditCycle.status === "Closed") {
      const error = new Error("Cannot update items in a closed audit cycle");
      error.statusCode = 400;
      throw error;
    }

    if (["Missing", "Damaged"].includes(payload.status)) {
      await notify({
        userId: actorId,
        type: "Alerts",
        message: `⚠️ Audit discrepancy: "${item.asset.name}" marked as ${payload.status} in cycle "${item.auditCycle.name}"`
      });
    }

    await logActivity({
      userId: actorId,
      action: `Audit item "${item.asset.name}" marked as ${payload.status} in cycle "${item.auditCycle.name}"`,
      entityType: "AuditItem",
      entityId: item.id
    });

    return item;
  }

  /**
   * Build a structured discrepancy report for an audit cycle.
   */
  async getDiscrepancyReport(id) {
    const cycle = await prisma.auditCycle.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          include: { asset: { select: { id: true, name: true, type: true, department: true } } }
        }
      }
    });

    if (!cycle) {
      const error = new Error("Audit cycle not found");
      error.statusCode = 404;
      throw error;
    }

    return {
      cycleId: cycle.id,
      cycleName: cycle.name,
      discrepancies: cycle.items
        .filter((item) => item.status === "Missing" || item.status === "Damaged")
        .map((item) => ({
          itemId: item.id,
          assetId: item.assetId,
          assetName: item.asset?.name || "Unknown",
          status: item.status,
          notes: item.notes
        }))
    };
  }

  /**
   * Close an audit cycle:
   *  - Lock the cycle (status → Closed)
   *  - Update any Missing assets to status "Lost"
   *  - Returns the closed cycle with discrepancy summary
   */
  async closeCycle(id, actorId) {
    const cycle = await prisma.auditCycle.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          include: { asset: { select: { id: true, name: true } } }
        }
      }
    });

    if (!cycle) {
      const error = new Error("Audit cycle not found");
      error.statusCode = 404;
      throw error;
    }
    if (cycle.status === "Closed") {
      const error = new Error("Audit cycle is already closed");
      error.statusCode = 400;
      throw error;
    }

    // Mark Missing assets as Lost
    const missingItems = cycle.items.filter((item) => item.status === "Missing");
    const damagedItems = cycle.items.filter((item) => item.status === "Damaged");

    for (const item of missingItems) {
      await prisma.asset.update({
        where: { id: item.assetId },
        data: { status: "Lost" }
      });
    }

    const closed = await prisma.auditCycle.update({
      where: { id: Number(id) },
      data: { status: "Closed" },
      include: {
        items: {
          include: { asset: { select: { id: true, name: true, status: true } } }
        }
      }
    });

    await logActivity({
      userId: actorId,
      action: `Closed audit cycle "${cycle.name}" — ${missingItems.length} missing, ${damagedItems.length} damaged`,
      entityType: "AuditCycle",
      entityId: closed.id
    });

    if (actorId && (missingItems.length || damagedItems.length)) {
      await notify({
        userId: actorId,
        type: "Alerts",
        message: `Audit cycle "${cycle.name}" closed: ${missingItems.length} asset(s) marked Lost, ${damagedItems.length} damaged.`
      });
    }

    return {
      ...closed,
      discrepancySummary: {
        missing: missingItems.map((i) => ({ id: i.id, assetId: i.assetId, assetName: i.asset.name })),
        damaged: damagedItems.map((i) => ({ id: i.id, assetId: i.assetId, assetName: i.asset.name }))
      }
    };
  }

  /**
   * Generate a discrepancy report for a cycle (Missing + Damaged items).
   */
  async getDiscrepancyReport(cycleId) {
    const cycle = await prisma.auditCycle.findUnique({
      where: { id: Number(cycleId) },
      include: {
        items: {
          where: { status: { in: ["Missing", "Damaged"] } },
          include: {
            asset: { select: { id: true, name: true, type: true, department: true, serialNumber: true } }
          }
        }
      }
    });

    if (!cycle) {
      const error = new Error("Audit cycle not found");
      error.statusCode = 404;
      throw error;
    }

    return {
      cycleId: cycle.id,
      cycleName: cycle.name,
      cycleStatus: cycle.status,
      totalDiscrepancies: cycle.items.length,
      items: cycle.items
    };
  }
}

module.exports = new AuditService();
