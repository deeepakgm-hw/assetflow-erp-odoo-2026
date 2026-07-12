const dashboardService = require("../services/dashboard.service");

const getSummaryStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getSummaryStats();
    res.status(200).json({
      status: "success",
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

const getRecentActivities = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const activities = await dashboardService.getRecentActivities(limit);
    res.status(200).json({
      status: "success",
      data: { activities }
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDepartmentStats();
    res.status(200).json({
      status: "success",
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummaryStats,
  getRecentActivities,
  getDepartmentStats
};
