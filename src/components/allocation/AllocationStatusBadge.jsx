import React from "react";
import Badge from "../common/Badge";

export default function AllocationStatusBadge({ status, className = "" }) {
  const map = {
    Available: { variant: "success", label: "Available", glow: true },
    Allocated: { variant: "primary", label: "Allocated", glow: false },
    Overdue: { variant: "danger", label: "Overdue", glow: true },
    Maintenance: { variant: "warning", label: "Maintenance", glow: false },
    Returned: { variant: "success", label: "Returned", glow: false },
    Pending: { variant: "warning", label: "Pending", glow: true },
    Approved: { variant: "success", label: "Approved", glow: false },
    Rejected: { variant: "danger", label: "Rejected", glow: false }
  };

  const config = map[status] || { variant: "neutral", label: status, glow: false };

  return (
    <Badge variant={config.variant} glow={config.glow} className={className}>
      {config.label}
    </Badge>
  );
}
