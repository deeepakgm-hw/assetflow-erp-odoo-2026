import React, { useState } from "react";
import Tabs from "../../components/Tabs";
import Departments from "./Departments";
import Categories from "./Categories";
import Employees from "./Employees";

const Organization = () => {
  const [activeTab, setActiveTab] = useState("departments");

  const tabs = [
    { id: "departments", label: "Departments" },
    { id: "categories", label: "Categories" },
    { id: "employees", label: "Employee Directory" },
  ];

  return (
    <div className="space-y-6">
      {/* Description Header */}
      <div>
        <h3 className="text-xl font-bold text-zinc-100">Organization Settings</h3>
        <p className="text-sm text-zinc-400 mt-1">
          Manage department hierarchies, configure custom fields on asset categories, and promote staff members.
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Active Sub View */}
      <div className="pt-2">
        {activeTab === "departments" && <Departments />}
        {activeTab === "categories" && <Categories />}
        {activeTab === "employees" && <Employees />}
      </div>
    </div>
  );
};

export default Organization;
