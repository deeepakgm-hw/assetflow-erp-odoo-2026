import React from "react";
import { Clock } from "lucide-react";
import Badge from "../common/Badge";

export default function BookingTimeline({
  bookings = [],
  resource = null,
  selectedDate = "2026-07-12",
  onSelectTimeSlot
}) {
  const startHour = 8;
  const endHour = 20;

  // Convert "HH:MM" to float hour
  const timeToVal = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h + m / 60;
  };

  // Get active bookings for selected resource & date
  const activeBookings = bookings.filter(b => 
    b.resourceId === resource?.id && 
    b.date === selectedDate && 
    b.status !== "Cancelled"
  );

  const getSlotStatus = (hour) => {
    // Check if any booking covers this hour slot
    const booking = activeBookings.find(b => {
      const start = timeToVal(b.startTime);
      const end = timeToVal(b.endTime);
      return hour >= start && hour < end;
    });

    return booking ? { booked: true, booking } : { booked: false };
  };

  const hours = [];
  for (let h = startHour; h < endHour; h++) {
    hours.push(h);
  }

  const formatHourLabel = (h) => {
    const startStr = `${h.toString().padStart(2, "0")}:00`;
    const endStr = `${(h + 1).toString().padStart(2, "0")}:00`;
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        Timeline Grid View
      </label>
      
      {!resource ? (
        <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-xl text-center text-xs text-slate-500">
          Select a resource from the list to view its schedule timeline.
        </div>
      ) : (
        <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
          {hours.map((hour) => {
            const { booked, booking } = getSlotStatus(hour);
            const label = formatHourLabel(hour);
            
            if (booked) {
              return (
                <div
                  key={hour}
                  className="flex items-center justify-between p-3 rounded-lg border border-blue-500/20 bg-blue-600/5 text-blue-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-mono font-bold text-blue-400">{label}</span>
                      <p className="text-xs font-semibold text-slate-200 truncate mt-0.5">
                        {booking.purpose}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="hidden sm:inline text-[10px] text-slate-400 truncate max-w-[80px]">
                      {booking.employeeName}
                    </span>
                    <Badge variant="primary" className="text-[10px] py-0 px-2 shrink-0">
                      Booked
                    </Badge>
                  </div>
                </div>
              );
            } else {
              const startStr = `${hour.toString().padStart(2, "0")}:00`;
              const endStr = `${(hour + 1).toString().padStart(2, "0")}:00`;

              return (
                <div
                  key={hour}
                  onClick={() => onSelectTimeSlot && onSelectTimeSlot(startStr, endStr)}
                  className="
                    flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/20 text-slate-400
                    hover:bg-slate-850 hover:border-slate-700/80 hover:text-slate-250 cursor-pointer transition-all duration-200 group
                  "
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-650 group-hover:text-slate-450 transition-colors" />
                    <span className="text-xs font-mono font-semibold text-slate-500 group-hover:text-slate-400">
                      {label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to select
                    </span>
                    <Badge variant="neutral" className="text-[10px] py-0 px-2 group-hover:border-slate-500/20">
                      Available
                    </Badge>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
