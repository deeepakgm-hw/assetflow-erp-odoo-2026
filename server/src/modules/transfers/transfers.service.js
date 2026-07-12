const prisma = require("../../lib/prisma");
const notify = require("../../helpers/notify");
const logActivity = require("../../helpers/logActivity");
const { getIO } = require("../../lib/socket");

const userSummarySelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  departmentId: true
};

class TransfersService {
  async createTransferRequest({ assetId, fromEmployeeId, toEmployeeId, reason, priority }) {
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

    if (!asset.currentHolderId) {
      const error = new Error("Asset is not currently allocated, cannot request transfer");
      error.statusCode = 400;
      throw error;
    }

    const activeHolderId = asset.currentHolderId;
    const requestedFromEmployeeId = fromEmployeeId || activeHolderId;

    if (requestedFromEmployeeId !== activeHolderId) {
      const holderName = asset.currentHolder ? asset.currentHolder.name : "another employee";
      const error = new Error(`Transfer source must match current holder: ${holderName}`);
      error.statusCode = 409;
      throw error;
    }

    if (requestedFromEmployeeId === toEmployeeId) {
      const error = new Error("Cannot transfer an asset to its current holder");
      error.statusCode = 400;
      throw error;
    }

    // Check if recipient employee exists
    const toEmployee = await prisma.user.findUnique({
      where: { id: toEmployeeId }
    });

    if (!toEmployee) {
      const error = new Error("Recipient employee not found");
      error.statusCode = 404;
      throw error;
    }

    const fromEmployee = await prisma.user.findUnique({
      where: { id: requestedFromEmployeeId }
    });

    // Create the transfer request
    const transfer = await prisma.transferRequest.create({
      data: {
        assetId,
        fromUserId: requestedFromEmployeeId,
        toUserId: toEmployeeId,
        reason,
        priority: priority || "Medium",
        status: "Pending"
      },
      include: {
        asset: true,
        fromUser: { select: userSummarySelect },
        toUser: { select: userSummarySelect }
      }
    });

    // Log Activity
    await logActivity({
      userId: toEmployeeId,
      action: `Requested transfer of asset: ${asset.name} (${assetId}) from ${fromEmployee.name}`,
      entityType: "Asset",
      entityId: 0
    });

    // Notify current holder and recipient
    await notify({
      userId: requestedFromEmployeeId,
      type: "Alerts",
      message: `${toEmployee.name} has requested a transfer for your allocated ${asset.name}.`
    });

    await notify({
      userId: toEmployeeId,
      type: "Alerts",
      message: `Your transfer request for ${asset.name} is submitted and pending approval.`
    });

    // Emit Socket event
    const io = getIO();
    if (io) {
      io.emit("Transfer Created", {
        transferId: transfer.id,
        assetId,
        assetName: asset.name,
        fromEmployeeName: fromEmployee.name,
        toEmployeeName: toEmployee.name,
        reason,
        priority
      });
    }

    return transfer;
  }

  async approveTransfer(transferId) {
    const transfer = await prisma.transferRequest.findUnique({
      where: { id: transferId },
      include: {
        asset: true,
        fromUser: { select: userSummarySelect },
        toUser: { select: userSummarySelect }
      }
    });

    if (!transfer) {
      const error = new Error("Transfer request not found");
      error.statusCode = 404;
      throw error;
    }

    if (transfer.status !== "Pending") {
      const error = new Error(`Transfer request is already ${transfer.status.toLowerCase()}`);
      error.statusCode = 400;
      throw error;
    }

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);

    // Find active allocation for fromUserId
    const activeAllocation = await prisma.allocation.findFirst({
      where: {
        assetId: transfer.assetId,
        userId: transfer.fromUserId,
        returnedDate: null
      }
    });

    // Perform transaction
    const [updatedTransfer, updatedAsset, newAllocation] = await prisma.$transaction([
      prisma.transferRequest.update({
        where: { id: transferId },
        data: { status: "Approved" }
      }),
      prisma.asset.update({
        where: { id: transfer.assetId },
        data: {
          currentHolderId: transfer.toUserId,
          allocatedDate: today,
          expectedReturnDate: nextMonth,
          status: "Allocated"
        }
      }),
      prisma.allocation.create({
        data: {
          assetId: transfer.assetId,
          userId: transfer.toUserId,
          allocatedDate: today,
          expectedReturnDate: nextMonth,
          status: "Allocated"
        }
      }),
      ...(activeAllocation ? [
        prisma.allocation.update({
          where: { id: activeAllocation.id },
          data: {
            returnedDate: today,
            status: "Returned"
          }
        })
      ] : [])
    ]);

    // Log Activity
    await logActivity({
      userId: transfer.toUserId,
      action: `Approved transfer of asset: ${transfer.asset.name} to ${transfer.toUser.name}`,
      entityType: "Asset",
      entityId: 0
    });

    // Notify both users
    await notify({
      userId: transfer.fromUserId,
      type: "Alerts",
      message: `Your asset ${transfer.asset.name} has been transferred to ${transfer.toUser.name}.`
    });

    await notify({
      userId: transfer.toUserId,
      type: "Alerts",
      message: `Transfer approved! ${transfer.asset.name} is now allocated to you. Expected return: ${nextMonth.toISOString().split("T")[0]}`
    });

    // Emit Socket event
    const io = getIO();
    if (io) {
      io.emit("Transfer Approved", {
        transferId,
        assetId: transfer.assetId,
        assetName: transfer.asset.name,
        toEmployeeName: transfer.toUser.name
      });
    }

    return { updatedTransfer, updatedAsset, newAllocation };
  }

  async rejectTransfer(transferId) {
    const transfer = await prisma.transferRequest.findUnique({
      where: { id: transferId },
      include: {
        asset: true,
        toUser: { select: userSummarySelect }
      }
    });

    if (!transfer) {
      const error = new Error("Transfer request not found");
      error.statusCode = 404;
      throw error;
    }

    if (transfer.status !== "Pending") {
      const error = new Error(`Transfer request is already ${transfer.status.toLowerCase()}`);
      error.statusCode = 400;
      throw error;
    }

    const updatedTransfer = await prisma.transferRequest.update({
      where: { id: transferId },
      data: { status: "Rejected" }
    });

    // Log Activity
    await logActivity({
      userId: transfer.toUserId,
      action: `Rejected transfer of asset: ${transfer.asset.name} to ${transfer.toUser.name}`,
      entityType: "Asset",
      entityId: 0
    });

    // Notify requesting user
    await notify({
      userId: transfer.toUserId,
      type: "Alerts",
      message: `Your transfer request for ${transfer.asset.name} was rejected.`
    });

    // Emit Socket event
    const io = getIO();
    if (io) {
      io.emit("Transfer Rejected", {
        transferId,
        assetId: transfer.assetId,
        assetName: transfer.asset.name,
        toEmployeeName: transfer.toUser.name
      });
    }

    return updatedTransfer;
  }

  async getAllTransfers() {
    return await prisma.transferRequest.findMany({
      include: {
        asset: true,
        fromUser: { select: userSummarySelect },
        toUser: { select: userSummarySelect }
      },
      orderBy: { createdAt: "desc" }
    });
  }
}

module.exports = new TransfersService();
