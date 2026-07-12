import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  icon: Icon = null,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/10 focus:ring-blue-500 border border-blue-500/10",
    secondary: "bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 focus:ring-slate-600",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/10 focus:ring-emerald-500 border border-emerald-500/10",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/10 focus:ring-rose-500 border border-rose-500/10",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-450 hover:text-slate-250 focus:ring-slate-600",
    glass: "bg-slate-800/40 hover:bg-slate-700/60 text-slate-200 border border-slate-700/40 backdrop-blur-sm focus:ring-slate-600"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`w-4 h-4 ${children ? "" : "m-0"}`} />}
      {children}
    </button>
  );
}
