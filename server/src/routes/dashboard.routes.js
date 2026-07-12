const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

<<<<<<< HEAD
router.get("/summary", dashboardController.getSummaryStats);
router.get("/kpis", dashboardController.getKPIs);
router.get("/overdue", dashboardController.getOverdueAssets);
router.get("/activities", dashboardController.getRecentActivities);
router.get("/departments", dashboardController.getDepartmentStats);
=======
router.get("/summary", authenticate, dashboardController.getSummaryStats);
router.get("/activities", authenticate, dashboardController.getRecentActivities);
router.get("/departments", authenticate, dashboardController.getDepartmentStats);
router.get("/details", authenticate, dashboardController.getDetailedStats);
>>>>>>> 8e81198 (feat: redesign dashboard with premium glassmorphism and real-time metrics)

module.exports = router;
