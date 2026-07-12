import React, { useState, useEffect, useCallback } from "react";
import employeeService from "../../services/employeeService";
import departmentService from "../../services/departmentService";
import Badge from "../../components/Badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const Employees = () => {
  const { role: currentUserRole } = useAuth();
  const isAdmin = currentUserRole === "Admin";

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter and pagination states
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        departmentId: deptFilter ? Number(deptFilter) : undefined,
        role: roleFilter || undefined,
      };
      const res = await employeeService.getAll(params);
      setEmployees(res.data?.employees || []);
      setPagination(
        res.data?.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, [page, search, deptFilter, roleFilter]);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await departmentService.getAll();
      setDepartments(res.data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleRoleChange = async (empId, newRole) => {
    if (!isAdmin) {
      toast.error("Access denied. Only Admins can modify employee roles.");
      return;
    }
    try {
      await employeeService.promoteRole(empId, newRole);
      toast.success("Employee role updated successfully!");
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role.");
    }
  };

  const handleDeptChange = async (empId, newDeptId) => {
    try {
      await employeeService.assignDepartment(empId, newDeptId ? Number(newDeptId) : null);
      toast.success("Employee department updated successfully!");
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign department.");
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "Admin":
        return "danger";
      case "AssetManager":
        return "info";
      case "DeptHead":
        return "warning";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Filtering Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900/20 p-3 rounded-2xl border border-zinc-850">
        <div className="relative w-full max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-zinc-550" />
          </span>
          <input
            type="text"
            placeholder="Search operators..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-950/80 border border-zinc-800 focus:border-blue-500/50 rounded-xl text-zinc-250 placeholder-zinc-650 focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
            className="bg-zinc-950/80 border border-zinc-800 text-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-zinc-950/80 border border-zinc-800 text-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="AssetManager">Asset Manager</option>
            <option value="DeptHead">Department Head</option>
            <option value="Employee">Employee</option>
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto border border-zinc-850 rounded-2xl bg-zinc-900/10 shadow-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-555 uppercase text-[9px] font-bold tracking-wider">
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Email</th>
              <th className="px-6 py-3.5">Department</th>
              <th className="px-6 py-3.5">Role Authorization</th>
              {isAdmin && <th className="px-6 py-3.5 text-right">Promote operator</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850/40">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  <span className="h-5 w-5 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin inline-block" />
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-zinc-550 font-medium">
                  No registered operators matched.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-zinc-900/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-200">{emp.name}</td>
                  <td className="px-6 py-4 text-zinc-450 font-mono text-[11px]">{emp.email}</td>
                  <td className="px-6 py-4">
                    {isAdmin ? (
                      <select
                        value={emp.departmentId || ""}
                        onChange={(e) => handleDeptChange(emp.id, e.target.value)}
                        className="bg-zinc-950/80 border border-zinc-800 text-zinc-300 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="">No Department</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-zinc-300 font-semibold">{emp.department?.name || "—"}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getRoleBadgeVariant(emp.role)} className="uppercase text-[8px] font-black tracking-wider">
                      {emp.role}
                    </Badge>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <select
                        value={emp.role}
                        onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                        className="bg-zinc-950/80 border border-zinc-800 text-zinc-300 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="Employee">Employee</option>
                        <option value="DeptHead">Dept Head</option>
                        <option value="AssetManager">Asset Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/20 border border-zinc-850 rounded-2xl">
          <div className="text-xs text-zinc-500 font-medium">
            Showing Page <span className="font-bold text-zinc-300">{pagination.page}</span> of{" "}
            <span className="font-bold text-zinc-300">{pagination.totalPages}</span> ({pagination.total} employees)
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
