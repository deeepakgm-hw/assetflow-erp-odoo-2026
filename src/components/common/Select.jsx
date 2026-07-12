import React from "react";

export default function Select({
  label,
  id,
  options = [],
  placeholder = "Select an option",
  error,
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
      <div className="relative">
        <select
          id={id}
          className={`
            w-full bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 text-sm py-2 pl-3 pr-10
            appearance-none cursor-pointer
            hover:border-slate-650
            focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50
            transition-all duration-200
            disabled:opacity-50 disabled:bg-slate-950
            ${error ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/50" : ""}
            ${className}
          `}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Custom Chevron Indicator */}
        <div className="absolute inset-y-0 right-3 flex items-center pr-1 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-[11px] font-medium text-rose-450 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
