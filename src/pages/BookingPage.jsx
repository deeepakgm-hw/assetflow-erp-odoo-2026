import React, { useState, useEffect, useCallback } from "react";
import { DoorOpen, CalendarRange, Clock, Sparkles, LayoutGrid, List } from "lucide-react";
import { bookingApi } from "../services/bookingApi";
import { allocationApi } from "../services/allocationApi";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import ResourceSelector from "../components/booking/ResourceSelector";
import BookingForm from "../components/booking/BookingForm";
import BookingCalendar from "../components/booking/BookingCalendar";
import BookingTimeline from "../components/booking/BookingTimeline";
import BookingCard from "../components/booking/BookingCard";

export default function BookingPage() {
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [apiConnected, setApiConnected] = useState(false);

  // Selections State
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-07-12"); // Seeding consistent mock date
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [purpose, setPurpose] = useState("");
  const [actionError, setActionError] = useState("");
  
  // View Switcher (Calendar vs Timeline List)
  const [activeTab, setActiveTab] = useState("calendar");

  const loadData = useCallback(async () => {
    try {
      const [resourceData, bookingData, employeeData] = await Promise.all([
        bookingApi.fetchResources(),
        bookingApi.fetchBookings(selectedResourceId, selectedDate),
        allocationApi.fetchEmployees()
      ]);
      setResources(resourceData || []);
      setBookings(bookingData || []);
      setEmployees(employeeData || []);
      setApiConnected(true);
    } catch (error) {
      console.warn("Using mock booking data because API is unavailable:", error.message);
      setResources(bookingApi.getResources() || []);
      setBookings(bookingApi.getBookings() || []);
      setEmployees(allocationApi.getEmployees() || []);
      setApiConnected(false);
    }
  }, [selectedResourceId, selectedDate]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Pre-select first resource if none selected
  useEffect(() => {
    if (resources.length > 0 && !selectedResourceId) {
      setSelectedResourceId(resources[0].id);
    }
  }, [resources, selectedResourceId]);

  const handleBookingSubmit = async (details) => {
    try {
      setActionError("");
      const res = apiConnected
        ? await bookingApi.createBookingRemote(
          details.resourceId,
          details.employeeId,
          details.date,
          details.startTime,
          details.endTime,
          details.purpose
        )
        : bookingApi.createBooking(
        details.resourceId,
        details.employeeId,
        details.date,
        details.startTime,
        details.endTime,
        details.purpose
      );

      if (res.success) {
        setPurpose("");
        loadData();
      } else {
        setActionError(res.message || "Unable to create booking.");
      }
    } catch (error) {
      setActionError(error.message || "Unable to create booking.");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setActionError("");
      if (apiConnected) {
        await bookingApi.cancelBookingRemote(bookingId);
      } else {
        bookingApi.cancelBooking(bookingId);
      }
      loadData();
    } catch (error) {
      setActionError(error.message || "Unable to cancel booking.");
    }
  };

  const handleSelectTimeSlot = (start, end) => {
    setStartTime(start);
    setEndTime(end);
  };

  // Calculations for KPI Cards
  const totalResources = resources.length;
  const todayBookingsCount = bookings.filter(b => b.date === selectedDate && b.status !== "Cancelled").length;
  const upcomingBookingsCount = bookings.filter(b => b.status === "Upcoming").length;
  
  // Available slots today estimation (12 hours minus booked hours)
  const selectedResource = resources.find(r => r.id === selectedResourceId);
  const resourceTodayBookedCount = bookings.filter(b => 
    b.resourceId === selectedResourceId && 
    b.date === selectedDate && 
    b.status !== "Cancelled"
  ).length;
  const estimatedAvailableSlots = Math.max(12 - resourceTodayBookedCount, 0);

  // Filter booking list for displays
  const selectedResourceBookingsList = bookings
    .filter(b => b.resourceId === selectedResourceId && b.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Scheduling & Booking"
        subtitle="Conflict-free scheduling of meeting rooms, shared corporate vehicles, and laboratory testing equipment."
      />

      {actionError && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
          {actionError}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Shared Resources"
          value={totalResources}
          icon={DoorOpen}
          color="primary"
        />
        <StatCard
          title="Bookings Scheduled Today"
          value={todayBookingsCount}
          icon={CalendarRange}
          color="primary"
          description={`Date: ${selectedDate}`}
        />
        <StatCard
          title="Upcoming Requests Queue"
          value={upcomingBookingsCount}
          icon={Clock}
          color="success"
        />
        <StatCard
          title="Available Hours Today"
          value={`${estimatedAvailableSlots}h / 12h`}
          icon={Sparkles}
          color="success"
          description="Based on selected resource"
        />
      </div>

      {/* Main Grid Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Selectors & Booking Form */}
        <div className="lg:col-span-1 space-y-5">
          <ResourceSelector
            resources={resources}
            selectedResourceId={selectedResourceId}
            setSelectedResourceId={setSelectedResourceId}
          />

          <BookingForm
            selectedResourceId={selectedResourceId}
            employees={employees}
            selectedEmployeeId={selectedEmployeeId}
            setSelectedEmployeeId={setSelectedEmployeeId}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            purpose={purpose}
            setPurpose={setPurpose}
            onSubmit={handleBookingSubmit}
          />
        </div>

        {/* Right Side: Day Planner Grid (Google Calendar or Timeline List tabs) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider">
              Visual Booking Planner
            </h3>
            
            {/* Tab switchers */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950/40 border border-slate-800">
              <button
                onClick={() => setActiveTab("calendar")}
                className={`
                  flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-all
                  ${activeTab === "calendar" ? "bg-slate-800 text-blue-400 border border-slate-700/50 shadow-inner" : "text-slate-500 hover:text-slate-300"}
                `}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Calendar Grid
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`
                  flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-all
                  ${activeTab === "timeline" ? "bg-slate-800 text-blue-400 border border-slate-700/50 shadow-inner" : "text-slate-500 hover:text-slate-300"}
                `}
              >
                <List className="w-3.5 h-3.5" />
                Timeline slots
              </button>
            </div>
          </div>

          {/* Active View Panel */}
          {activeTab === "calendar" ? (
            <BookingCalendar
              bookings={bookings}
              resource={selectedResource}
              selectedDate={selectedDate}
            />
          ) : (
            <BookingTimeline
              bookings={bookings}
              resource={selectedResource}
              selectedDate={selectedDate}
              onSelectTimeSlot={handleSelectTimeSlot}
            />
          )}

          {/* Active Bookings Log Cards for Selected Day */}
          <div className="space-y-4 mt-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Active Booking Cards ({selectedResourceBookingsList.length})
            </h3>
            {selectedResourceBookingsList.length === 0 ? (
              <div className="p-8 text-center border border-slate-800/40 bg-slate-900/10 rounded-xl text-xs text-slate-500">
                No active bookings exist for this resource on the selected date.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedResourceBookingsList.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    resource={selectedResource}
                    onCancel={handleCancelBooking}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
