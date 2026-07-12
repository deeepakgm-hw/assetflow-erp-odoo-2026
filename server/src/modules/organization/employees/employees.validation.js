const { body, param, query, validationResult } = require("express-validator");

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

const updateRoleValidation = [
  param("id")
    .isInt()
    .withMessage("Employee ID must be an integer")
    .toInt(),
  body("role")
    .trim()
    .isIn(["Admin", "AssetManager", "DeptHead", "Employee"])
    .withMessage("Invalid role specified"),
  handleValidationErrors
];

const updateDepartmentValidation = [
  param("id")
    .isInt()
    .withMessage("Employee ID must be an integer")
    .toInt(),
  body("departmentId")
    .custom((value) => {
      if (value === null || Number.isInteger(value)) {
        return true;
      }
      throw new Error("departmentId must be an integer or null");
    })
    .toInt(),
  handleValidationErrors
];

const listQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be at least 1")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
  query("departmentId")
    .optional()
    .isInt()
    .withMessage("departmentId must be an integer")
    .toInt(),
  query("role")
    .optional()
    .isIn(["Admin", "AssetManager", "DeptHead", "Employee"])
    .withMessage("Invalid role filter"),
  query("search")
    .optional()
    .trim(),
  handleValidationErrors
];

module.exports = {
  updateRoleValidation,
  updateDepartmentValidation,
  listQueryValidation,
};
