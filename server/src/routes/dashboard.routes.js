const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/summary", authenticate, dashboardController.getSummaryStats);
router.get("/kpis", authenticate, dashboardController.getKPIs);
router.get("/overdue", authenticate, dashboardController.getOverdueAssets);
router.get("/activities", authenticate, dashboardController.getRecentActivities);
router.get("/departments", authenticate, dashboardController.getDepartmentStats);
router.get("/details", authenticate, dashboardController.getDetailedStats);

module.exports = router;
