const auditService = require("./audit.service");

class AuditController {
  /** POST /api/audit-cycles */
  async createCycle(req, res, next) {
    try {
      const result = await auditService.createCycle({ ...req.body, createdById: req.user.id });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/audit-cycles */
  async listCycles(req, res, next) {
    try {
      const result = await auditService.listCycles();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/audit-cycles/:id */
  async getCycle(req, res, next) {
    try {
      const result = await auditService.getCycle(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /api/audit-cycles/:id/items/:itemId */
  async updateItem(req, res, next) {
    try {
      const result = await auditService.updateItem(
        req.params.id,
        req.params.itemId,
        req.body,
        req.user.id
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/audit-cycles/:id/close */
  async closeCycle(req, res, next) {
    try {
      const result = await auditService.closeCycle(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/audit-cycles/:id/discrepancies */
  async getDiscrepancyReport(req, res, next) {
    try {
      const result = await auditService.getDiscrepancyReport(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditController();
