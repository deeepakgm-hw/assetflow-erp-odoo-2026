import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import assetService from "../services/assetService";
import categoryService from "../services/categoryService";
import departmentService from "../services/departmentService";
import DataTable from "../components/DataTable";
import SearchBar from "../components/SearchBar";
import Button from "../components/Button";
import Badge from "../components/Badge";
import RegisterAssetModal from "../components/RegisterAssetModal";
import ConfirmDialog from "../components/ConfirmDialog";
import toast from "react-hot-toast";
import { PlusIcon, AdjustmentsHorizontalIcon, SparklesIcon, TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

const Assets = () => {
  const navigate = useNavigate();

  // Data states
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter/Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);

  // Load dropdown categories & departments
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [catRes, deptRes] = await Promise.all([
          categoryService.getAll(),
          departmentService.getAll(),
        ]);
        setCategories(catRes.data || []);
        setDepartments(deptRes.data || []);
      } catch (error) {
        console.error("Failed to load filter choices:", error);
      }
    };
    loadFiltersData();
  }, []);

  // Main fetch function
  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: searchQuery || undefined,
        category_id: selectedCategory || undefined,
        department_id: selectedDepartment || undefined,
        status: selectedStatus || undefined,
      };

      const res = await assetService.getAll(params);
      setAssets(res.data || []);
      
      // Handle pagination
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
        setTotalItems(res.pagination.total || 0);
      } else {
        setTotalPages(1);
        setTotalItems(res.data?.length || 0);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load asset registry.");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedCategory, selectedDepartment, selectedStatus]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Handle pagination change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedDepartment("");
    setSelectedStatus("");
    setPage(1);
  };

  // Deletion submit
  const handleDeleteSubmit = async () => {
    if (!assetToDelete) return;
    try {
      await assetService.delete(assetToDelete.id);
      toast.success(`Asset "${assetToDelete.name}" deleted successfully.`);
      setIsDeleteOpen(false);
      setAssetToDelete(null);
      fetchAssets();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete asset.");
    }
  };

  // Status Badge Mapper
  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : "";
    switch (s) {
      case "available":
      case "active":
        return <Badge variant="success">Available</Badge>;
      case "allocated":
      case "assigned":
        return <Badge variant="info">Allocated</Badge>;
      case "maintenance":
        return <Badge variant="warning">Maintenance</Badge>;
      case "disposed":
      case "retired":
        return <Badge variant="danger">Retired</Badge>;
      default:
        return <Badge variant="neutral">{status || "Unknown"}</Badge>;
    }
  };

  // Define Table Columns
  const columns = [
    {
      header: "Tag",
      accessor: "assetTag",
      className: "font-mono font-bold text-blue-400 group-hover:text-blue-300",
      render: (row) => (
        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/assets/${row.id}`);
          }}
          className="cursor-pointer hover:underline"
        >
          {row.assetTag}
        </span>
      )
    },
    {
      header: "Name",
      accessor: "name",
      className: "font-semibold text-zinc-100",
      render: (row) => (
        <div className="flex items-center space-x-3">
          {row.attachmentUrl && (
            <img
              src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${row.attachmentUrl}`}
              alt="Asset Thumbnail"
              className="h-8 w-8 rounded object-cover border border-zinc-800 bg-zinc-900"
            />
          )}
          <span>{row.name}</span>
        </div>
      )
    },
    {
      header: "Category",
      accessor: "category",
      render: (row) => row.category?.name || "—"
    },
    {
      header: "Custodian",
      accessor: "department",
      render: (row) => row.department?.name || "—"
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: "Location",
      accessor: "location",
      render: (row) => row.location || "—"
    },
    {
      header: "Bookable",
      accessor: "isBookable",
      render: (row) => (
        row.isBookable ? (
          <span className="text-xs text-emerald-400 font-semibold uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Yes</span>
        ) : (
          <span className="text-xs text-zinc-500 font-semibold uppercase bg-zinc-800 border border-zinc-700/60 px-2 py-0.5 rounded">No</span>
        )
      )
    },
    {
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAsset(row);
              setIsRegisterOpen(true);
            }}
            className="text-zinc-400 hover:text-blue-450 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Edit Asset"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAssetToDelete(row);
              setIsDeleteOpen(true);
            }}
            className="text-zinc-500 hover:text-red-450 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Delete Asset"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-100 flex items-center space-x-2">
            <span>Asset Registry</span>
            <SparklesIcon className="h-5 w-5 text-blue-500 animate-pulse" />
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            Register and manage organizational equipment, track locations, and edit availability options.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedAsset(null);
            setIsRegisterOpen(true);
          }}
          className="flex items-center justify-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Register Asset</span>
        </Button>
      </div>

      {/* Search and Filters Layout */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setPage(1);
            }}
            placeholder="Search by name, tag, or serial..."
            className="flex-1"
          />
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-2 py-2"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            {(selectedCategory || selectedDepartment || selectedStatus || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline font-semibold px-2"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Filters Section */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 h-9"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Custodian Dept</label>
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setPage(1);
                }}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 h-9"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 h-9"
              >
                <option value="">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Allocated">Allocated</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="min-h-[40vh] flex flex-col justify-between">
        <DataTable
          columns={columns}
          data={assets}
          loading={loading}
          pagination={{ page, totalPages, total: totalItems }}
          onPageChange={handlePageChange}
          emptyMessage="No assets registered match the filters. Create one above to get started!"
        />
      </div>

      {/* Register/Edit Asset Modal */}
      <RegisterAssetModal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          setSelectedAsset(null);
        }}
        onSuccess={fetchAssets}
        asset={selectedAsset}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setAssetToDelete(null);
        }}
        onConfirm={handleDeleteSubmit}
        title="Delete Asset"
        message={`Are you sure you want to delete the asset "${assetToDelete?.name}" (${assetToDelete?.assetTag})? All historical data logs, allocations, and maintenance history related to this asset will be permanently erased.`}
      />
    </div>
  );
};

export default Assets;
