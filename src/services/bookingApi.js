import { INITIAL_RESOURCES, INITIAL_BOOKINGS } from "../data/mockData";
import { allocationApi } from "./allocationApi";
import { apiClient } from "./apiClient";

// Seed local storage for resources and bookings
const initLocalStorage = () => {
  if (!localStorage.getItem("af_resources")) {
    localStorage.setItem("af_resources", JSON.stringify(INITIAL_RESOURCES));
  }
  if (!localStorage.getItem("af_bookings")) {
    localStorage.setItem("af_bookings", JSON.stringify(INITIAL_BOOKINGS));
  }
};

initLocalStorage();

const getStored = (key) => JSON.parse(localStorage.getItem(key));
const setStored = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Convert time string "HH:MM" to minutes for easy comparison
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Check if two time slots overlap: [start1, end1] and [start2, end2]
const isOverlapping = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  
  // Overlap condition: start1 < end2 AND start2 < end1
  return s1 < e2 && s2 < e1;
};

const buildDateTime = (date, time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const value = new Date(`${date}T00:00:00`);
  value.setHours(hours, minutes, 0, 0);
  return value;
};

const withComputedStatus = (booking) => {
  if (booking.status === "Cancelled") return booking;

  const now = new Date();
  const start = buildDateTime(booking.date, booking.startTime);
  const end = buildDateTime(booking.date, booking.endTime);

  if (now >= end) return { ...booking, status: "Completed" };
  if (now >= start) return { ...booking, status: "Ongoing" };
  return { ...booking, status: "Upcoming" };
};

const formatDate = (value) => {
  if (!value) return null;
  return new Date(value).toISOString().split("T")[0];
};

const normalizeBooking = (booking) => withComputedStatus({
  id: booking.id,
  resourceId: booking.resourceId,
  employeeId: booking.userId,
  employeeName: booking.user?.name || "Unknown Employee",
  date: formatDate(booking.date),
  startTime: booking.startTime,
  endTime: booking.endTime,
  purpose: booking.purpose,
  status: booking.status
});

export const bookingApi = {
  async fetchResources() {
    return await apiClient.get("/resources");
  },

  async fetchBookings(resourceId = "", date = "") {
    const params = new URLSearchParams();
    if (resourceId) params.set("resourceId", resourceId);
    if (date) params.set("date", date);
    const query = params.toString() ? `?${params.toString()}` : "";
    const bookings = await apiClient.get(`/bookings${query}`);
    return (bookings || []).map(normalizeBooking);
  },

  async createBookingRemote(resourceId, employeeId, date, startTime, endTime, purpose) {
    await apiClient.post("/bookings", {
      resourceId,
      employeeId: Number(employeeId),
      date,
      startTime,
      endTime,
      purpose
    });
    return { success: true };
  },

  async cancelBookingRemote(bookingId) {
    await apiClient.patch(`/bookings/${bookingId}/cancel`);
    return { success: true };
  },

  async rescheduleBookingRemote(bookingId, date, startTime, endTime) {
    await apiClient.patch(`/bookings/${bookingId}/reschedule`, {
      date,
      startTime,
      endTime
    });
    return { success: true };
  },

  getResources: () => getStored("af_resources"),
  
  getBookings: () => (getStored("af_bookings") || []).map(withComputedStatus),

  checkConflicts: (resourceId, date, startTime, endTime, excludeBookingId = null) => {
    const bookings = bookingApi.getBookings();
    
    // Find active bookings (excluding Cancelled) for this resource on this date
    const activeBookings = bookings.filter(b => 
      b.resourceId === resourceId && 
      b.date === date && 
      b.status !== "Cancelled" &&
      b.id !== excludeBookingId
    );

    // Check if any booking overlaps with the requested times
    for (const b of activeBookings) {
      if (isOverlapping(startTime, endTime, b.startTime, b.endTime)) {
        return { 
          hasConflict: true, 
          conflictingBooking: b 
        };
      }
    }

    return { hasConflict: false };
  },

  createBooking: (resourceId, employeeId, date, startTime, endTime, purpose) => {
    const resources = getStored("af_resources");
    const bookings = getStored("af_bookings");
    const employees = JSON.parse(localStorage.getItem("af_employees"));

    const resource = resources.find(r => r.id === resourceId);
    const employee = employees.find(e => e.id === employeeId);

    if (!resource || !employee) {
      return { success: false, message: "Resource or Employee not found" };
    }

    // Check for scheduling conflict
    const conflictCheck = bookingApi.checkConflicts(resourceId, date, startTime, endTime);
    if (conflictCheck.hasConflict) {
      return { 
        success: false, 
        conflict: true, 
        message: `Time slot overlaps with an existing booking by ${conflictCheck.conflictingBooking.employeeName}.` 
      };
    }

    const newBooking = withComputedStatus({
      id: `BKG-${Date.now()}`,
      resourceId,
      employeeId,
      employeeName: employee.name,
      date,
      startTime,
      endTime,
      purpose,
      status: "Upcoming"
    });

    bookings.unshift(newBooking);
    setStored("af_bookings", bookings);

    // Add system notification
    allocationApi.addNotification(
      "Resource Booked",
      `${employee.name} booked ${resource.name} for ${purpose} on ${date} (${startTime}-${endTime}).`,
      "success"
    );

    return { success: true, booking: newBooking };
  },

  cancelBooking: (bookingId) => {
    const bookings = getStored("af_bookings");
    const bookingIdx = bookings.findIndex(b => b.id === bookingId);

    if (bookingIdx === -1) {
      return { success: false, message: "Booking not found" };
    }

    const booking = bookings[bookingIdx];
    booking.status = "Cancelled";
    
    setStored("af_bookings", bookings);

    const resources = getStored("af_resources");
    const resource = resources.find(r => r.id === booking.resourceId);
    const resourceName = resource ? resource.name : "Resource";

    allocationApi.addNotification(
      "Booking Cancelled",
      `Booking for ${resourceName} on ${booking.date} (${booking.startTime}-${booking.endTime}) was cancelled.`,
      "info"
    );

    return { success: true, booking };
  },

  rescheduleBooking: (bookingId, date, startTime, endTime) => {
    const bookings = getStored("af_bookings");
    const bookingIdx = bookings.findIndex(b => b.id === bookingId);

    if (bookingIdx === -1) {
      return { success: false, message: "Booking not found" };
    }

    const booking = bookings[bookingIdx];
    const conflictCheck = bookingApi.checkConflicts(
      booking.resourceId,
      date,
      startTime,
      endTime,
      bookingId
    );

    if (conflictCheck.hasConflict) {
      return {
        success: false,
        conflict: true,
        message: `Time slot overlaps with an existing booking by ${conflictCheck.conflictingBooking.employeeName}.`
      };
    }

    bookings[bookingIdx] = withComputedStatus({
      ...booking,
      date,
      startTime,
      endTime,
      status: "Upcoming"
    });
    setStored("af_bookings", bookings);

    allocationApi.addNotification(
      "Booking Rescheduled",
      `Booking was moved to ${date} (${startTime}-${endTime}).`,
      "info"
    );

    return { success: true, booking: bookings[bookingIdx] };
  }
};
