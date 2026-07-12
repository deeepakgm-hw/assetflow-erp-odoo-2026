import React from "react";
import Card from "./Card";

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendType = "neutral", // "up" | "down" | "neutral"
  color = "primary", // "primary" | "success" | "warning" | "danger" | "neutral"
  className = "",
  ...props
}) {
  const iconColors = {
    primary: "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10",
    success: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10",
    warning: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10",
    danger: "text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-rose-500/10",
    neutral: "text-slate-400 bg-slate-500/10 border-slate-700/80 shadow-slate-500/5"
  };

  const trendColors = {
    up: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    down: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    neutral: "text-slate-400 bg-slate-500/10 border-slate-700/50"
  };

  return (
    <Card hoverEffect padding="p-5" className={`flex flex-col justify-between ${className}`} {...props}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
          <span className="text-2xl font-bold text-slate-100 mt-1 tracking-tight">{value}</span>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg border shadow-[0_0_12px_-3px] ${iconColors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      
      {(description || trend) && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/30 text-xs">
          {trend && (
            <span className={`px-1.5 py-0.5 rounded border font-medium ${trendColors[trendType]}`}>
              {trend}
            </span>
          )}
          {description && <span className="text-slate-400 truncate">{description}</span>}
        </div>
      )}
    </Card>
  );
}
