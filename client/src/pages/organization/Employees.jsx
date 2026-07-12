import React, { useState, useEffect, useCallback } from "react";
import employeeService from "../../services/employeeService";
import departmentService from "../../services/departmentService";
import Button from "../../components/Button";
import SearchBar from "../../components/SearchBar";
import Badge from "../../components/Badge";
import LoadingSpinner from "../../components/LoadingSpinner";
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
    <div className="space-y-6">
      {/* Filtering Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by name or email..."
          className="max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-3.5 py-2 text-sm focus:ring-1 focus:ring-blue-500"
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
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-3.5 py-2 text-sm focus:ring-1 focus:ring-blue-500"
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
      <div className="overflow-x-auto border border-zinc-800/80 rounded-xl bg-zinc-900/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Name</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Email</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Department</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Role</th>
              {isAdmin && <th className="px-6 py-4 text-xs font-semibold tracking-wider text-zinc-400 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  <LoadingSpinner size="md" />
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-zinc-800/10">
                  <td className="px-6 py-4 text-sm font-semibold text-zinc-200">{emp.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{emp.email}</td>
                  <td className="px-6 py-4 text-sm">
                    {isAdmin ? (
                      <select
                        value={emp.departmentId || ""}
                        onChange={(e) => handleDeptChange(emp.id, e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500/30"
                      >
                        <option value="">No Department</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-zinc-400 font-semibold">{emp.department?.name || "—"}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant={getRoleBadgeVariant(emp.role)}>
                      {emp.role}
                    </Badge>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-sm text-right">
                      <select
                        value={emp.role}
                        onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500/30"
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/40">
          <div className="text-xs text-zinc-400">
            Showing Page <span className="font-semibold text-zinc-200">{pagination.page}</span> of{" "}
            <span className="font-semibold text-zinc-200">{pagination.totalPages}</span> (Total{" "}
            <span className="font-semibold text-zinc-200">{pagination.total}</span> employees)
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
