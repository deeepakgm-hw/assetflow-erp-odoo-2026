import React from "react";

export default function Card({
  children,
  title,
  subtitle,
  headerActions,
  className = "",
  hoverEffect = false,
  glass = false,
  padding = "p-5",
  ...props
}) {
  const baseStyles = "rounded-xl border transition-all duration-300";
  
  const themeStyles = glass
    ? "bg-slate-900/50 backdrop-blur-md border-slate-800/80 shadow-lg shadow-slate-950/30"
    : "bg-slate-800 border-slate-700/80 shadow-md shadow-slate-950/20";
    
  const hoverStyles = hoverEffect
    ? "hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/40 hover:border-slate-600/80"
    : "";

  return (
    <div
      className={`${baseStyles} ${themeStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {(title || subtitle || headerActions) && (
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-4 mb-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-slate-100 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      <div className={padding}>{children}</div>
    </div>
  );
}
