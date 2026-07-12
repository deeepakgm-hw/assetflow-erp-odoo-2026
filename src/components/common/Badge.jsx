import React from "react";

export default function Badge({
  children,
  variant = "neutral",
  className = "",
  glow = false,
  ...props
}) {
  const baseStyles = "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors";

  const variants = {
    primary: "bg-blue-500/10 text-blue-400 border-blue-500/25",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/25",
    info: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
    neutral: "bg-slate-500/10 text-slate-400 border-slate-700/80"
  };

  const glows = {
    primary: "bg-blue-400 shadow-blue-500/50",
    success: "bg-emerald-400 shadow-emerald-500/50",
    warning: "bg-amber-400 shadow-amber-500/50",
    danger: "bg-rose-400 shadow-rose-500/50",
    info: "bg-indigo-400 shadow-indigo-500/50",
    neutral: "bg-slate-400 shadow-slate-500/50"
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {glow && (
        <span className={`w-1.5 h-1.5 rounded-full ${glows[variant]} animate-pulse shadow-[0_0_8px_1.5px]`} />
      )}
      {children}
    </span>
  );
}
