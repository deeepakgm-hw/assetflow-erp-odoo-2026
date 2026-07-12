const express = require("express");
const controller = require("./reports.controller");

const router = express.Router();

router.get("/utilization-by-department", controller.utilizationByDepartment);
router.get("/maintenance-frequency", controller.maintenanceFrequency);
router.get("/most-used-idle-assets", controller.mostUsedIdleAssets);
router.get("/due-for-maintenance-or-retirement", controller.dueForMaintenanceOrRetirement);
router.get("/booking-heatmap", controller.bookingHeatmap);
router.get("/export", controller.exportReport);

module.exports = router;
