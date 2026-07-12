import React, { useState, useEffect } from "react";
import { User } from "lucide-react";

export default function BookingCalendar({
  bookings = [],
  resource = null,
  selectedDate = "2026-07-12"
}) {
  const [currentMinutes, setCurrentMinutes] = useState(0);

  const startHour = 8; // 08:00 AM
  const endHour = 20;  // 08:00 PM
  const totalHours = endHour - startHour;
  const hourHeight = 56; // Pixels per hour

  // Filter bookings for the active resource on the selected date
  const activeBookings = bookings.filter(b => 
    b.resourceId === resource?.id && 
    b.date === selectedDate && 
    b.status !== "Cancelled"
  );

  // Live calculation of current time relative to 08:00
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      // Set to mock date for consistency with user's system metadata (2026-07-12)
      // but fetch the live hour and minute values
      const nowHour = now.getHours();
      const nowMin = now.getMinutes();
      const minutesSinceStart = (nowHour - startHour) * 60 + nowMin;
      setCurrentMinutes(minutesSinceStart);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return (h - startHour) * 60 + m;
  };

  const getPositionStyles = (startTime, endTime) => {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    const duration = endMin - startMin;

    const top = (startMin / 60) * hourHeight;
    const height = (duration / 60) * hourHeight;

    return {
      top: `${top}px`,
      height: `${height}px`
    };
  };

  // Generate hourly labels
  const hoursArray = [];
  for (let h = startHour; h <= endHour; h++) {
    hoursArray.push(`${h.toString().padStart(2, "0")}:00`);
  }

  // Check if current time is within calendar limits and selectedDate is today (2026-07-12)
  const showCurrentTimeLine = 
    selectedDate === "2026-07-12" && 
    currentMinutes >= 0 && 
    currentMinutes <= totalHours * 60;

  const redLineTop = (currentMinutes / 60) * hourHeight;

  return (
    <div className="flex flex-col h-full bg-slate-900/10 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
      {/* Calendar Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Day Schedule Planner
          </h4>
          <span className="text-sm font-semibold text-slate-200 block mt-0.5">
            {resource ? resource.name : "Select a resource"}
          </span>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Date: <span className="text-slate-300 font-semibold">{selectedDate}</span>
        </div>
      </div>

      {/* Grid wrapper */}
      <div className="relative overflow-y-auto flex-1 h-[672px] bg-slate-950/20" style={{ height: `${totalHours * hourHeight}px` }}>
        
        {/* Hourly Rows Background */}
        <div className="absolute inset-0">
          {Array.from({ length: totalHours }).map((_, idx) => (
            <div
              key={idx}
              className="border-b border-slate-800/40"
              style={{ height: `${hourHeight}px` }}
            />
          ))}
        </div>

        {/* Time Labels & Grid Lines */}
        <div className="relative w-full h-full pointer-events-none">
          {hoursArray.map((hour, idx) => {
            const topOffset = idx * hourHeight;
            return (
              <div
                key={hour}
                className="absolute w-full flex items-center"
                style={{ top: `${topOffset}px` }}
              >
                {/* Time tag */}
                <span className="pl-4 pr-3 text-[10px] font-bold font-mono text-slate-500 bg-slate-950/30 py-0.5 rounded-r">
                  {hour}
                </span>
                {/* Visual horizontal guide */}
                <div className="flex-1 border-t border-slate-800/30 ml-2" />
              </div>
            );
          })}
        </div>

        {/* Booking blocks (positioned absolutely) */}
        {resource && activeBookings.map((b) => {
          const pos = getPositionStyles(b.startTime, b.endTime);
          return (
            <div
              key={b.id}
              className="absolute left-20 right-4 group border border-blue-500/20 bg-gradient-to-r from-blue-600/20 to-blue-600/10 hover:from-blue-600/35 hover:to-blue-600/20 text-blue-200 rounded-lg p-2.5 shadow-md shadow-blue-900/10 overflow-hidden transition-all duration-200 cursor-pointer pointer-events-auto hover:border-blue-500/40 hover:shadow-lg"
              style={pos}
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono text-blue-400">
                      {b.startTime} - {b.endTime}
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold uppercase bg-slate-900/50 px-1 py-0.2 rounded border border-slate-800">
                      {b.id}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-205 mt-1 truncate">
                    {b.purpose}
                  </h5>
                </div>
                
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                  <User className="w-3 h-3 text-blue-500/80" />
                  <span className="truncate font-medium">{b.employeeName}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Current Time Indicator Line */}
        {showCurrentTimeLine && (
          <div
            className="absolute left-0 right-0 flex items-center z-10 pointer-events-none"
            style={{ top: `${redLineTop}px` }}
          >
            <div className="w-2 h-2 rounded-full bg-rose-550 shadow-[0_0_8px_2px_rgba(239,68,68,0.5)] ml-18" />
            <div className="flex-1 border-t border-rose-500/85" />
          </div>
        )}
      </div>
    </div>
  );
}
