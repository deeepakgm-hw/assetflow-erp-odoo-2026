const express = require("express");
const { param, query, validationResult } = require("express-validator");
const notificationsController = require("./notifications.controller");

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

const router = express.Router();

router.get(
  "/",
  [
    query("type")
      .optional()
      .trim()
      .isIn(["All", "Alerts", "Approvals", "Bookings"])
      .withMessage("Invalid notification type filter"),
    handleValidationErrors
  ],
  notificationsController.getAll
);

router.patch(
  "/:id/read",
  [
    param("id")
      .isInt()
      .withMessage("Notification ID must be an integer")
      .toInt(),
    handleValidationErrors
  ],
  notificationsController.markAsRead
);

module.exports = router;
