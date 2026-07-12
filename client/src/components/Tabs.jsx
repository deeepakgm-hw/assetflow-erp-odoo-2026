import React from "react";

const Tabs = ({ tabs, activeTab, onTabChange, className = "" }) => {
  return (
    <div className={`border-b border-zinc-800 ${className}`}>
      <nav className="flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`pb-4 px-1 text-sm font-semibold border-b-2 transition-all duration-200 focus:outline-none ${
                isActive
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
