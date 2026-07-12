const express = require("express");
const bookingsController = require("./bookings.controller");
const { createBookingValidation, rescheduleBookingValidation, cancelBookingValidation } = require("./bookings.validation");
const authenticate = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, bookingsController.getAll);
router.post("/", authenticate, createBookingValidation, bookingsController.create);
router.patch("/:id/cancel", authenticate, cancelBookingValidation, bookingsController.cancel);
router.patch("/:id/reschedule", authenticate, rescheduleBookingValidation, bookingsController.reschedule);

module.exports = router;
