const bookingsService = require("./bookings.service");

class BookingsController {
  getAll = async (req, res, next) => {
    try {
      const { date, resourceId, resource_id: resourceIdAlias } = req.query;
      const result = await bookingsService.getBookings({
        date,
        resourceId: resourceId || resourceIdAlias
      });

      return res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const {
        resourceId,
        resource_id: resourceIdAlias,
        employeeId,
        employee_id: employeeIdAlias,
        date,
        startTime,
        start_time: startTimeAlias,
        endTime,
        end_time: endTimeAlias,
        purpose
      } = req.body;
      const result = await bookingsService.createBooking({
        resourceId: resourceId || resourceIdAlias,
        employeeId: employeeId || employeeIdAlias,
        date,
        startTime: startTime || startTimeAlias,
        endTime: endTime || endTimeAlias,
        purpose
      });

      return res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await bookingsService.cancelBooking(id);

      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  reschedule = async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        date,
        startTime,
        start_time: startTimeAlias,
        endTime,
        end_time: endTimeAlias
      } = req.body;
      const result = await bookingsService.rescheduleBooking(id, {
        date,
        startTime: startTime || startTimeAlias,
        endTime: endTime || endTimeAlias
      });

      return res.status(200).json({
        success: true,
        message: "Booking rescheduled successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new BookingsController();
