import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench, AlertTriangle, CheckCircle2, Clock, XCircle,
  UserCheck, Play, Plus, Upload, ChevronRight, Filter, RefreshCw
} from "lucide-react";

const COLUMNS = [
  { key: "Pending", label: "Pending", icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  { key: "Approved", label: "Approved", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  { key: "TechnicianAssigned", label: "Technician", icon: UserCheck, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  { key: "InProgress", label: "In Progress", icon: Play, color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
  { key: "Resolved", label: "Resolved", icon: CheckCircle2, color: "text-teal-400", bg: "bg-teal-400/10", border: "border-teal-400/20" },
  { key: "Rejected", label: "Rejected", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
];

const PRIORITY_COLORS = {
  Low: "bg-zinc-700 text-zinc-300",
  Medium: "bg-amber-500/20 text-amber-300",
  High: "bg-red-500/20 text-red-300",
};

const NEXT_ACTIONS = {
  Pending: [{ label: "Approve", endpoint: "approve", variant: "primary" }, { label: "Reject", endpoint: "reject", variant: "danger" }],
  Approved: [{ label: "Assign Tech", endpoint: "_assign", variant: "secondary" }, { label: "Reject", endpoint: "reject", variant: "danger" }],
  TechnicianAssigned: [{ label: "Start Work", endpoint: "progress", variant: "primary" }],
  InProgress: [{ label: "Mark Resolved", endpoint: "resolve", variant: "primary" }],
  Resolved: [],
  Rejected: [],
};

const AssignTechModal = ({ request, technicians, onAssign, onClose }) => {
  const [techId, setTechId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!techId) return toast.error("Please select a technician");
    setLoading(true);
    try {
      await onAssign(request.id, techId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Assigning technician for: <span className="font-semibold text-zinc-200">{request.asset?.name}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          value={techId}
          onChange={(e) => setTechId(e.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
          required
        >
          <option value="">Select technician…</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
          ))}
        </select>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" type="submit" loading={loading}>Assign</Button>
        </div>
      </form>
    </div>
  );
};

const RequestCard = ({ request, onAction, onAssign }) => {
  const [expanded, setExpanded] = useState(false);
  const actions = NEXT_ACTIONS[request.status] || [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 hover:border-zinc-700 transition-all duration-200 cursor-pointer group"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-zinc-100 text-xs truncate">{request.asset?.name || "Unknown Asset"}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">{request.asset?.type} · #{request.id}</div>
        </div>
        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${PRIORITY_COLORS[request.priority] || PRIORITY_COLORS.Medium}`}>
          {request.priority}
        </span>
      </div>

      <p className="mt-2 text-[11px] text-zinc-400 line-clamp-2">{request.description}</p>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1.5 text-[10px] text-zinc-500">
              <div>By: <span className="text-zinc-300">{request.requestedBy?.name || "—"}</span></div>
              {request.approvedBy && <div>Approved by: <span className="text-zinc-300">{request.approvedBy.name}</span></div>}
              {request.technician && <div>Technician: <span className="text-zinc-300">{request.technician.name}</span></div>}
              {request.notes && <div>Notes: <span className="text-zinc-300">{request.notes}</span></div>}
              <div>{new Date(request.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
              {request.photoUrl && (
                <a href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${request.photoUrl}`}
                  target="_blank" rel="noreferrer"
                  className="text-blue-400 underline block"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Photo
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
          {actions.map((action) => (
            <button
              key={action.endpoint}
              onClick={() => action.endpoint === "_assign" ? onAssign(request) : onAction(request.id, action.endpoint)}
              className={`rounded-lg px-2 py-1 text-[9px] font-bold uppercase tracking-wide transition-all ${
                action.variant === "primary"
                  ? "bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 border border-blue-500/30"
                  : action.variant === "danger"
                  ? "bg-red-600/20 text-red-300 hover:bg-red-600/40 border border-red-500/30"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const RaiseRequestForm = ({ assets, onSuccess }) => {
  const [form, setForm] = useState({ assetId: "", description: "", priority: "Medium" });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assetId || !form.description) return toast.error("Asset and description required");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("assetId", form.assetId);
      fd.append("description", form.description);
      fd.append("priority", form.priority);
      if (photo) fd.append("photo", photo);
      await api.post("/maintenance-requests", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Maintenance request raised!");
      setForm({ assetId: "", description: "", priority: "Medium" });
      setPhoto(null);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to raise request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Asset *</label>
        <select
          value={form.assetId}
          onChange={(e) => setForm({ ...form, assetId: e.target.value })}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none transition"
          required
        >
          <option value="">Select asset…</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>{a.name} {a.type ? `(${a.type})` : ""}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Issue Description *</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe the issue in detail…"
          className="w-full min-h-[100px] rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none resize-none transition"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Priority</label>
        <div className="grid grid-cols-3 gap-2">
          {["Low", "Medium", "High"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setForm({ ...form, priority: p })}
              className={`rounded-xl py-2 text-xs font-bold border transition-all ${
                form.priority === p
                  ? p === "High"
                    ? "bg-red-500/20 border-red-500/50 text-red-300"
                    : p === "Medium"
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-zinc-700 border-zinc-600 text-zinc-200"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Photo (optional)</label>
        <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-3 text-xs text-zinc-500 hover:border-blue-500/50 hover:text-blue-400 transition">
          <Upload className="h-4 w-4" />
          {photo ? photo.name : "Click to upload image"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files[0])} />
        </label>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Raise Request
      </Button>
    </form>
  );
};

const Maintenance = () => {
  const [requests, setRequests] = useState({});
  const [assets, setAssets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignTarget, setAssignTarget] = useState(null);
  const [filterPriority, setFilterPriority] = useState("All");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [reqRes, assetRes, empRes] = await Promise.all([
        api.get("/maintenance-requests"),
        api.get("/assets"),
        api.get("/employees"),
      ]);
      setRequests(reqRes.data.data || {});
      setAssets(assetRes.data.data?.assets || []);
      setTechnicians(empRes.data.data?.employees || []);
    } catch {
      toast.error("Failed to load maintenance data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (requestId, endpoint) => {
    try {
      await api.patch(`/maintenance-requests/${requestId}/${endpoint}`);
      toast.success("Status updated");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const handleAssign = async (requestId, technicianId) => {
    try {
      await api.patch(`/maintenance-requests/${requestId}/assign`, { technicianId: Number(technicianId) });
      toast.success("Technician assigned");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Assignment failed");
    }
  };

  const filteredRequests = useMemo(() => {
    if (filterPriority === "All") return requests;
    const result = {};
    for (const [col, items] of Object.entries(requests)) {
      result[col] = items.filter((r) => r.priority === filterPriority);
    }
    return result;
  }, [requests, filterPriority]);

  const totalCount = useMemo(() =>
    Object.values(requests).reduce((sum, arr) => sum + arr.length, 0), [requests]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Maintenance Management</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{totalCount} total request{totalCount !== 1 ? "s" : ""} across all stages</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Priority filter */}
          <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-1">
            <Filter className="h-3.5 w-3.5 text-zinc-500 ml-2" />
            {["All", "High", "Medium", "Low"].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  filterPriority === p ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button onClick={loadData} className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 transition">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Kanban Board */}
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-400" />
              Kanban Board
            </h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-zinc-600">Loading requests…</div>
          ) : (
            <div className="p-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto min-h-[400px]">
              {COLUMNS.map((col) => {
                const items = filteredRequests[col.key] || [];
                const Icon = col.icon;
                return (
                  <div key={col.key} className={`rounded-2xl border ${col.border} ${col.bg} p-3 min-w-[160px]`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${col.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        <span>{col.label}</span>
                      </div>
                      <span className="rounded-full bg-zinc-900/60 px-2 py-0.5 text-[10px] font-bold text-zinc-400 border border-zinc-800/50">
                        {items.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {items.map((req) => (
                          <RequestCard
                            key={req.id}
                            request={req}
                            onAction={handleAction}
                            onAssign={setAssignTarget}
                          />
                        ))}
                      </AnimatePresence>
                      {items.length === 0 && (
                        <div className="rounded-xl border border-dashed border-zinc-800/60 p-4 text-center text-[10px] text-zinc-600">
                          Empty
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Raise Request Form */}
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-400" />
              Raise New Request
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Submit a maintenance request for any asset</p>
          </div>
          <div className="p-6">
            <RaiseRequestForm assets={assets} onSuccess={loadData} />
          </div>

          {/* Quick stats */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { label: "Pending", value: (requests.Pending || []).length, color: "text-amber-400" },
                { label: "In Progress", value: (requests.InProgress || []).length, color: "text-violet-400" },
                { label: "Resolved", value: (requests.Resolved || []).length, color: "text-teal-400" },
                { label: "Rejected", value: (requests.Rejected || []).length, color: "text-red-400" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-center">
                  <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Assign Technician Modal */}
      <Modal
        isOpen={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        title="Assign Technician"
      >
        {assignTarget && (
          <AssignTechModal
            request={assignTarget}
            technicians={technicians}
            onAssign={handleAssign}
            onClose={() => setAssignTarget(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Maintenance;
