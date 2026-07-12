const prisma = require("../../lib/prisma");
const notify = require("../../helpers/notify");
const logActivity = require("../../helpers/logActivity");
const { getIO } = require("../../lib/socket");

class AllocationsService {
  async getAllocationHistory({ assetId } = {}) {
    return await prisma.allocation.findMany({
      where: assetId ? { assetId } : {},
      include: {
        asset: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async allocateAsset({ assetId, employeeId, expectedReturnDate }) {
    // Check if asset exists
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { currentHolder: true }
    });

    if (!asset) {
      const error = new Error("Asset not found");
      error.statusCode = 404;
      throw error;
    }

    // Prevent double allocation
    if (asset.status === "Allocated" || asset.status === "Overdue") {
      const holderName = asset.currentHolder ? asset.currentHolder.name : "another employee";
      const error = new Error(`Asset is currently held by ${holderName}`);
      error.statusCode = 409;
      error.errors = [{
        msg: `Asset is currently held by ${holderName}`,
        currentHolder: asset.currentHolder
      }];
      throw error;
    }

    // Check if employee exists
    const employee = await prisma.user.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      const error = new Error("Employee not found");
      error.statusCode = 404;
      throw error;
    }

    const today = new Date();
    const returnDate = expectedReturnDate ? new Date(expectedReturnDate) : null;

    // Update in transaction
    const [updatedAsset, allocation] = await prisma.$transaction([
      prisma.asset.update({
        where: { id: assetId },
        data: {
          status: "Allocated",
          currentHolderId: employeeId,
          allocatedDate: today,
          expectedReturnDate: returnDate
        }
      }),
      prisma.allocation.create({
        data: {
          assetId,
          userId: employeeId,
          allocatedDate: today,
          expectedReturnDate: returnDate,
          status: "Allocated"
        }
      })
    ]);

    // Log Activity
    await logActivity({
      userId: employeeId,
      action: `Allocated asset: ${asset.name} (${assetId}) to ${employee.name}`,
      entityType: "Asset",
      entityId: 0 // Using 0 or parsing integer, since entityId is Int, but assetId is String. Let's store 0 or a hash/integer version. Let's write helper or just log 0.
    });

    // Notify user
    const returnDateStr = returnDate ? returnDate.toISOString().split("T")[0] : "None";
    await notify({
      userId: employeeId,
      type: "Alerts",
      message: `${asset.name} has been allocated to you. Expected return: ${returnDateStr}.`
    });

    // Emit Socket event
    const io = getIO();
    if (io) {
      io.emit("Allocation Created", {
        allocationId: allocation.id,
        assetId,
        employeeId,
        employeeName: employee.name,
        assetName: asset.name
      });
    }

    return { updatedAsset, allocation };
  }

  async returnAsset(assetId, { condition, notes }) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });

    if (!asset) {
      const error = new Error("Asset not found");
      error.statusCode = 404;
      throw error;
    }

    if (!asset.currentHolderId) {
      const error = new Error("Asset is not currently allocated");
      error.statusCode = 400;
      throw error;
    }

    const oldHolderId = asset.currentHolderId;
    const today = new Date();

    // Find the open allocation record
    const openAllocation = await prisma.allocation.findFirst({
      where: {
        assetId,
        userId: oldHolderId,
        returnedDate: null
      }
    });

    // Update in transaction
    const [updatedAsset, updatedAllocation] = await prisma.$transaction([
      prisma.asset.update({
        where: { id: assetId },
        data: {
          status: "Available",
          currentHolderId: null,
          allocatedDate: null,
          expectedReturnDate: null
        }
      }),
      ...(openAllocation ? [
        prisma.allocation.update({
          where: { id: openAllocation.id },
          data: {
            returnedDate: today,
            conditionOnReturn: condition || "Good",
            notes: notes || "",
            status: "Returned"
          }
        })
      ] : [])
    ]);

    // Log Activity
    await logActivity({
      userId: oldHolderId,
      action: `Returned asset: ${asset.name} (${assetId})`,
      entityType: "Asset",
      entityId: 0
    });

    // Notify user
    await notify({
      userId: oldHolderId,
      type: "Alerts",
      message: `Your return of ${asset.name} has been processed.`
    });

    // Emit Socket event
    const io = getIO();
    if (io) {
      io.emit("Asset Returned", {
        assetId,
        employeeId: oldHolderId,
        assetName: asset.name
      });
    }

    return { updatedAsset, updatedAllocation };
  }
}

module.exports = new AllocationsService();
