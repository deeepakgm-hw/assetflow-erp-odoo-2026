const { body, param, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

const createTransferValidation = [
  body()
    .custom((value) => Boolean(value.assetId || value.asset_id))
    .withMessage("Asset ID is required"),
  body()
    .custom((value) => Boolean(value.toEmployeeId || value.to_employee_id))
    .withMessage("Recipient employee ID is required"),
  body("assetId").optional().trim(),
  body("asset_id").optional().trim(),
  body("fromEmployeeId").optional().isInt().withMessage("Source employee ID must be an integer").toInt(),
  body("from_employee_id").optional().isInt().withMessage("Source employee ID must be an integer").toInt(),
  body("toEmployeeId").optional().isInt().withMessage("Recipient employee ID must be an integer").toInt(),
  body("to_employee_id").optional().isInt().withMessage("Recipient employee ID must be an integer").toInt(),
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Transfer reason is required"),
  body("priority")
    .optional()
    .trim()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High"),
  handleValidationErrors
];

const approveTransferValidation = [
  param("id")
    .isInt()
    .withMessage("Transfer request ID must be an integer")
    .toInt(),
  handleValidationErrors
];

module.exports = {
  createTransferValidation,
  approveTransferValidation,
};
