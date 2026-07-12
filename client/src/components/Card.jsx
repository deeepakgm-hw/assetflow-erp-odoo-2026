import React from "react";

const Card = ({ children, className = "", onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-xl p-6 transition-all duration-300 ${
        onClick ? "cursor-pointer hover:border-zinc-500/55 hover:bg-zinc-900/40" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
