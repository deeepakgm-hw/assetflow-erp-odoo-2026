const transfersService = require("./transfers.service");

class TransfersController {
  create = async (req, res, next) => {
    try {
      const {
        assetId,
        asset_id: assetIdAlias,
        fromEmployeeId,
        from_employee_id: fromEmployeeIdAlias,
        toEmployeeId,
        to_employee_id: toEmployeeIdAlias,
        reason,
        priority
      } = req.body;
      const result = await transfersService.createTransferRequest({
        assetId: assetId || assetIdAlias,
        fromEmployeeId: fromEmployeeId || fromEmployeeIdAlias,
        toEmployeeId: toEmployeeId || toEmployeeIdAlias,
        reason,
        priority
      });

      return res.status(201).json({
        success: true,
        message: "Transfer request created successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  approve = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await transfersService.approveTransfer(id);

      return res.status(200).json({
        success: true,
        message: "Transfer request approved and completed",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  reject = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await transfersService.rejectTransfer(id);

      return res.status(200).json({
        success: true,
        message: "Transfer request rejected",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const result = await transfersService.getAllTransfers();
      return res.status(200).json({
        success: true,
        message: "Transfers retrieved successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new TransfersController();
