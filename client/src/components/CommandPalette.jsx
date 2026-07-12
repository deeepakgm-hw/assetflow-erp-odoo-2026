import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  TagIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  BellIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import departmentService from "../services/departmentService";
import categoryService from "../services/categoryService";
import employeeService from "../services/employeeService";
import { useAuth } from "../hooks/useAuth";

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    departments: [],
    categories: [],
    employees: [],
  });
  const [db, setDb] = useState({
    departments: [],
    categories: [],
    employees: [],
  });
  const inputRef = useRef(null);
  const paletteRef = useRef(null);

  // Load searchable indices when the palette is opened
  useEffect(() => {
    if (!isOpen) return;

    const loadIndex = async () => {
      try {
        const [deptRes, catRes, empRes] = await Promise.all([
          departmentService.getAll(),
          categoryService.getAll(),
          employeeService.getAll({ limit: 100 }),
        ]);
        setDb({
          departments: deptRes.data || [],
          categories: catRes.data || [],
          employees: empRes.data?.employees || [],
        });
      } catch (err) {
        console.error("Failed to load command palette index:", err);
      }
    };

    loadIndex();
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Filter local database based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults({ departments: [], categories: [], employees: [] });
      return;
    }

    const q = query.toLowerCase();
    const filteredDepts = db.departments.filter(
      (d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
    );
    const filteredCats = db.categories.filter((c) => c.name.toLowerCase().includes(q));
    const filteredEmps = db.employees.filter(
      (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
    );

    setResults({
      departments: filteredDepts.slice(0, 3),
      categories: filteredCats.slice(0, 3),
      employees: filteredEmps.slice(0, 3),
    });
  }, [query, db]);

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose();
  };

  if (!isOpen) return null;

  const defaultShortcuts = [
    { name: "Go to Dashboard", icon: HomeIcon, action: () => handleNavigate("/dashboard") },
    { name: "Manage Setup", icon: Squares2X2Icon, action: () => handleNavigate("/organization") },
    { name: "System Alerts", icon: BellIcon, action: () => handleNavigate("/notifications") },
    { name: "Audit Trail", icon: ClipboardDocumentIcon, action: () => handleNavigate("/activity") },
    { name: "Log Out", icon: ArrowRightOnRectangleIcon, action: handleLogout, danger: true },
  ];

  const hasResults =
    results.departments.length > 0 ||
    results.categories.length > 0 ||
    results.employees.length > 0;

  return (
    <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4 select-none">
      <div
        ref={paletteRef}
        className="w-full max-w-lg bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-2xl shadow-zinc-950 overflow-hidden flex flex-col max-h-[420px]"
      >
        {/* Search Input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 bg-zinc-950/50">
          <MagnifyingGlassIcon className="h-5 w-5 text-zinc-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search departments, categories, employees..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 border-none outline-none focus:ring-0"
          />
          <button
            onClick={onClose}
            className="text-[10px] bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-400 font-bold px-2 py-0.5 rounded transition-all"
          >
            ESC
          </button>
        </div>

        {/* Results / Navigation body */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
          {!query.trim() ? (
            <div>
              <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-1.5">
                Quick Shortcuts
              </h5>
              <div className="space-y-1">
                {defaultShortcuts.map((sc, idx) => (
                  <button
                    key={idx}
                    onClick={sc.action}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-zinc-350 hover:bg-zinc-800/80 transition-all ${
                      sc.danger ? "hover:text-red-400 hover:bg-red-950/10" : "hover:text-zinc-100"
                    }`}
                  >
                    <span className="flex items-center space-x-2.5">
                      <sc.icon className="h-4 w-4 opacity-70" />
                      <span>{sc.name}</span>
                    </span>
                    <span className="text-[9px] text-zinc-600 font-bold">↵</span>
                  </button>
                ))}
              </div>
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching records found for "{query}"
            </div>
          ) : (
            <div className="space-y-4">
              {/* Departments */}
              {results.departments.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-1.5">
                    Departments
                  </h5>
                  <div className="space-y-0.5">
                    {results.departments.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleNavigate("/organization")}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all"
                      >
                        <span className="flex items-center space-x-2.5">
                          <Squares2X2Icon className="h-4 w-4 text-blue-500/80" />
                          <span>{d.name}</span>
                        </span>
                        <span className="font-mono text-[9px] text-zinc-500">{d.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {results.categories.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-1.5">
                    Asset Categories
                  </h5>
                  <div className="space-y-0.5">
                    {results.categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleNavigate("/organization")}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all"
                      >
                        <span className="flex items-center space-x-2.5">
                          <TagIcon className="h-4 w-4 text-emerald-500/80" />
                          <span>{c.name}</span>
                        </span>
                        <span className="text-[9px] text-zinc-500">Category</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Employees */}
              {results.employees.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-1.5">
                    Employees
                  </h5>
                  <div className="space-y-0.5">
                    {results.employees.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => handleNavigate("/organization")}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all"
                      >
                        <span className="flex items-center space-x-2.5">
                          <UserIcon className="h-4 w-4 text-amber-500/80" />
                          <span>{e.name}</span>
                        </span>
                        <span className="font-mono text-[9px] text-zinc-500">{e.email}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
