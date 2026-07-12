const prisma = require("../lib/prisma");
const notify = require("./notify");
const logActivity = require("./logActivity");
const { getIO } = require("../lib/socket");

const checkOverdueAllocations = async () => {
  try {
    const today = new Date();
    
    // Find all Allocated assets that are past their expected return date
    const overdueAssets = await prisma.asset.findMany({
      where: {
        status: "Allocated",
        expectedReturnDate: {
          lt: today
        }
      },
      include: {
        currentHolder: true
      }
    });

    if (overdueAssets.length === 0) {
      return;
    }

    console.log(`⏰ Overdue return check: Found ${overdueAssets.length} overdue assets`);

    for (const asset of overdueAssets) {
      const holderId = asset.currentHolderId;
      const holderName = asset.currentHolder ? asset.currentHolder.name : "Employee";

      // Update asset and allocation status to Overdue
      await prisma.$transaction([
        prisma.asset.update({
          where: { id: asset.id },
          data: { status: "Overdue" }
        }),
        prisma.allocation.updateMany({
          where: {
            assetId: asset.id,
            userId: holderId,
            returnedDate: null
          },
          data: { status: "Overdue" }
        })
      ]);

      // Log Activity
      await logActivity({
        userId: holderId,
        action: `Asset return is OVERDUE: ${asset.name} (${asset.id}) held by ${holderName}`,
        entityType: "Asset",
        entityId: 0
      });

      // Send Notification to employee
      await notify({
        userId: holderId,
        type: "Alerts",
        message: `OVERDUE NOTICE: Please return ${asset.name} as soon as possible. Expected return date was ${asset.expectedReturnDate.toISOString().split("T")[0]}.`
      });

      // Emit Socket event
      const io = getIO();
      if (io) {
        io.emit("Reminder", {
          assetId: asset.id,
          assetName: asset.name,
          employeeId: holderId,
          employeeName: holderName,
          expectedReturnDate: asset.expectedReturnDate
        });
      }
    }
  } catch (error) {
    console.error("Failed to run overdue check daemon:", error);
  }
};

const startOverdueChecker = () => {
  // Run on startup
  setTimeout(checkOverdueAllocations, 5000);

  // Run every hour
  const intervalMs = 60 * 60 * 1000;
  setInterval(checkOverdueAllocations, intervalMs);

  console.log("⏰ Overdue Checker daemon registered (runs hourly)");
};

module.exports = {
  checkOverdueAllocations,
  startOverdueChecker
};
