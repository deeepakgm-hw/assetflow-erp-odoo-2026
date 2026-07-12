import React from "react";
import Card from "../common/Card";
import BookingStatusBadge from "./BookingStatusBadge";
import Button from "../common/Button";
import { Calendar, Clock, User, XCircle } from "lucide-react";

export default function BookingCard({ booking, resource, onCancel }) {
  if (!booking) return null;

  const resourceName = resource ? resource.name : "Unknown Resource";
  const resourceType = resource ? resource.type : "Resource";
  
  const canCancel = booking.status === "Upcoming" || booking.status === "Ongoing";

  return (
    <Card hoverEffect padding="p-4" className="border-slate-800 bg-slate-900/40">
      <div className="flex justify-between items-start gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
            {resourceType}
          </span>
          <h4 className="text-base font-bold text-slate-100 mt-2 tracking-tight">
            {resourceName}
          </h4>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
        {booking.purpose}
      </p>

      {/* Details Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-700/20 text-xs text-slate-350">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>Booked by: <strong>{booking.employeeName}</strong></span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Date: <strong>{booking.date}</strong></span>
        </div>
        
        <div className="flex items-center gap-2 sm:col-span-2">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Time: <strong>{booking.startTime} - {booking.endTime}</strong></span>
        </div>
      </div>

      {canCancel && onCancel && (
        <div className="mt-4 pt-3 border-t border-slate-700/20 flex justify-end">
          <Button
            variant="danger"
            size="sm"
            onClick={() => onCancel(booking.id)}
            icon={XCircle}
            className="text-xs font-semibold py-1 px-3"
          >
            Cancel Booking
          </Button>
        </div>
      )}
    </Card>
  );
}
