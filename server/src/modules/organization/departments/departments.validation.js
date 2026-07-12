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

const createDepartmentValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Department name is required"),
  body("parentDepartmentId")
    .optional({ nullable: true })
    .isInt()
    .withMessage("Parent department ID must be an integer")
    .toInt(),
  body("headId")
    .optional({ nullable: true })
    .isInt()
    .withMessage("Head ID must be an integer")
    .toInt(),
  handleValidationErrors
];

const updateDepartmentValidation = [
  param("id")
    .isInt()
    .withMessage("Department ID must be an integer")
    .toInt(),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Department name cannot be empty"),
  body("parentDepartmentId")
    .optional({ nullable: true })
    .isInt()
    .withMessage("Parent department ID must be an integer")
    .toInt(),
  body("headId")
    .optional({ nullable: true })
    .isInt()
    .withMessage("Head ID must be an integer")
    .toInt(),
  handleValidationErrors
];

const statusValidation = [
  param("id")
    .isInt()
    .withMessage("Department ID must be an integer")
    .toInt(),
  body("status")
    .trim()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive"),
  handleValidationErrors
];

const headValidation = [
  param("id")
    .isInt()
    .withMessage("Department ID must be an integer")
    .toInt(),
  body("headId")
    .optional({ nullable: true })
    .isInt()
    .withMessage("Head ID must be an integer")
    .toInt(),
  handleValidationErrors
];

module.exports = {
  createDepartmentValidation,
  updateDepartmentValidation,
  statusValidation,
  headValidation,
};
