import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import assetService from "../services/assetService";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Card from "../components/Card";
import Tabs from "../components/Tabs";
import LoadingSpinner from "../components/LoadingSpinner";
import RegisterAssetModal from "../components/RegisterAssetModal";
import ConfirmDialog from "../components/ConfirmDialog";
import toast from "react-hot-toast";
import { ArrowLeftIcon, CalendarDaysIcon, MapPinIcon, ShieldCheckIcon, UserIcon, WrenchScrewdriverIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("allocation");

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchAssetDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await assetService.getById(id);
      setAsset(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load asset details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssetDetails();
  }, [fetchAssetDetails]);

  const handleDeleteSubmit = async () => {
    if (!asset) return;
    try {
      await assetService.delete(asset.id);
      toast.success(`Asset "${asset.name}" deleted successfully.`);
      setIsDeleteOpen(false);
      navigate("/assets");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete asset.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-20 space-y-4">
        <h4 className="text-lg font-bold text-zinc-300">Asset Not Found</h4>
        <p className="text-sm text-zinc-500">The asset may have been removed or does not exist.</p>
        <Link to="/assets">
          <Button className="mt-4">Back to Registry</Button>
        </Link>
      </div>
    );
  }

  // Get status badge
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

  // Custom Fields Parser
  const renderCustomFields = () => {
    const fields = asset.category?.customFields;
    if (!fields) return <p className="text-xs text-zinc-500 italic">No extra custom fields configured for this category.</p>;

    try {
      const parsed = typeof fields === "string" ? JSON.parse(fields) : fields;
      const keys = Object.keys(parsed);
      if (keys.length === 0) return <p className="text-xs text-zinc-500 italic">No custom attributes set.</p>;

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {keys.map((k) => (
            <div key={k} className="p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/80">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">{k}</span>
              <span className="text-xs font-semibold text-zinc-300 mt-1 block capitalize">{parsed[k]}</span>
            </div>
          ))}
        </div>
      );
    } catch {
      return <p className="text-xs text-zinc-500 italic">Failed to parse custom attributes.</p>;
    }
  };

  // Tabs structure
  const tabs = [
    { id: "allocation", label: "Allocation & Transfers" },
    { id: "maintenance", label: "Maintenance Log" }
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <Link to="/dashboard" className="hover:text-zinc-350">Dashboard</Link>
          <span>/</span>
          <Link to="/assets" className="hover:text-zinc-350">Assets</Link>
          <span>/</span>
          <span className="text-blue-400 font-mono">{asset.assetTag}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="flex items-center space-x-1.5"
          >
            <PencilSquareIcon className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="flex items-center space-x-1.5"
          >
            <TrashIcon className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/assets")}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Back to Assets List"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold text-zinc-100">{asset.name}</h3>
            {getStatusBadge(asset.status)}
          </div>
          <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">Tag: {asset.assetTag} | Serial: {asset.serialNumber || "—"}</p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: General Asset Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-zinc-800/80 p-5 space-y-6">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-800">
              Technical Information
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Category</span>
                <span className="text-sm font-semibold text-zinc-200">{asset.category?.name || "Unassigned"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Acquisition Cost</span>
                <span className="text-sm font-semibold text-zinc-200">
                  {asset.purchaseCost ? `$${Number(asset.purchaseCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Purchase Date</span>
                <span className="text-sm font-semibold text-zinc-200">
                  {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Condition</span>
                <span className="text-sm font-semibold text-zinc-200 capitalize">{asset.condition || "Good"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Location</span>
                <span className="text-sm font-semibold text-zinc-200 flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4 text-zinc-450 inline" />
                  <span>{asset.location || "Unassigned"}</span>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Custodian Department</span>
                <span className="text-sm font-semibold text-zinc-200">{asset.department?.name || "Unassigned"}</span>
              </div>
            </div>
          </Card>

          {/* Dynamic Attributes configured on Category */}
          <Card className="border border-zinc-800/80 p-5 space-y-6">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-800">
              Custom Attributes
            </h4>
            {renderCustomFields()}
          </Card>
        </div>

        {/* Right Side: Image and Timeline logs */}
        <div className="space-y-6">
          
          {/* Photo viewer */}
          <Card className="border border-zinc-800/80 p-4 flex items-center justify-center bg-zinc-950/20 overflow-hidden relative group">
            {asset.attachmentUrl ? (
              <img
                src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${asset.attachmentUrl}`}
                alt={asset.name}
                className="max-h-64 object-contain rounded-lg border border-zinc-900 shadow-xl"
              />
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-zinc-600">
                <ShieldCheckIcon className="h-10 w-10 opacity-40" />
                <span className="text-xs font-semibold mt-2">No Photo Attached</span>
              </div>
            )}
          </Card>

          {/* Timeline and History logs */}
          <Card className="border border-zinc-800/80 p-5 space-y-5">
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="pt-2">
              {activeTab === "allocation" ? (
                <div className="relative border-l border-zinc-800 ml-3.5 space-y-6">
                  {/* Current Active Allocation */}
                  <div className="relative pl-7">
                    <span className="absolute -left-3.5 top-0.5 flex items-center justify-center bg-blue-600 border border-zinc-950 h-7 w-7 rounded-full text-white shadow-lg shadow-blue-500/20">
                      <UserIcon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">Current Custody Status</p>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Assigned Department</p>
                      <div className="mt-2 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-850">
                        <span className="text-xs font-semibold text-zinc-350">{asset.department?.name || "Unassigned"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Initial Registration log */}
                  <div className="relative pl-7">
                    <span className="absolute -left-3.5 top-0.5 flex items-center justify-center bg-zinc-800 border border-zinc-950 h-7 w-7 rounded-full text-zinc-400">
                      <CalendarDaysIcon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-zinc-350">Asset Registered</p>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                        {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Creation Date"}
                      </p>
                      <span className="text-[10px] text-zinc-550 italic block mt-1">Status initially set to Available</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative border-l border-zinc-800 ml-3.5 space-y-6">
                  {/* Mock/Simulated Maintenance event */}
                  <div className="relative pl-7">
                    <span className="absolute -left-3.5 top-0.5 flex items-center justify-center bg-zinc-850 border border-zinc-950 h-7 w-7 rounded-full text-zinc-450">
                      <WrenchScrewdriverIcon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-zinc-450">No Maintenance History</p>
                      <p className="text-[10px] text-zinc-550 font-semibold mt-0.5">Zero service logs reported for this entry.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Register Modal */}
      <RegisterAssetModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={fetchAssetDetails}
        asset={asset}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteSubmit}
        title="Delete Asset"
        message={`Are you sure you want to delete the asset "${asset.name}" (${asset.assetTag})? This action is irreversible.`}
      />
    </div>
  );
};

export default AssetDetail;
