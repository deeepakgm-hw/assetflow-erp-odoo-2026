const prisma = require("../../lib/prisma");
const logActivity = require("../../helpers/logActivity");
const notify = require("../../helpers/notify");

// Defines valid forward transitions: only these sequences are allowed
const VALID_TRANSITIONS = {
  Pending: ["Approved", "Rejected"],
  Approved: ["TechnicianAssigned", "Rejected"],
  TechnicianAssigned: ["InProgress"],
  InProgress: ["Resolved"],
  Rejected: [],
  Resolved: []
};

class MaintenanceService {
  /**
   * Raise a new maintenance request for an asset.
   * @param {Object} payload - { assetId, requestedById, description, priority, photoUrl }
   */
  async createRequest(payload) {
    const asset = await prisma.asset.findUnique({ where: { id: payload.assetId } });
    if (!asset) {
      const error = new Error("Asset not found");
      error.statusCode = 404;
      throw error;
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        assetId: payload.assetId,
        requestedById: payload.requestedById,
        description: payload.description,
        priority: payload.priority || "Medium",
        photoUrl: payload.photoUrl || null,
        status: "Pending"
      },
      include: {
        asset: true,
        requestedBy: { select: { id: true, name: true, role: true } }
      }
    });

    await logActivity({
      userId: payload.requestedById,
      action: `Raised maintenance request for asset: ${asset.name}`,
      entityType: "MaintenanceRequest",
      entityId: request.id
    });

    // Notify all managers — in the absence of a role-based broadcast, notify requester
    await notify({
      userId: payload.requestedById,
      type: "Approvals",
      message: `Your maintenance request for "${asset.name}" has been submitted and is Pending review.`
    });

    return request;
  }

  /**
   * List all maintenance requests, grouped by status for the kanban board.
   * Optional query: { status, assetId }
   */
  async listRequests(query = {}) {
    const where = {};
    if (query.status) where.status = query.status;
    if (query.assetId) where.assetId = query.assetId;

    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        asset: { select: { id: true, name: true, type: true, department: true, status: true } },
        requestedBy: { select: { id: true, name: true, role: true } },
        approvedBy: { select: { id: true, name: true, role: true } },
        technician: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Return grouped by status (all 6 buckets always present)
    const columns = ["Pending", "Approved", "TechnicianAssigned", "InProgress", "Resolved", "Rejected"];
    const grouped = Object.fromEntries(columns.map((col) => [col, []]));
    for (const request of requests) {
      const key = request.status || "Pending";
      if (grouped[key] !== undefined) grouped[key].push(request);
    }
    return grouped;
  }

  /**
   * Assign a technician and move status to TechnicianAssigned.
   */
  async assignTechnician(id, technicianId, actorId) {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id: Number(id) },
      include: { asset: true }
    });
    if (!request) {
      const error = new Error("Maintenance request not found");
      error.statusCode = 404;
      throw error;
    }

    if (!VALID_TRANSITIONS[request.status]?.includes("TechnicianAssigned")) {
      const error = new Error(`Cannot assign technician when status is "${request.status}"`);
      error.statusCode = 400;
      throw error;
    }

    const technician = await prisma.user.findUnique({ where: { id: Number(technicianId) } });
    if (!technician) {
      const error = new Error("Technician not found");
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id: Number(id) },
      data: { technicianId: Number(technicianId), status: "TechnicianAssigned" },
      include: {
        asset: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } }
      }
    });

    await logActivity({
      userId: actorId,
      action: `Assigned technician "${technician.name}" to maintenance request #${updated.id} for ${updated.asset.name}`,
      entityType: "MaintenanceRequest",
      entityId: updated.id
    });

    await notify({
      userId: technician.id,
      type: "Alerts",
      message: `You have been assigned to maintain asset "${updated.asset.name}" (Request #${updated.id}).`
    });

    return updated;
  }

  /**
   * Transition a request to a new status, with asset status side-effects.
   * Handles: Approved, Rejected, InProgress, Resolved.
   */
  async transitionRequest(id, newStatus, actorId, notes) {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id: Number(id) },
      include: { asset: true }
    });
    if (!request) {
      const error = new Error("Maintenance request not found");
      error.statusCode = 404;
      throw error;
    }

    const validNext = VALID_TRANSITIONS[request.status] || [];
    if (!validNext.includes(newStatus)) {
      const error = new Error(
        `Invalid transition: "${request.status}" → "${newStatus}". Allowed: [${validNext.join(", ")}]`
      );
      error.statusCode = 400;
      throw error;
    }

    const updateData = { status: newStatus };
    if (notes !== undefined) updateData.notes = notes;
    if (newStatus === "Approved" || newStatus === "Rejected") {
      updateData.approvedById = actorId;
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        asset: { select: { id: true, name: true } },
        requestedBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } }
      }
    });

    // Asset status side-effects
    if (newStatus === "Approved") {
      await prisma.asset.update({ where: { id: request.assetId }, data: { status: "UnderMaintenance" } });
    }
    if (newStatus === "Resolved") {
      await prisma.asset.update({ where: { id: request.assetId }, data: { status: "Available" } });
    }

    await logActivity({
      userId: actorId,
      action: `Maintenance request #${updated.id} for "${request.asset.name}" moved to ${newStatus}`,
      entityType: "MaintenanceRequest",
      entityId: updated.id
    });

    await notify({
      userId: request.requestedById,
      type: "Approvals",
      message: `Your maintenance request for "${request.asset.name}" is now ${newStatus}.`
    });

    return updated;
  }

  /**
   * Full maintenance history for a single asset (for Person B's asset detail view).
   */
  async getAssetHistory(assetId) {
    return prisma.maintenanceRequest.findMany({
      where: { assetId },
      include: {
        requestedBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }
}

module.exports = new MaintenanceService();
