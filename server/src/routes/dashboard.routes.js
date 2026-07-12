const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/summary", dashboardController.getSummaryStats);
router.get("/kpis", dashboardController.getKPIs);
router.get("/overdue", dashboardController.getOverdueAssets);
router.get("/activities", dashboardController.getRecentActivities);
router.get("/departments", dashboardController.getDepartmentStats);
router.get("/details", dashboardController.getDetails);

module.exports = router;
