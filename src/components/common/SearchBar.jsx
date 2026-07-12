import React from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
  ...props
}) {
  return (
    <div className={`relative flex items-center w-full max-w-sm ${className}`}>
      <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full bg-slate-900/60 border border-slate-700/80 rounded-lg text-slate-200 text-sm py-2 pl-10 pr-9
          placeholder-slate-500
          hover:border-slate-650
          focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50
          transition-all duration-200
        "
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 text-slate-400 hover:text-slate-200 p-0.5 rounded-md hover:bg-slate-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
