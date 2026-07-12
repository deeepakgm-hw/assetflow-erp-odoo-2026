import React, { useState, useEffect, useCallback } from "react";
import departmentService from "../../services/departmentService";
import employeeService from "../../services/employeeService";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Search, Plus, Edit2, Trash2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
        employeeService.getAll({ limit: 100 }),
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
    <div className="space-y-6 font-sans">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/20 p-3 rounded-2xl border border-zinc-850">
        <div className="relative w-full max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </span>
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-950/80 border border-zinc-800 focus:border-blue-500/50 rounded-xl text-zinc-250 placeholder-zinc-650 focus:outline-none transition-all"
          />
        </div>
        <button
          onClick={handleCreateOpen}
          className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-550 rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-lg shadow-blue-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Create Department</span>
        </button>
      </div>

      {/* Departments Table */}
      <div className="overflow-x-auto border border-zinc-850 rounded-2xl bg-zinc-900/10 shadow-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[9px] font-bold tracking-wider">
              <th className="px-6 py-3.5">Code</th>
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Parent Department</th>
              <th className="px-6 py-3.5">Head Assignment</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850/40">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  <span className="h-5 w-5 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin inline-block" />
                </td>
              </tr>
            ) : filteredDepts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-zinc-550 font-medium">
                  No departments matched your query.
                </td>
              </tr>
            ) : (
              filteredDepts.map((dept) => (
                <tr key={dept.id} className="hover:bg-zinc-900/10 transition-colors">
                  <td className="px-6 py-4 font-mono text-[10px] text-zinc-400">{dept.code}</td>
                  <td className="px-6 py-4 font-bold text-zinc-200">{dept.name}</td>
                  <td className="px-6 py-4 text-zinc-400 font-semibold">
                    {dept.parent ? (
                      <span className="text-zinc-300">{dept.parent.name}</span>
                    ) : (
                      <span className="text-zinc-650 italic">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={dept.headId || ""}
                      onChange={(e) => handleHeadAssign(dept.id, e.target.value)}
                      className="bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none transition-colors"
                    >
                      <option value="">No Head Assigned</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleStatusToggle(dept)}
                      className="focus:outline-none transition-transform hover:scale-95"
                    >
                      <Badge variant={dept.isActive ? "success" : "danger"} className="uppercase tracking-wider text-[8px] font-black">
                        {dept.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleEditOpen(dept)}
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-450 hover:text-white transition-colors inline-flex items-center"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteOpen(dept)}
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-450 hover:text-red-400 transition-colors inline-flex items-center"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Parent Department</label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-zinc-700"
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
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Parent Department</label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-zinc-700"
            >
              <option value="">None</option>
              {departments
                .filter((d) => d.id !== selectedDept?.id)
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
