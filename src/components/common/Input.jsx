import React from "react";

export default function Input({
  label,
  id,
  type = "text",
  error,
  icon: Icon = null,
  className = "",
  containerClassName = "",
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <Icon className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        )}
        <input
          id={id}
          type={type}
          className={`
            w-full bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 text-sm py-2 px-3
            ${Icon ? "pl-10" : "pl-3"}
            placeholder-slate-500
            hover:border-slate-650
            focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50
            transition-all duration-200
            disabled:opacity-50 disabled:bg-slate-950
            ${error ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/50" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[11px] font-medium text-rose-450 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
