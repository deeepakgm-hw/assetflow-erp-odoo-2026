import React, { useState, useEffect, useCallback } from "react";
import categoryService from "../../services/categoryService";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form states
  const [selectedCat, setSelectedCat] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [customFields, setCustomFields] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll();
      setCategories(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateOpen = () => {
    setName("");
    setCode("");
    setDescription("");
    setCustomFields([{ name: "", type: "text" }]);
    setIsCreateOpen(true);
  };

  const handleEditOpen = (cat) => {
    setSelectedCat(cat);
    setName(cat.name);
    setCode(cat.code);
    setDescription(cat.description || "");

    // Load custom fields JSON
    let fields = [];
    if (cat.customFields) {
      try {
        const parsed = typeof cat.customFields === "string" ? JSON.parse(cat.customFields) : cat.customFields;
        if (Array.isArray(parsed)) {
          fields = parsed;
        } else if (typeof parsed === "object") {
          fields = Object.entries(parsed).map(([k, v]) => ({ name: k, type: v }));
        }
      } catch (e) {
        console.error("Error parsing customFields JSON:", e);
      }
    }
    setCustomFields(fields.length > 0 ? fields : [{ name: "", type: "text" }]);
    setIsEditOpen(true);
  };

  const handleDeleteOpen = (cat) => {
    setSelectedCat(cat);
    setIsDeleteOpen(true);
  };

  const handleAddField = () => {
    setCustomFields([...customFields, { name: "", type: "text" }]);
  };

  const handleRemoveField = (index) => {
    const updated = [...customFields];
    updated.splice(index, 1);
    setCustomFields(updated);
  };

  const handleFieldChange = (index, value) => {
    const updated = [...customFields];
    updated[index].name = value;
    setCustomFields(updated);
  };

  const handleFieldTypeChange = (index, value) => {
    const updated = [...customFields];
    updated[index].type = value;
    setCustomFields(updated);
  };

  const formatCustomFieldsPayload = () => {
    const obj = {};
    customFields.forEach((f) => {
      if (f.name.trim()) {
        obj[f.name.trim()] = f.type;
      }
    });
    return obj;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("Name and Code are required.");
      return;
    }
    try {
      const payload = {
        name,
        code,
        description,
        customFields: formatCustomFieldsPayload(),
      };
      await categoryService.create(payload);
      toast.success("Category created successfully!");
      setIsCreateOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create category.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("Name and Code are required.");
      return;
    }
    try {
      const payload = {
        name,
        code,
        description,
        customFields: formatCustomFieldsPayload(),
      };
      await categoryService.update(selectedCat.id, payload);
      toast.success("Category updated successfully!");
      setIsEditOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category.");
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await categoryService.delete(selectedCat.id);
      toast.success("Category deleted successfully!");
      setIsDeleteOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category.");
    }
  };

  const renderCustomFieldsPreview = (fields) => {
    if (!fields) return <span className="text-zinc-650 italic">None</span>;
    try {
      const parsed = typeof fields === "string" ? JSON.parse(fields) : fields;
      const keys = Object.keys(parsed);
      if (keys.length === 0) return <span className="text-zinc-650 italic">None</span>;
      return (
        <div className="flex flex-wrap gap-1.5">
          {keys.map((k) => (
            <span
              key={k}
              className="text-[9px] bg-zinc-950 text-zinc-400 border border-zinc-850 px-2 py-0.5 rounded font-mono font-bold"
            >
              {k}: <span className="text-blue-400 font-extrabold">{parsed[k]}</span>
            </span>
          ))}
        </div>
      );
    } catch (e) {
      return <span className="text-zinc-650 italic">None</span>;
    }
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/20 p-3 rounded-2xl border border-zinc-850">
        <div className="relative w-full max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-zinc-550" />
          </span>
          <input
            type="text"
            placeholder="Search categories..."
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
          <span>Create Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="overflow-x-auto border border-zinc-850 rounded-2xl bg-zinc-900/10 shadow-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-550 uppercase text-[9px] font-bold tracking-wider">
              <th className="px-6 py-3.5">Code</th>
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Description</th>
              <th className="px-6 py-3.5">Custom metadata Fields</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850/40">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  <span className="h-5 w-5 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin inline-block" />
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-zinc-550 font-medium">
                  No categories matched your query.
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-zinc-900/10 transition-colors">
                  <td className="px-6 py-4 font-mono text-[10px] text-zinc-400">{cat.code}</td>
                  <td className="px-6 py-4 font-bold text-zinc-200">{cat.name}</td>
                  <td className="px-6 py-4 text-zinc-450 truncate max-w-xs">{cat.description || "—"}</td>
                  <td className="px-6 py-4">{renderCustomFieldsPreview(cat.customFields)}</td>
                  <td className="px-6 py-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleEditOpen(cat)}
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-450 hover:text-white transition-colors inline-flex items-center"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteOpen(cat)}
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
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Category">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input label="Code (Unique)" placeholder="e.g. CAT-LAP" value={code} onChange={(e) => setCode(e.target.value)} required />
          <Input label="Name" placeholder="e.g. Laptops" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Description" placeholder="Category details..." value={description} onChange={(e) => setDescription(e.target.value)} />

          {/* Dynamic Custom Fields editor */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Custom Fields Configuration</label>
              <button
                type="button"
                onClick={handleAddField}
                className="px-2.5 py-1 text-[10px] font-bold bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-lg flex items-center space-x-1 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>Add Property</span>
              </button>
            </div>
            {customFields.map((field, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  placeholder="Property name (e.g. Warranty)"
                  value={field.name}
                  onChange={(e) => handleFieldChange(idx, e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none placeholder-zinc-650"
                />
                <select
                  value={field.type}
                  onChange={(e) => handleFieldTypeChange(idx, e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Checkbox</option>
                  <option value="date">Date</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveField(idx)}
                  className="text-zinc-500 hover:text-red-400 p-2 hover:bg-zinc-900 rounded-xl transition-colors"
                  disabled={customFields.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-3 pt-6">
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
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Category">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input label="Code (Unique)" placeholder="e.g. CAT-LAP" value={code} onChange={(e) => setCode(e.target.value)} required />
          <Input label="Name" placeholder="e.g. Laptops" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Description" placeholder="Category details..." value={description} onChange={(e) => setDescription(e.target.value)} />

          {/* Dynamic Custom Fields editor */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Custom Fields Configuration</label>
              <button
                type="button"
                onClick={handleAddField}
                className="px-2.5 py-1 text-[10px] font-bold bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-lg flex items-center space-x-1 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>Add Property</span>
              </button>
            </div>
            {customFields.map((field, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  placeholder="Property name (e.g. Warranty)"
                  value={field.name}
                  onChange={(e) => handleFieldChange(idx, e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none placeholder-zinc-650"
                />
                <select
                  value={field.type}
                  onChange={(e) => handleFieldTypeChange(idx, e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Checkbox</option>
                  <option value="date">Date</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveField(idx)}
                  className="text-zinc-500 hover:text-red-400 p-2 hover:bg-zinc-900 rounded-xl transition-colors"
                  disabled={customFields.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-3 pt-6">
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
        title="Delete Category"
        message={`Are you sure you want to delete the category "${selectedCat?.name}"? Any linked asset templates or entries will lose this association.`}
      />
    </div>
  );
};

export default Categories;
