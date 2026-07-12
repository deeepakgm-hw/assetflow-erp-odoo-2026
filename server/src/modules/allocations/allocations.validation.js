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

const allocateAssetValidation = [
  body()
    .custom((value) => Boolean(value.assetId || value.asset_id))
    .withMessage("Asset ID is required"),
  body()
    .custom((value) => Boolean(value.employeeId || value.employee_id))
    .withMessage("Employee ID is required"),
  body("assetId").optional().trim(),
  body("asset_id").optional().trim(),
  body("employeeId").optional().isInt().withMessage("Employee ID must be an integer").toInt(),
  body("employee_id").optional().isInt().withMessage("Employee ID must be an integer").toInt(),
  body("expectedReturnDate")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("Expected return date must be a valid ISO8601 date string"),
  body("expected_return_date")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("Expected return date must be a valid ISO8601 date string"),
  handleValidationErrors
];

const returnAssetValidation = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Asset ID is required"),
  body("condition")
    .optional()
    .trim(),
  body("notes")
    .optional()
    .trim(),
  handleValidationErrors
];

module.exports = {
  allocateAssetValidation,
  returnAssetValidation,
};
