import React, { useState } from "react";
import Departments from "./Departments";
import Categories from "./Categories";
import Employees from "./Employees";
import { Building2, FolderKanban, Users, Settings } from "lucide-react";
import { motion } from "framer-motion";

const Organization = () => {
  const [activeTab, setActiveTab] = useState("departments");

  const tabs = [
    { id: "departments", label: "Departments", icon: Building2 },
    { id: "categories", label: "Categories", icon: FolderKanban },
    { id: "employees", label: "Employee Directory", icon: Users },
  ];

  return (
    <div className="space-y-6 select-none max-w-[1600px] mx-auto pb-10 font-sans">
      {/* Description Header */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-tight">Organization Console</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure metadata schema, manage department clusters, and authorize operators.
          </p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center space-x-1 border-b border-zinc-900 pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 text-xs font-bold transition-colors flex items-center space-x-2 border-b-2 outline-none ${
                isActive
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Sub View */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="pt-2"
      >
        {activeTab === "departments" && <Departments />}
        {activeTab === "categories" && <Categories />}
        {activeTab === "employees" && <Employees />}
      </motion.div>
    </div>
  );
};

export default Organization;
