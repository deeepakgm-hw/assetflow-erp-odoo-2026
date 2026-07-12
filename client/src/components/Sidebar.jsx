import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  HomeIcon,
  Squares2X2Icon,
  BriefcaseIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
  ChartPieIcon,
  BellIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
    { name: "Organization Setup", path: "/organization", icon: Squares2X2Icon },
    { name: "Assets", path: "/assets", icon: BriefcaseIcon },
    { name: "Allocation & Transfer", path: "/allocation", icon: ArrowPathIcon, disabled: true },
    { name: "Resource Booking", path: "/booking", icon: CalendarDaysIcon, disabled: true },
    { name: "Maintenance", path: "/maintenance", icon: WrenchScrewdriverIcon, disabled: true },
    { name: "Audit", path: "/audit", icon: ClipboardDocumentCheckIcon, disabled: true },
    { name: "Reports", path: "/reports", icon: ChartPieIcon, disabled: true },
    { name: "Notifications", path: "/notifications", icon: BellIcon },
  ];

  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 px-6 py-5 border-b border-zinc-900">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-550/20 font-black text-white text-lg tracking-wider">
          AF
        </div>
        <div>
          <h1 className="text-sm font-bold text-zinc-100 tracking-wide uppercase">
            AssetFlow
          </h1>
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">
            Enterprise ERP
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          if (item.disabled) {
            return (
              <div
                key={item.name}
                className="flex items-center space-x-3 px-3 py-2.5 text-sm font-semibold text-zinc-650 cursor-not-allowed select-none"
                title={`${item.name} (Coming Soon)`}
              >
                <item.icon className="h-5 w-5 opacity-40" />
                <span>{item.name}</span>
                <span className="text-[9px] bg-zinc-900/50 text-zinc-600 border border-zinc-800/80 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider scale-95 ml-auto">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      {user && (
        <div className="p-4 border-t border-zinc-900 bg-zinc-900/10 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700/50 font-bold text-zinc-350 text-sm uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-zinc-500 font-semibold truncate capitalize">
                {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 hover:bg-zinc-900 rounded-lg ml-2"
            title="Log Out"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
