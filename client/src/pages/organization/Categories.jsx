import React, { useState, useEffect, useCallback } from "react";
import categoryService from "../../services/categoryService";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import SearchBar from "../../components/SearchBar";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
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
  // Custom fields structure: [{ name: "Warranty", type: "text" }]
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
    // Return key-value object of valid fields
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
        <div className="flex flex-wrap gap-1">
          {keys.map((k) => (
            <span
              key={k}
              className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700/80 px-2 py-0.5 rounded font-mono"
            >
              {k}: {parsed[k]}
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
          Create Category
        </Button>
      </div>

      {/* Categories Table */}
      <div className="overflow-x-auto border border-zinc-800/80 rounded-xl bg-zinc-900/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Code</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Name</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Description</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Custom fields</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wider text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  Loading categories...
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No categories found.
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-zinc-800/10">
                  <td className="px-6 py-4 font-mono text-sm text-zinc-400">{cat.code}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-zinc-200">{cat.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400 truncate max-w-xs">{cat.description || "—"}</td>
                  <td className="px-6 py-4">{renderCustomFieldsPreview(cat.customFields)}</td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditOpen(cat)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteOpen(cat)}>
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
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Category">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input label="Code (Unique)" placeholder="e.g. CAT-LAP" value={code} onChange={(e) => setCode(e.target.value)} required />
          <Input label="Name" placeholder="e.g. Laptops" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Description" placeholder="Category details..." value={description} onChange={(e) => setDescription(e.target.value)} />

          {/* Dynamic Custom Fields editor */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Custom Fields Configuration</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddField} className="py-1">
                <PlusIcon className="h-3 w-3 mr-1" /> Add Field
              </Button>
            </div>
            {customFields.map((field, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Input
                  placeholder="e.g. Warranty"
                  value={field.name}
                  onChange={(e) => handleFieldChange(idx, e.target.value)}
                  className="flex-1"
                />
                <select
                  value={field.type}
                  onChange={(e) => handleFieldTypeChange(idx, e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Checkbox</option>
                  <option value="date">Date</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveField(idx)}
                  className="text-zinc-500 hover:text-red-400 p-2 hover:bg-zinc-800 rounded-lg"
                  disabled={customFields.length <= 1}
                >
                  <TrashIcon className="h-4 w-4" />
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
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Custom Fields Configuration</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddField} className="py-1">
                <PlusIcon className="h-3 w-3 mr-1" /> Add Field
              </Button>
            </div>
            {customFields.map((field, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Input
                  placeholder="e.g. Processor"
                  value={field.name}
                  onChange={(e) => handleFieldChange(idx, e.target.value)}
                  className="flex-1"
                />
                <select
                  value={field.type}
                  onChange={(e) => handleFieldTypeChange(idx, e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Checkbox</option>
                  <option value="date">Date</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveField(idx)}
                  className="text-zinc-500 hover:text-red-400 p-2 hover:bg-zinc-800 rounded-lg"
                  disabled={customFields.length <= 1}
                >
                  <TrashIcon className="h-4 w-4" />
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
