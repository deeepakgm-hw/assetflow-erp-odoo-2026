import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const SearchBar = ({ value, onChange, placeholder = "Search...", className = "" }) => {
  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
        <MagnifyingGlassIcon className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-100 rounded-lg pl-10 pr-3.5 py-2 text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-550/25 transition-all duration-200"
      />
    </div>
  );
};

export default SearchBar;
