const maintenanceService = require("./maintenance.service");

class MaintenanceController {
  /** POST /api/maintenance-requests — raise a new request */
  async createRequest(req, res, next) {
    try {
      // photoUrl is set from multer file upload if present
      const photoUrl = req.file?.filename ? `/uploads/${req.file.filename}` : null;
      const result = await maintenanceService.createRequest({
        ...req.body,
        requestedById: req.user.id,
        photoUrl
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/maintenance-requests — grouped by status for kanban board */
  async listRequests(req, res, next) {
    try {
      const result = await maintenanceService.listRequests(req.query);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/maintenance-requests/:id/approve */
  async approveRequest(req, res, next) {
    try {
      const result = await maintenanceService.transitionRequest(
        req.params.id,
        "Approved",
        req.user.id,
        req.body.notes
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/maintenance-requests/:id/reject */
  async rejectRequest(req, res, next) {
    try {
      const result = await maintenanceService.transitionRequest(
        req.params.id,
        "Rejected",
        req.user.id,
        req.body.notes
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/maintenance-requests/:id/assign — body: { technicianId } */
  async assignTechnician(req, res, next) {
    try {
      if (!req.body.technicianId) {
        return res.status(400).json({ success: false, message: "technicianId is required" });
      }
      const result = await maintenanceService.assignTechnician(
        req.params.id,
        req.body.technicianId,
        req.user.id
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/maintenance-requests/:id/progress */
  async markInProgress(req, res, next) {
    try {
      const result = await maintenanceService.transitionRequest(
        req.params.id,
        "InProgress",
        req.user.id,
        req.body.notes
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/maintenance-requests/:id/resolve */
  async resolveRequest(req, res, next) {
    try {
      const result = await maintenanceService.transitionRequest(
        req.params.id,
        "Resolved",
        req.user.id,
        req.body.notes
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/maintenance-requests/asset/:assetId */
  async getAssetHistory(req, res, next) {
    try {
      const result = await maintenanceService.getAssetHistory(req.params.assetId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MaintenanceController();
