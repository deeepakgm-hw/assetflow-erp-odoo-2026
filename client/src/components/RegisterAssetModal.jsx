import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import categoryService from "../services/categoryService";
import departmentService from "../services/departmentService";
import assetService from "../services/assetService";
import toast from "react-hot-toast";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";

const RegisterAssetModal = ({ isOpen, onClose, onSuccess, asset = null }) => {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [condition, setCondition] = useState("Good");
  const [location, setLocation] = useState("Main Warehouse");
  const [isBookable, setIsBookable] = useState(true);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Load dropdown choices
  useEffect(() => {
    if (!isOpen) return;

    const loadDropdowns = async () => {
      try {
        const [catRes, deptRes] = await Promise.all([
          categoryService.getAll(),
          departmentService.getAll(),
        ]);
        setCategories(catRes.data || []);
        setDepartments(deptRes.data || []);
      } catch (error) {
        console.error("Failed to load categories/departments:", error);
      }
    };
    loadDropdowns();
  }, [isOpen]);

  // Set form fields when editing an asset
  useEffect(() => {
    if (asset) {
      setName(asset.name || "");
      setCategoryId(asset.categoryId || "");
      setDepartmentId(asset.departmentId || "");
      setSerialNumber(asset.serialNumber || "");
      setAcquisitionCost(asset.purchaseCost !== undefined ? String(asset.purchaseCost) : "");
      setPurchaseDate(asset.purchaseDate ? asset.purchaseDate.substring(0, 10) : "");
      setCondition(asset.condition || "Good");
      setLocation(asset.location || "Main Warehouse");
      setIsBookable(asset.isBookable !== undefined ? asset.isBookable : true);
      setFile(null);
      setPreviewUrl(asset.attachmentUrl ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${asset.attachmentUrl}` : "");
    } else {
      // Clear form for creation
      setName("");
      setCategoryId("");
      setDepartmentId("");
      setSerialNumber("");
      setAcquisitionCost("");
      setPurchaseDate(new Date().toISOString().substring(0, 10));
      setCondition("Good");
      setLocation("Main Warehouse");
      setIsBookable(true);
      setFile(null);
      setPreviewUrl("");
    }
  }, [asset, isOpen]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check size limit (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleClearFile = () => {
    setFile(null);
    setPreviewUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Asset name is required.");
      return;
    }
    if (!categoryId) {
      toast.error("Category selection is required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category_id", categoryId);
    formData.append("serial_number", serialNumber);
    formData.append("acquisition_cost", acquisitionCost);
    formData.append("purchaseDate", purchaseDate);
    formData.append("condition", condition);
    formData.append("location", location);
    formData.append("is_bookable", isBookable);
    if (departmentId) {
      formData.append("department_id", departmentId);
    }
    if (file) {
      formData.append("attachment", file);
    }

    try {
      setLoading(true);
      if (asset) {
        await assetService.update(asset.id, formData);
        toast.success("Asset updated successfully!");
      } else {
        await assetService.create(formData);
        toast.success("Asset registered successfully!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      const errors = error.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        errors.forEach(err => toast.error(err.msg || err.message));
      } else {
        toast.error(error.response?.data?.message || "Failed to save asset.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={asset ? "Edit Asset" : "Register Asset"}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Asset Name"
            placeholder="e.g. MacBook Pro M3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-2 text-sm focus:ring-1 focus:ring-blue-500 h-10"
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Serial Number (Unique)"
            placeholder="e.g. SN-XYZ-987"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Custodian Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-2 text-sm focus:ring-1 focus:ring-blue-500 h-10"
            >
              <option value="">Unassigned</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Acquisition Cost"
            type="number"
            step="0.01"
            placeholder="e.g. 1299.99"
            value={acquisitionCost}
            onChange={(e) => setAcquisitionCost(e.target.value)}
          />
          <Input
            label="Purchase Date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-2 text-sm focus:ring-1 focus:ring-blue-500 h-10"
            >
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <Input
            label="Location"
            placeholder="e.g. London Office, Room 4"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Bookable Switch */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
          <div>
            <p className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Eligible for Bookings</p>
            <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Allow employees to book this resource for business use.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isBookable}
              onChange={(e) => setIsBookable(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white peer-checked:after:border-blue-600"></div>
          </label>
        </div>

        {/* Photo Upload with Preview */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Asset Photo</label>
          {previewUrl ? (
            <div className="relative h-40 w-full rounded-lg overflow-hidden border border-zinc-800/80 bg-zinc-900 flex items-center justify-center">
              <img src={previewUrl} alt="Asset Preview" className="h-full object-contain" />
              <button
                type="button"
                onClick={handleClearFile}
                className="absolute top-2 right-2 bg-zinc-950/80 hover:bg-zinc-900 p-1.5 rounded-full border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Remove photo"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-28 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-lg cursor-pointer bg-zinc-950/20 hover:bg-zinc-900/10 transition-all group">
              <ArrowUpTrayIcon className="h-6 w-6 text-zinc-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-zinc-400 mt-2">Upload Photo</span>
              <span className="text-[10px] text-zinc-550 mt-1">PNG, JPG, JPEG up to 10MB</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center space-x-3 pt-6 border-t border-zinc-900">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={loading}>
            {asset ? "Save Changes" : "Register Asset"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RegisterAssetModal;
