const prisma = require("../../lib/prisma");
const notify = require("../../helpers/notify");
const logActivity = require("../../helpers/logActivity");
const { getIO } = require("../../lib/socket");

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const isOverlapping = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
};

const buildDateTime = (date, time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const value = new Date(date);
  value.setHours(hours, minutes, 0, 0);
  return value;
};

const computeBookingStatus = (booking) => {
  if (booking.status === "Cancelled") return "Cancelled";

  const now = new Date();
  const start = buildDateTime(booking.date, booking.startTime);
  const end = buildDateTime(booking.date, booking.endTime);

  if (now >= end) return "Completed";
  if (now >= start) return "Ongoing";
  return "Upcoming";
};

const withComputedStatus = (booking) => ({
  ...booking,
  status: computeBookingStatus(booking)
});

const validateTimeRange = (startTime, endTime) => {
  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    const error = new Error("End time must be after start time");
    error.statusCode = 400;
    throw error;
  }
};

const scheduleBookingReminder = (booking) => {
  const reminderAt = buildDateTime(booking.date, booking.startTime).getTime() - (15 * 60 * 1000);
  const delay = reminderAt - Date.now();
  if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return;

  setTimeout(async () => {
    try {
      const latestBooking = await prisma.booking.findUnique({
        where: { id: booking.id },
        include: { resource: true }
      });
      if (!latestBooking || latestBooking.status === "Cancelled") return;

      await notify({
        userId: latestBooking.userId,
        type: "Bookings",
        message: `Reminder: ${latestBooking.resource.name} booking starts at ${latestBooking.startTime}.`
      });
    } catch (error) {
      console.error("Failed to send booking reminder:", error);
    }
  }, delay);
};

class BookingsService {
  async getBookings({ date, resourceId }) {
    const where = {};
    if (resourceId) {
      where.resourceId = resourceId;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        resource: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { startTime: "asc" }
    });

    return bookings.map(withComputedStatus);
  }

  async createBooking({ resourceId, employeeId, date, startTime, endTime, purpose }) {
    validateTimeRange(startTime, endTime);

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId }
    });

    if (!resource) {
      const error = new Error("Resource not found");
      error.statusCode = 404;
      throw error;
    }

    const employee = await prisma.user.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      const error = new Error("Employee not found");
      error.statusCode = 404;
      throw error;
    }

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Conflict detection
    const activeBookings = await prisma.booking.findMany({
      where: {
        resourceId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { not: "Cancelled" }
      }
    });

    for (const b of activeBookings) {
      if (isOverlapping(startTime, endTime, b.startTime, b.endTime)) {
        const error = new Error(`Scheduling conflict: ${startTime}-${endTime} overlaps with ${b.startTime}-${b.endTime}`);
        error.statusCode = 409;
        error.errors = [{
          msg: error.message,
          conflictingBooking: b
        }];
        throw error;
      }
    }

    const bookingStatus = computeBookingStatus({
      date: startOfDay,
      startTime,
      endTime,
      status: "Upcoming"
    });

    const booking = await prisma.booking.create({
      data: {
        resourceId,
        userId: employeeId,
        date: startOfDay,
        startTime,
        endTime,
        purpose,
        status: bookingStatus
      },
      include: {
        resource: true,
        user: true
      }
    });

    // Log Activity
    await logActivity({
      userId: employeeId,
      action: `Booked resource: ${resource.name} (${startTime}-${endTime})`,
      entityType: "Resource",
      entityId: 0
    });

    // Send Notification
    const dateStr = startOfDay.toISOString().split("T")[0];
    await notify({
      userId: employeeId,
      type: "Bookings",
      message: `You booked ${resource.name} for ${purpose} on ${dateStr} at ${startTime}-${endTime}.`
    });

    // Emit Socket event
    const io = getIO();
    if (io) {
      io.emit("Booking Created", {
        bookingId: booking.id,
        resourceId,
        resourceName: resource.name,
        employeeName: employee.name,
        date: dateStr,
        startTime,
        endTime,
        purpose
      });
    }

    scheduleBookingReminder(booking);

    return withComputedStatus(booking);
  }

  async cancelBooking(bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { resource: true }
    });

    if (!booking) {
      const error = new Error("Booking not found");
      error.statusCode = 404;
      throw error;
    }

    if (booking.status === "Cancelled") {
      const error = new Error("Booking is already cancelled");
      error.statusCode = 400;
      throw error;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "Cancelled" }
    });

    // Log Activity
    await logActivity({
      userId: booking.userId,
      action: `Cancelled booking for: ${booking.resource.name}`,
      entityType: "Resource",
      entityId: 0
    });

    // Notify user
    await notify({
      userId: booking.userId,
      type: "Bookings",
      message: `Your booking for ${booking.resource.name} has been cancelled.`
    });

    // Emit Socket event
    const io = getIO();
    if (io) {
      io.emit("Booking Cancelled", {
        bookingId,
        resourceId: booking.resourceId,
        resourceName: booking.resource.name
      });
    }

    return withComputedStatus(updatedBooking);
  }

  async rescheduleBooking(bookingId, { date, startTime, endTime }) {
    validateTimeRange(startTime, endTime);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { resource: true }
    });

    if (!booking) {
      const error = new Error("Booking not found");
      error.statusCode = 404;
      throw error;
    }

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Conflict detection excluding this booking
    const activeBookings = await prisma.booking.findMany({
      where: {
        resourceId: booking.resourceId,
        id: { not: bookingId },
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { not: "Cancelled" }
      }
    });

    for (const b of activeBookings) {
      if (isOverlapping(startTime, endTime, b.startTime, b.endTime)) {
        const error = new Error(`Scheduling conflict: ${startTime}-${endTime} overlaps with ${b.startTime}-${b.endTime}`);
        error.statusCode = 409;
        error.errors = [{
          msg: error.message,
          conflictingBooking: b
        }];
        throw error;
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        date: startOfDay,
        startTime,
        endTime,
        status: "Upcoming"
      }
    });

    // Log Activity
    await logActivity({
      userId: booking.userId,
      action: `Rescheduled booking for: ${booking.resource.name} to ${startTime}-${endTime}`,
      entityType: "Resource",
      entityId: 0
    });

    // Notify user
    const dateStr = startOfDay.toISOString().split("T")[0];
    await notify({
      userId: booking.userId,
      type: "Bookings",
      message: `Your booking for ${booking.resource.name} has been rescheduled to ${dateStr} at ${startTime}-${endTime}.`
    });

    // Emit Socket event
    const io = getIO();
    if (io) {
      io.emit("Booking Rescheduled", {
        bookingId,
        resourceId: booking.resourceId,
        resourceName: booking.resource.name,
        date: dateStr,
        startTime,
        endTime
      });
    }

    scheduleBookingReminder(updatedBooking);

    return withComputedStatus(updatedBooking);
  }
}

module.exports = new BookingsService();
