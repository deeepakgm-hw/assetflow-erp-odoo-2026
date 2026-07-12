import React from "react";
import LoadingSpinner from "./LoadingSpinner";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10 focus:ring-blue-500 border border-transparent",
    secondary: "bg-zinc-800 hover:bg-zinc-705 text-zinc-200 focus:ring-zinc-650 border border-zinc-700/50",
    danger: "bg-red-650 hover:bg-red-550 text-white shadow-lg shadow-red-600/10 focus:ring-red-500 border border-transparent",
    outline: "bg-transparent hover:bg-zinc-900 text-zinc-350 border border-zinc-800 focus:ring-zinc-700",
    ghost: "bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-transparent"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
};

export default Button;
