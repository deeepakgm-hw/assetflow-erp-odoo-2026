import React from "react";

const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-zinc-800 border-t-blue-500`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
