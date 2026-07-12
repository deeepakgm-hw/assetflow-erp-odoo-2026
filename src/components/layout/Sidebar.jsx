import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Cpu, 
  Layers, 
  CalendarDays, 
  Wrench, 
  ShieldCheck, 
  FileBarChart2, 
  Settings, 
  X
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Assets & Allocation", path: "/allocation", icon: Cpu },
    { name: "Resource Booking", path: "/booking", icon: CalendarDays },
    { name: "Maintenance", path: "/maintenance", icon: Wrench, badge: "Soon" },
    { name: "Audit & Compliance", path: "/audit", icon: ShieldCheck, badge: "Soon" },
    { name: "Reports", path: "/reports", icon: FileBarChart2 },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 bg-slate-950 border-r border-slate-900 text-slate-300
          transition-transform duration-300 lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-900 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/25">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-100 tracking-tight">AssetFlow</span>
              <span className="text-[10px] font-semibold text-blue-450 block -mt-1 uppercase tracking-wider">Enterprise</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md hover:bg-slate-900 lg:hidden text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)} // Close sidebar on mobile
              className={({ isActive }) => `
                flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                ${isActive 
                  ? "bg-slate-900 text-blue-400 border border-slate-800 shadow-inner" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"}
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-105" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-850 text-slate-500 uppercase tracking-wide">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-xl border border-slate-900/50 bg-slate-900/20">
            <div className="relative">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 font-bold text-sm">
                CT
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950 ring-2 ring-emerald-500/20" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">Charan Tej</p>
              <p className="text-[10px] text-slate-450 truncate">Administrator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
