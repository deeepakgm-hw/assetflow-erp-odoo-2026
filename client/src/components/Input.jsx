import React from "react";

const Input = React.forwardRef(
  (
    {
      label,
      type = "text",
      name,
      placeholder,
      error,
      className = "",
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full flex flex-col space-y-1.5 ${className}`}>
        {label && (
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          type={type}
          name={name}
          ref={ref}
          placeholder={placeholder}
          className={`w-full bg-zinc-900/50 border ${
            error ? "border-red-500 focus:ring-red-550/20" : "border-zinc-800 focus:border-blue-550 focus:ring-blue-550/25"
          } text-zinc-100 rounded-lg px-3.5 py-2 text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all duration-200`}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500 font-medium">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
