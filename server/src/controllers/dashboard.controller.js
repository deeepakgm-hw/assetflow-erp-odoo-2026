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

const getKPIs = async (req, res, next) => {
  try {
    const kpis = await dashboardService.getKPIs();
    res.status(200).json({
      status: "success",
      data: kpis
    });
  } catch (error) {
    next(error);
  }
};

const getOverdueAssets = async (req, res, next) => {
  try {
    const assets = await dashboardService.getOverdueAssets();
    res.status(200).json({
      status: "success",
      results: assets.length,
      data: { assets }
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

const getDetails = async (req, res, next) => {
  try {
    const details = await dashboardService.getDetails();
    res.status(200).json({
      status: "success",
      data: details
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummaryStats,
  getKPIs,
  getOverdueAssets,
  getRecentActivities,
  getDepartmentStats,
  getDetails
};
