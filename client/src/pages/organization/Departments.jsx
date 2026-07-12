import React, { useState, useEffect, useCallback } from "react";
import departmentService from "../../services/departmentService";
import employeeService from "../../services/employeeService";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import ConfirmDialog from "../../components/ConfirmDialog";
import SearchBar from "../../components/SearchBar";
import toast from "react-hot-toast";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form states
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    parentId: "",
    headId: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [deptRes, empRes] = await Promise.all([
        departmentService.getAll(),
        employeeService.getAll({ limit: 100 }), // Fetch employees for head assignment
      ]);
      setDepartments(deptRes.data || []);
      setEmployees(empRes.data?.employees || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load departments data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateOpen = () => {
    setFormData({ name: "", code: "", parentId: "", headId: "" });
    setIsCreateOpen(true);
  };

  const handleEditOpen = (dept) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      parentId: dept.parentId ? String(dept.parentId) : "",
      headId: dept.headId ? String(dept.headId) : "",
    });
    setIsEditOpen(true);
  };

  const handleDeleteOpen = (dept) => {
    setSelectedDept(dept);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Name and Code are required.");
      return;
    }
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        parentId: formData.parentId ? Number(formData.parentId) : null,
        headId: formData.headId ? Number(formData.headId) : null,
      };
      await departmentService.create(payload);
      toast.success("Department created successfully!");
      setIsCreateOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create department.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Name and Code are required.");
      return;
    }
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        parentId: formData.parentId ? Number(formData.parentId) : null,
        headId: formData.headId ? Number(formData.headId) : null,
      };
      await departmentService.update(selectedDept.id, payload);
      toast.success("Department updated successfully!");
      setIsEditOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update department.");
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await departmentService.delete(selectedDept.id);
      toast.success("Department deleted successfully!");
      setIsDeleteOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete department.");
    }
  };

  const handleStatusToggle = async (dept) => {
    try {
      await departmentService.updateStatus(dept.id, !dept.isActive);
      toast.success(`Department ${!dept.isActive ? "activated" : "deactivated"} successfully!`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    }
  };

  const handleHeadAssign = async (deptId, headId) => {
    try {
      await departmentService.updateHead(deptId, headId ? Number(headId) : null);
      toast.success("Department head updated successfully!");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign head.");
    }
  };

  const filteredDepts = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name or code..."
          className="max-w-xs"
        />
        <Button onClick={handleCreateOpen} className="w-full sm:w-auto">
          Create Department
        </Button>
      </div>

      {/* Departments Table */}
      <div className="overflow-x-auto border border-zinc-800/80 rounded-xl bg-zinc-900/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Code</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Name</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Parent</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Head</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Status</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wider text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  Loading departments...
                </td>
              </tr>
            ) : filteredDepts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No departments found.
                </td>
              </tr>
            ) : (
              filteredDepts.map((dept) => (
                <tr key={dept.id} className="hover:bg-zinc-800/10">
                  <td className="px-6 py-4 font-mono text-sm text-zinc-400">{dept.code}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-zinc-200">{dept.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {dept.parent ? (
                      <span className="font-semibold text-zinc-350">{dept.parent.name}</span>
                    ) : (
                      <span className="text-zinc-650 italic">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <select
                      value={dept.headId || ""}
                      onChange={(e) => handleHeadAssign(dept.id, e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500/30"
                    >
                      <option value="">No Head Assigned</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.email})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleStatusToggle(dept)}
                      className="focus:outline-none"
                    >
                      <Badge variant={dept.isActive ? "success" : "danger"}>
                        {dept.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditOpen(dept)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteOpen(dept)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Department">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Code (Unique)"
            placeholder="e.g. DEPT-ENG"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
          <Input
            label="Name"
            placeholder="e.g. Engineering"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Parent Department</label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-3.5 py-2 text-sm focus:ring-1 focus:ring-blue-500"
            >
              <option value="">None</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Department">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Code (Unique)"
            placeholder="e.g. DEPT-ENG"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
          <Input
            label="Name"
            placeholder="e.g. Engineering"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Parent Department</label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-3.5 py-2 text-sm focus:ring-1 focus:ring-blue-500"
            >
              <option value="">None</option>
              {departments
                .filter((d) => d.id !== selectedDept?.id) // Prevent parent assignment to self
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-center space-x-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteSubmit}
        title="Delete Department"
        message={`Are you sure you want to delete the department "${selectedDept?.name}"? Any sub-departments or employee references will be unassigned.`}
      />
    </div>
  );
};

export default Departments;
