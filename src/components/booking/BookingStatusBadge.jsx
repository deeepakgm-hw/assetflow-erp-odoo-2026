import React from "react";
import Badge from "../common/Badge";

export default function BookingStatusBadge({ status, className = "" }) {
  const map = {
    Upcoming: { variant: "info", label: "Upcoming", glow: true },
    Ongoing: { variant: "warning", label: "Ongoing", glow: true },
    Completed: { variant: "success", label: "Completed", glow: false },
    Cancelled: { variant: "neutral", label: "Cancelled", glow: false }
  };

  const config = map[status] || { variant: "neutral", label: status, glow: false };

  return (
    <Badge variant={config.variant} glow={config.glow} className={className}>
      {config.label}
    </Badge>
  );
}
