import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  ArrowLeftRight,
  Calendar,
  Wrench,
  FileCheck2,
  BarChart3,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Organization", path: "/organization", icon: Building2 },
    { name: "Assets", path: "/assets", icon: Briefcase, disabled: true },
    { name: "Allocation", path: "/allocation", icon: ArrowLeftRight, disabled: true },
    { name: "Bookings", path: "/booking", icon: Calendar, disabled: true },
    { name: "Maintenance", path: "/maintenance", icon: Wrench, disabled: true },
    { name: "Audit Trail", path: "/audit", icon: FileCheck2, disabled: true },
    { name: "Reports", path: "/reports", icon: BarChart3, disabled: true },
    { name: "Notifications", path: "/notifications", icon: Bell },
  ];

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="bg-zinc-950 border-r border-zinc-900 flex flex-col h-full select-none relative z-20 flex-shrink-0"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-550/20 font-black text-white text-lg tracking-wider flex-shrink-0">
            A
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="min-w-0"
            >
              <h1 className="text-sm font-bold text-zinc-150 tracking-tight truncate">
                AssetFlow
              </h1>
              <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-widest block">
                Enterprise ERP
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.disabled) {
            return (
              <div
                key={item.name}
                className="flex items-center space-x-3 px-3 py-2 text-xs font-semibold text-zinc-650 cursor-not-allowed select-none group relative"
                title={`${item.name} (Coming Soon)`}
              >
                <item.icon className="h-4 w-4 opacity-40 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
                {!collapsed && (
                  <span className="text-[8px] bg-zinc-900/50 text-zinc-600 border border-zinc-800/80 px-1 py-0.5 rounded font-bold uppercase tracking-wider scale-90 ml-auto">
                    Soon
                  </span>
                )}
                {collapsed && (
                  <div className="absolute left-16 bg-zinc-900 border border-zinc-850 text-zinc-200 text-[10px] font-bold px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50">
                    {item.name} (Soon)
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group relative border border-transparent ${
                  isActive
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-md"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`
              }
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
              {collapsed && (
                <div className="absolute left-16 bg-zinc-900 border border-zinc-850 text-zinc-200 text-[10px] font-bold px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      {user && (
        <div className="p-3 border-t border-zinc-900 bg-zinc-900/10 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700/50 font-black text-zinc-300 text-xs uppercase flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="min-w-0"
              >
                <p className="text-xs font-bold text-zinc-200 truncate">
                  {user.name}
                </p>
                <p className="text-[9px] text-zinc-550 font-bold truncate uppercase tracking-wide">
                  {user.role}
                </p>
              </motion.div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 hover:bg-zinc-900 rounded-xl ml-2"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-20 -right-3 h-6 w-6 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center shadow-lg transition-transform"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </motion.div>
  );
};

export default Sidebar;
