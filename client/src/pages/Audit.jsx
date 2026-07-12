import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck2, AlertTriangle, CheckCircle2, XCircle, HelpCircle,
  Plus, Lock, ChevronDown, ChevronUp, RefreshCw, ClipboardList
} from "lucide-react";

const ITEM_STATUS_CONFIG = {
  Pending:  { label: "Pending",  icon: HelpCircle,   color: "text-zinc-400",   bg: "bg-zinc-800",         border: "border-zinc-700" },
  Verified: { label: "Verified", icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/15",   border: "border-emerald-500/30" },
  Missing:  { label: "Missing",  icon: XCircle,       color: "text-red-400",    bg: "bg-red-500/15",        border: "border-red-500/30" },
  Damaged:  { label: "Damaged",  icon: AlertTriangle, color: "text-amber-400",  bg: "bg-amber-500/15",      border: "border-amber-500/30" },
};

const AuditItemRow = ({ item, cycleStatus, onMark }) => {
  const [loading, setLoading] = useState(null);
  const config = ITEM_STATUS_CONFIG[item.status] || ITEM_STATUS_CONFIG.Pending;
  const Icon = config.icon;
  const locked = cycleStatus === "Closed";

  const handleMark = async (status) => {
    if (locked) return;
    setLoading(status);
    try {
      await onMark(item.id, status);
    } finally {
      setLoading(null);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200 ${config.border} ${config.bg}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon className={`h-4 w-4 flex-shrink-0 ${config.color}`} />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-100 truncate">{item.asset?.name || "Unknown Asset"}</div>
          <div className="text-xs text-zinc-500">{item.asset?.type} · {item.asset?.department}</div>
          {item.notes && <div className="text-xs text-zinc-500 mt-0.5 italic">"{item.notes}"</div>}
        </div>
      </div>

      {!locked ? (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {["Verified", "Missing", "Damaged"].map((s) => (
            <button
              key={s}
              onClick={() => handleMark(s)}
              disabled={!!loading || item.status === s}
              className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide border transition-all disabled:opacity-40 ${
                item.status === s
                  ? s === "Verified"
                    ? "bg-emerald-500/30 border-emerald-500/50 text-emerald-300"
                    : s === "Missing"
                    ? "bg-red-500/30 border-red-500/50 text-red-300"
                    : "bg-amber-500/30 border-amber-500/50 text-amber-300"
                  : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              {loading === s ? "…" : s}
            </button>
          ))}
        </div>
      ) : (
        <span className={`text-xs font-bold ${config.color}`}>{item.status}</span>
      )}
    </motion.div>
  );
};

const CycleCard = ({ cycle, onMarkItem, onClose, defaultOpen }) => {
  const [expanded, setExpanded] = useState(defaultOpen || false);
  const [closing, setClosing] = useState(false);

  const discrepancies = cycle.discrepancies || [];
  const stats = cycle.stats || {};
  const locked = cycle.status === "Closed";

  const handleClose = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Close this audit cycle? Missing assets will be marked Lost. This cannot be undone.")) return;
    setClosing(true);
    try {
      await onClose(cycle.id);
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 ${locked ? "border-zinc-800 bg-zinc-950/50" : "border-zinc-700 bg-zinc-900/40"}`}>
      {/* Cycle Header */}
      <button
        className="w-full flex items-start justify-between p-5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className={`mt-0.5 flex-shrink-0 h-2 w-2 rounded-full ${locked ? "bg-zinc-600" : "bg-emerald-400 shadow-sm shadow-emerald-400/50"}`} />
          <div className="min-w-0">
            <div className="font-bold text-zinc-100 text-sm">{cycle.name}</div>
            <div className="text-xs text-zinc-500 mt-0.5">
              {[cycle.department, cycle.location].filter(Boolean).join(" · ") || "All scope"} ·{" "}
              {new Date(cycle.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              {" – "}
              {new Date(cycle.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
            {/* Progress bar */}
            {stats.total > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="relative h-1.5 w-32 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(((stats.verified || 0) / stats.total) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-500">
                  {stats.verified || 0}/{stats.total} verified
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {/* Stats chips */}
          <div className="hidden sm:flex items-center gap-1.5">
            {stats.discrepancyCount > 0 && (
              <span className="rounded-full bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-300">
                {stats.discrepancyCount} issues
              </span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${locked ? "bg-zinc-800 border-zinc-700 text-zinc-400" : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"}`}>
              {locked ? "Closed" : "Open"}
            </span>
          </div>
          {!locked && (
            <Button size="sm" variant="danger" onClick={handleClose} loading={closing}>
              <Lock className="h-3 w-3 mr-1" />
              Close
            </Button>
          )}
          {expanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
        </div>
      </button>

      {/* Discrepancy Banner */}
      <AnimatePresence>
        {expanded && discrepancies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden px-5"
          >
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 mb-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <AlertTriangle className="h-3.5 w-3.5" />
                {discrepancies.length} discrepanc{discrepancies.length !== 1 ? "ies" : "y"} detected
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {discrepancies.map((item) => (
                  <span key={item.id} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                    item.status === "Missing"
                      ? "bg-red-500/20 border-red-500/30 text-red-300"
                      : "bg-amber-500/20 border-amber-500/30 text-amber-300"
                  }`}>
                    {item.asset?.name} — {item.status}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-2">
              {cycle.items?.length === 0 && (
                <div className="py-8 text-center text-sm text-zinc-600">No items in this audit cycle</div>
              )}
              <AnimatePresence>
                {cycle.items?.map((item) => (
                  <AuditItemRow
                    key={item.id}
                    item={item}
                    cycleStatus={cycle.status}
                    onMark={(itemId, status) => onMarkItem(cycle.id, itemId, status)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CreateCycleForm = ({ assets, onSuccess }) => {
  const [form, setForm] = useState({
    name: "", department: "", location: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    assetIds: []
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filteredAssets = useMemo(() =>
    assets.filter((a) => `${a.name} ${a.type} ${a.department}`.toLowerCase().includes(search.toLowerCase())),
    [assets, search]
  );

  const toggleAsset = (id) =>
    setForm((f) => ({ ...f, assetIds: f.assetIds.includes(id) ? f.assetIds.filter((x) => x !== id) : [...f.assetIds, id] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) return toast.error("Name and dates are required");
    setLoading(true);
    try {
      await api.post("/audit-cycles", form);
      toast.success("Audit cycle created!");
      setForm({ name: "", department: "", location: "", startDate: new Date().toISOString().slice(0, 10), endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), assetIds: [] });
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create cycle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Cycle Name *</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Q3 2026 IT Audit"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Department</label>
          <input
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            placeholder="e.g. Engineering"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Location</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Floor 3"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Start Date *</label>
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none transition" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">End Date *</label>
          <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none transition" required />
        </div>
      </div>

      {/* Asset picker */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-zinc-400">Assets to Audit</label>
          <span className="text-[10px] text-zinc-500">
            {form.assetIds.length ? `${form.assetIds.length} selected` : "Leave empty to auto-scope by dept"}
          </span>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assets…"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition mb-2"
        />
        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 rounded-xl border border-zinc-800 bg-zinc-950/50 p-2">
          {filteredAssets.length === 0 && <div className="text-xs text-zinc-600 text-center py-3">No assets found</div>}
          {filteredAssets.map((asset) => (
            <label key={asset.id} className={`flex items-center gap-2.5 cursor-pointer rounded-lg px-2.5 py-2 transition-all ${
              form.assetIds.includes(asset.id) ? "bg-blue-600/20 border border-blue-500/30" : "hover:bg-zinc-800/60 border border-transparent"
            }`}>
              <input type="checkbox" checked={form.assetIds.includes(asset.id)} onChange={() => toggleAsset(asset.id)} className="accent-blue-500" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-200 truncate">{asset.name}</div>
                <div className="text-[10px] text-zinc-500">{asset.type} · {asset.department}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Create Audit Cycle
      </Button>
    </form>
  );
};

const Audit = () => {
  const [cycles, setCycles] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cyclesRes, assetsRes] = await Promise.all([
        api.get("/audit-cycles"),
        api.get("/assets"),
      ]);
      setCycles(cyclesRes.data.data || []);
      setAssets(assetsRes.data.data?.assets || []);
    } catch {
      toast.error("Failed to load audit data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleMarkItem = async (cycleId, itemId, status) => {
    try {
      await api.patch(`/audit-cycles/${cycleId}/items/${itemId}`, { status });
      toast.success(`Marked as ${status}`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update item");
    }
  };

  const handleCloseCycle = async (cycleId) => {
    try {
      await api.post(`/audit-cycles/${cycleId}/close`);
      toast.success("Audit cycle closed");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to close cycle");
    }
  };

  const globalDiscrepancies = useMemo(
    () => cycles.flatMap((c) => (c.discrepancies || []).map((d) => ({ ...d, cycleName: c.name }))),
    [cycles]
  );

  const filteredCycles = useMemo(() => {
    if (filter === "All") return cycles;
    return cycles.filter((c) => c.status === filter);
  }, [cycles, filter]);

  const openCount = cycles.filter((c) => c.status === "Open").length;
  const closedCount = cycles.filter((c) => c.status === "Closed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Asset Audit</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{openCount} open · {closedCount} closed</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 transition">
            <RefreshCw className="h-4 w-4" />
          </button>
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "primary"}>
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? "Cancel" : "New Cycle"}
          </Button>
        </div>
      </div>

      {/* Global discrepancy banner */}
      <AnimatePresence>
        {globalDiscrepancies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4"
          >
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <AlertTriangle className="h-4 w-4" />
              {globalDiscrepancies.length} open discrepanc{globalDiscrepancies.length !== 1 ? "ies" : "y"} require attention
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {globalDiscrepancies.slice(0, 8).map((d, i) => (
                <span key={`${d.id}-${i}`} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold border ${
                  d.status === "Missing"
                    ? "bg-red-500/20 border-red-500/30 text-red-300"
                    : "bg-amber-500/20 border-amber-500/30 text-amber-300"
                }`}>
                  {d.asset?.name} ({d.status}) · {d.cycleName}
                </span>
              ))}
              {globalDiscrepancies.length > 8 && (
                <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold border bg-zinc-800 border-zinc-700 text-zinc-400">
                  +{globalDiscrepancies.length - 8} more
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Left — Cycle List */}
        <div className="space-y-4">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/30 p-1 w-fit">
            {["All", "Open", "Closed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                  filter === f ? "bg-zinc-700 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 text-zinc-600">Loading cycles…</div>
          ) : filteredCycles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/30 py-16 text-center">
              <ClipboardList className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-600">No audit cycles yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredCycles.map((cycle, i) => (
                  <motion.div key={cycle.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <CycleCard
                      cycle={cycle}
                      onMarkItem={handleMarkItem}
                      onClose={handleCloseCycle}
                      defaultOpen={i === 0 && cycle.status === "Open"}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right — Create Form or Summary */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="p-0 overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-800">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <Plus className="h-4 w-4 text-blue-400" />
                      Create Audit Cycle
                    </h3>
                  </div>
                  <div className="p-6">
                    <CreateCycleForm assets={assets} onSuccess={() => { setShowForm(false); loadData(); }} />
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {/* Summary stats */}
                <Card className="p-5">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileCheck2 className="h-3.5 w-3.5 text-blue-400" />
                    Audit Overview
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Total Cycles", value: cycles.length, color: "text-zinc-200" },
                      { label: "Open", value: openCount, color: "text-emerald-400" },
                      { label: "Discrepancies", value: globalDiscrepancies.length, color: globalDiscrepancies.length > 0 ? "text-red-400" : "text-zinc-400" },
                      { label: "Closed", value: closedCount, color: "text-zinc-500" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-3 text-center">
                        <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                        <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Discrepancy breakdown */}
                {globalDiscrepancies.length > 0 && (
                  <Card className="p-5">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      Discrepancy Details
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {globalDiscrepancies.map((d, i) => (
                        <div key={`${d.id}-${i}`} className={`rounded-xl border px-3 py-2.5 ${
                          d.status === "Missing"
                            ? "border-red-500/20 bg-red-500/10"
                            : "border-amber-500/20 bg-amber-500/10"
                        }`}>
                          <div className="text-xs font-semibold text-zinc-200">{d.asset?.name}</div>
                          <div className="text-[10px] text-zinc-500">{d.status} · {d.cycleName}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Audit;
