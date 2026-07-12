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

const createAssetValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Asset name is required"),
  body("category_id")
    .isInt()
    .withMessage("category_id must be an integer")
    .toInt(),
  body("serial_number")
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .withMessage("serial_number cannot be empty if provided"),
  body("acquisition_cost")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("acquisition_cost must be a positive number")
    .toFloat(),
  body("condition")
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .withMessage("condition cannot be empty if provided"),
  body("location")
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .withMessage("location cannot be empty if provided"),
  body("is_bookable")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("is_bookable must be a boolean")
    .toBoolean(),
  handleValidationErrors
];

const updateAssetValidation = [
  param("id")
    .isInt()
    .withMessage("Asset ID must be an integer")
    .toInt(),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Asset name cannot be empty"),
  body("category_id")
    .optional()
    .isInt()
    .withMessage("category_id must be an integer")
    .toInt(),
  body("serial_number")
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .withMessage("serial_number cannot be empty"),
  body("acquisition_cost")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("acquisition_cost must be a positive number")
    .toFloat(),
  body("condition")
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .withMessage("condition cannot be empty"),
  body("location")
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .withMessage("location cannot be empty"),
  body("is_bookable")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("is_bookable must be a boolean")
    .toBoolean(),
  handleValidationErrors
];

module.exports = {
  createAssetValidation,
  updateAssetValidation
};
