const allocationsService = require("./allocations.service");

class AllocationsController {
  getAll = async (req, res, next) => {
    try {
      const { assetId, asset_id: assetIdAlias } = req.query;
      const result = await allocationsService.getAllocationHistory({
        assetId: assetId || assetIdAlias
      });

      return res.status(200).json({
        success: true,
        message: "Allocation history retrieved successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  allocate = async (req, res, next) => {
    try {
      const {
        assetId,
        asset_id: assetIdAlias,
        employeeId,
        employee_id: employeeIdAlias,
        expectedReturnDate,
        expected_return_date: expectedReturnDateAlias
      } = req.body;
      const result = await allocationsService.allocateAsset({
        assetId: assetId || assetIdAlias,
        employeeId: employeeId || employeeIdAlias,
        expectedReturnDate: expectedReturnDate || expectedReturnDateAlias
      });

      return res.status(201).json({
        success: true,
        message: "Asset allocated successfully",
        data: result
      });
    } catch (error) {
      if (error.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: error.message,
          errors: [{ msg: error.message }]
        });
      }
      next(error);
    }
  };

  returnAsset = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { condition, notes } = req.body;
      const result = await allocationsService.returnAsset(id, { condition, notes });

      return res.status(200).json({
        success: true,
        message: "Asset returned successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AllocationsController();
