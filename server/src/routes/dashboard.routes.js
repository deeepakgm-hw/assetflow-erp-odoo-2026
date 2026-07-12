const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/summary", dashboardController.getSummaryStats);
router.get("/activities", dashboardController.getRecentActivities);
router.get("/departments", dashboardController.getDepartmentStats);

module.exports = router;
