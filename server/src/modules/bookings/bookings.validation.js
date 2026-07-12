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

const createBookingValidation = [
  body()
    .custom((value) => Boolean(value.resourceId || value.resource_id))
    .withMessage("Resource ID is required"),
  body()
    .custom((value) => Boolean(value.employeeId || value.employee_id))
    .withMessage("Employee ID is required"),
  body()
    .custom((value) => Boolean(value.startTime || value.start_time))
    .withMessage("Start time is required"),
  body()
    .custom((value) => Boolean(value.endTime || value.end_time))
    .withMessage("End time is required"),
  body("resourceId").optional().trim(),
  body("resource_id").optional().trim(),
  body("employeeId").optional().isInt().withMessage("Employee ID must be an integer").toInt(),
  body("employee_id").optional().isInt().withMessage("Employee ID must be an integer").toInt(),
  body("date")
    .isISO8601()
    .withMessage("Date must be a valid ISO8601 date string"),
  body("startTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format"),
  body("start_time")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format"),
  body("endTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format"),
  body("end_time")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format"),
  body("purpose")
    .trim()
    .notEmpty()
    .withMessage("Booking purpose is required"),
  handleValidationErrors
];

const rescheduleBookingValidation = [
  param("id")
    .isInt()
    .withMessage("Booking ID must be an integer")
    .toInt(),
  body("date")
    .isISO8601()
    .withMessage("Date must be a valid ISO8601 date string"),
  body()
    .custom((value) => Boolean(value.startTime || value.start_time))
    .withMessage("Start time is required"),
  body()
    .custom((value) => Boolean(value.endTime || value.end_time))
    .withMessage("End time is required"),
  body("startTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format"),
  body("start_time")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format"),
  body("endTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format"),
  body("end_time")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format"),
  handleValidationErrors
];

const cancelBookingValidation = [
  param("id")
    .isInt()
    .withMessage("Booking ID must be an integer")
    .toInt(),
  handleValidationErrors
];

module.exports = {
  createBookingValidation,
  rescheduleBookingValidation,
  cancelBookingValidation,
};
