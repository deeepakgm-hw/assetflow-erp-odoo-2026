import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import { CalendarPlus, AlertTriangle } from "lucide-react";

export default function BookingForm({
  selectedResourceId,
  employees = [],
  selectedEmployeeId,
  setSelectedEmployeeId,
  selectedDate,
  setSelectedDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  purpose,
  setPurpose,
  bookings = [],
  onSubmit
}) {
  const [conflictError, setConflictError] = useState("");
  const [validationError, setValidationError] = useState("");

  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    const formattedHour = hour.toString().padStart(2, "0");
    timeSlots.push({ value: `${formattedHour}:00`, label: `${formattedHour}:00` });
    if (hour < 20) {
      timeSlots.push({ value: `${formattedHour}:30`, label: `${formattedHour}:30` });
    }
  }

  // Set default times and date if not set
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate("2026-07-12"); // Seeding consistent mock date
    }
    if (!startTime) {
      setStartTime("09:00");
    }
    if (!endTime) {
      setEndTime("10:00");
    }
  }, [selectedDate, startTime, endTime, setSelectedDate, setStartTime, setEndTime]);

  // Check conflicts reactively
  useEffect(() => {
    if (selectedResourceId && selectedDate && startTime && endTime) {
      // Validate start/end order
      const startMin = startTime.split(":").map(Number).reduce((h, m) => h * 60 + m);
      const endMin = endTime.split(":").map(Number).reduce((h, m) => h * 60 + m);
      
      if (startMin >= endMin) {
        setValidationError("End time must be after start time.");
        setConflictError("");
        return;
      }
      
      setValidationError("");

      const conflictingBooking = bookings.find(b => 
        b.resourceId === selectedResourceId &&
        b.date === selectedDate &&
        b.status !== "Cancelled" &&
        startMin < b.endTime.split(":").map(Number).reduce((h, m) => h * 60 + m) &&
        b.startTime.split(":").map(Number).reduce((h, m) => h * 60 + m) < endMin
      );
      if (conflictingBooking) {
        setConflictError(
          `Conflict: Selected slot overlaps with booking by ${conflictingBooking.employeeName} (${conflictingBooking.purpose})`
        );
      } else {
        setConflictError("");
      }
    } else {
      setConflictError("");
      setValidationError("");
    }
  }, [selectedResourceId, selectedDate, startTime, endTime, bookings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validationError || conflictError) return;
    if (!selectedEmployeeId) {
      setValidationError("Please select an employee profile.");
      return;
    }
    if (!purpose.trim()) {
      setValidationError("Please enter a booking purpose.");
      return;
    }

    onSubmit({
      resourceId: selectedResourceId,
      employeeId: selectedEmployeeId,
      date: selectedDate,
      startTime,
      endTime,
      purpose
    });
  };

  const employeeOptions = employees.map(e => ({
    value: e.id,
    label: `${e.name} (${e.department})`
  }));

  return (
    <Card title="Book Resource Slot" subtitle="Reserve rooms, vehicles, or equipment.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label="Booker Profile"
          options={employeeOptions}
          value={selectedEmployeeId}
          onChange={(e) => {
            setSelectedEmployeeId(e.target.value);
            setValidationError("");
          }}
          placeholder="Choose employee..."
          required
        />

        <Input
          label="Reservation Date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Start Time"
            options={timeSlots}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder=""
            required
          />
          <Select
            label="End Time"
            options={timeSlots}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder=""
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Booking Purpose</label>
          <textarea
            value={purpose}
            onChange={(e) => {
              setPurpose(e.target.value);
              setValidationError("");
            }}
            placeholder="Explain why this reservation is needed..."
            rows="2"
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 text-sm py-2 px-3 placeholder-slate-500 hover:border-slate-650 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 resize-none"
            required
          />
        </div>

        {/* Validation Errors */}
        {validationError && (
          <span className="text-xs font-medium text-rose-450 mt-1 block">
            {validationError}
          </span>
        )}

        {/* Conflict Warning Card */}
        {conflictError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2.5 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">Scheduling Conflict</span>
              <p className="text-xs text-rose-300 mt-1 leading-normal">
                Selected slot overlaps with another booking. Please choose another time.
              </p>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            icon={CalendarPlus}
            className="w-full font-semibold"
            disabled={!!conflictError || !!validationError || !selectedResourceId || !selectedEmployeeId}
          >
            Confirm Reservation
          </Button>
        </div>
      </form>
    </Card>
  );
}
