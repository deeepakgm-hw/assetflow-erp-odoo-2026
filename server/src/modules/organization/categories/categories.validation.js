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

const createCategoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required"),
  body("customFields")
    .optional({ nullable: true })
    .isObject()
    .withMessage("customFields must be a JSON object"),
  handleValidationErrors
];

const updateCategoryValidation = [
  param("id")
    .isInt()
    .withMessage("Category ID must be an integer")
    .toInt(),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category name cannot be empty"),
  body("customFields")
    .optional({ nullable: true })
    .isObject()
    .withMessage("customFields must be a JSON object"),
  handleValidationErrors
];

module.exports = {
  createCategoryValidation,
  updateCategoryValidation,
};
