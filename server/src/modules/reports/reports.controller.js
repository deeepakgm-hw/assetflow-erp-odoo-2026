const reportsService = require("./reports.service");

class ReportsController {
  /** GET /api/reports/utilization-by-department */
  async utilizationByDepartment(req, res, next) {
    try {
      const result = await reportsService.utilizationByDepartment();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/reports/maintenance-frequency */
  async maintenanceFrequency(req, res, next) {
    try {
      const result = await reportsService.maintenanceFrequency();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/reports/most-used-idle-assets */
  async mostUsedIdleAssets(req, res, next) {
    try {
      const result = await reportsService.mostUsedIdleAssets();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/reports/due-for-maintenance-or-retirement */
  async dueForMaintenanceOrRetirement(req, res, next) {
    try {
      const result = await reportsService.dueForMaintenanceOrRetirement();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/reports/booking-heatmap */
  async bookingHeatmap(req, res, next) {
    try {
      const result = await reportsService.bookingHeatmap();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/export?type=utilizationByDepartment|maintenanceFrequency|...
   * Streams a CSV file download.
   */
  async exportReport(req, res, next) {
    try {
      const type = req.query.type || "utilizationByDepartment";
      const csv = await reportsService.exportReport(type);
      const filename = `assetflow-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
      res
        .status(200)
        .setHeader("Content-Type", "text/csv; charset=utf-8")
        .setHeader("Content-Disposition", `attachment; filename="${filename}"`)
        .send(csv);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportsController();
