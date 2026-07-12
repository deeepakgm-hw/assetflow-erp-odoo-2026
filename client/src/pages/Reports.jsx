import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  BarChart3, Download, RefreshCw, TrendingUp, AlertTriangle,
  Activity, Zap, Clock, Archive
} from "lucide-react";

const PALETTE = ["#60a5fa", "#34d399", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4", "#ec4899"];

const DARK_TOOLTIP = {
  contentStyle: {
    backgroundColor: "#18181b",
    border: "1px solid #3f3f46",
    borderRadius: "12px",
    color: "#e4e4e7",
    fontSize: "12px",
  },
  cursor: { fill: "rgba(255,255,255,0.04)" },
};

const EXPORT_TYPES = [
  { key: "utilizationByDepartment", label: "Utilization" },
  { key: "maintenanceFrequency",    label: "Maintenance Freq" },
  { key: "dueForMaintenanceOrRetirement", label: "Due Assets" },
  { key: "mostUsedIdleAssets",      label: "Used/Idle" },
  { key: "bookingHeatmap",          label: "Heatmap" },
];

// Heatmap grid: day × hour cells
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 12 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

const HeatmapGrid = ({ data }) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const lookup = Object.fromEntries(data.map((d) => [d.name, d.value]));

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Hour headers */}
        <div className="flex items-center gap-1 mb-2 ml-10">
          {HOURS.map((h) => (
            <div key={h} className="w-9 flex-shrink-0 text-[9px] text-zinc-600 text-center font-mono">{h}</div>
          ))}
        </div>
        {/* Day rows */}
        {DAYS.map((day) => (
          <div key={day} className="flex items-center gap-1 mb-1">
            <div className="w-8 flex-shrink-0 text-[10px] text-zinc-500 font-semibold">{day}</div>
            {HOURS.map((h) => {
              const key = `${day}-${h}`;
              const val = lookup[key] || 0;
              const intensity = val / maxVal;
              return (
                <div
                  key={h}
                  title={`${key}: ${val} booking${val !== 1 ? "s" : ""}`}
                  className="w-9 h-7 flex-shrink-0 rounded-md transition-all duration-200 cursor-default"
                  style={{
                    backgroundColor: val === 0
                      ? "rgba(39,39,42,0.6)"
                      : `rgba(96,165,250,${0.15 + intensity * 0.85})`,
                    border: val > 0 ? "1px solid rgba(96,165,250,0.2)" : "1px solid rgba(63,63,70,0.4)",
                  }}
                />
              );
            })}
          </div>
        ))}
        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 ml-10">
          <span className="text-[10px] text-zinc-600">Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <div key={v} className="w-5 h-4 rounded-sm" style={{ backgroundColor: `rgba(96,165,250,${0.15 + v * 0.85})` }} />
          ))}
          <span className="text-[10px] text-zinc-600">More</span>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color = "text-blue-400" }) => (
  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 flex items-center gap-3">
    <div className={`flex-shrink-0 rounded-lg p-2 bg-zinc-800 ${color}`}>
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <div className="text-xl font-black text-zinc-100">{value}</div>
      <div className="text-[11px] text-zinc-500 font-semibold">{label}</div>
      {sub && <div className="text-[10px] text-zinc-600 mt-0.5">{sub}</div>}
    </div>
  </div>
);

const Reports = () => {
  const [utilization, setUtilization]   = useState([]);
  const [maintenance, setMaintenance]   = useState({ byAsset: [], byCategory: [] });
  const [assetUsage, setAssetUsage]     = useState({ mostUsed: [], idle: [] });
  const [due, setDue]                   = useState({ maintenance: [], retirement: [] });
  const [heatmap, setHeatmap]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [exporting, setExporting]       = useState(null);
  const [exportType, setExportType]     = useState("utilizationByDepartment");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [utilRes, maintRes, assetRes, dueRes, heatRes] = await Promise.all([
        api.get("/reports/utilization-by-department"),
        api.get("/reports/maintenance-frequency"),
        api.get("/reports/most-used-idle-assets"),
        api.get("/reports/due-for-maintenance-or-retirement"),
        api.get("/reports/booking-heatmap"),
      ]);
      setUtilization(utilRes.data.data || []);
      setMaintenance(maintRes.data.data || { byAsset: [], byCategory: [] });
      setAssetUsage(assetRes.data.data || { mostUsed: [], idle: [] });
      setDue(dueRes.data.data || { maintenance: [], retirement: [] });
      setHeatmap(heatRes.data.data || []);
    } catch {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleExport = async () => {
    setExporting(exportType);
    try {
      const res = await api.get("/reports/export", {
        params: { type: exportType },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `assetflow-${exportType}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("CSV exported!");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(null);
    }
  };

  const totalAssets  = utilization.reduce((s, d) => s + d.total, 0);
  const totalInUse   = utilization.reduce((s, d) => s + d.inUse, 0);
  const totalDue     = due.maintenance.length + due.retirement.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Reports &amp; Analytics</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Live data from AssetFlow ERP records</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={loadData} className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 transition">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 transition"
          >
            {EXPORT_TYPES.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
          <Button onClick={handleExport} loading={!!exporting} variant="secondary" size="md">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Archive}       label="Total Assets"       value={totalAssets}               color="text-blue-400" />
        <StatCard icon={Activity}      label="In Use"             value={totalInUse}                color="text-emerald-400" sub={`${totalAssets ? Math.round((totalInUse/totalAssets)*100) : 0}% utilization`} />
        <StatCard icon={TrendingUp}    label="Maintenance Reqs"   value={maintenance.byAsset.reduce((s,x)=>s+x.count,0)}  color="text-violet-400" />
        <StatCard icon={AlertTriangle} label="Due / Retired"      value={totalDue}                  color={totalDue > 0 ? "text-red-400" : "text-zinc-500"} />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Utilization by Department */}
        <Card className="p-5">
          <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            Utilization by Department
          </h4>
          {utilization.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-zinc-600 text-sm">No data</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilization} margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="department" tick={{ fill: "#71717a", fontSize: 10 }} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fill: "#71717a", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip {...DARK_TOOLTIP} />
                  <Legend wrapperStyle={{ fontSize: "11px", color: "#a1a1aa" }} />
                  <Bar dataKey="available" name="Available" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inUse" name="In Use" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="underMaintenance" name="Maintenance" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Maintenance frequency by category */}
        <Card className="p-5">
          <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-violet-400" />
            Maintenance Frequency by Category
          </h4>
          {maintenance.byCategory.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-zinc-600 text-sm">No maintenance data</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={maintenance.byCategory}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={44}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                    labelLine={{ stroke: "#52525b", strokeWidth: 1 }}
                  >
                    {maintenance.byCategory.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...DARK_TOOLTIP} formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Charts row 2 — top assets by maintenance + bar */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Top Assets by Maintenance Count
          </h4>
          {maintenance.byAsset.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">No data</div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenance.byAsset.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#71717a", fontSize: 10 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} width={100} />
                  <Tooltip {...DARK_TOOLTIP} />
                  <Bar dataKey="count" name="Requests" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                    {maintenance.byAsset.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Most Used vs Idle */}
        <Card className="p-5">
          <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-teal-400" />
            Most Used &amp; Idle Assets
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-2">Most Used</p>
              <div className="space-y-1.5">
                {assetUsage.mostUsed.length === 0 && (
                  <p className="text-xs text-zinc-600">None recorded</p>
                )}
                {assetUsage.mostUsed.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-2">
                    <span className="text-[10px] font-black text-zinc-600 w-4">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-zinc-200 truncate">{a.name}</div>
                      <div className="text-[10px] text-zinc-500">{a.usageScore} allocation{a.usageScore !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-2">Idle Assets</p>
              <div className="space-y-1.5">
                {assetUsage.idle.length === 0 && (
                  <p className="text-xs text-zinc-600">None idle</p>
                )}
                {assetUsage.idle.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-zinc-400 truncate">{a.name}</div>
                      <div className="text-[10px] text-zinc-600">{a.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Due for maintenance / retirement */}
      <Card className="p-5">
        <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-red-400" />
          Due for Maintenance / Retirement
          {totalDue > 0 && (
            <span className="ml-auto rounded-full bg-red-500/20 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold text-red-300">
              {totalDue} item{totalDue !== 1 ? "s" : ""}
            </span>
          )}
        </h4>
        {totalDue === 0 ? (
          <div className="py-10 text-center text-sm text-zinc-600">All assets are in good standing ✓</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-2">Needs Maintenance ({due.maintenance.length})</p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {due.maintenance.map((item) => (
                  <div key={`maint-${item.requestId}`} className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
                    <div className="text-xs font-semibold text-zinc-200">{item.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      {item.type} · {item.department} · <span className="font-semibold text-amber-400">{item.status}</span>
                      {" · "}<span className="capitalize">{item.priority}</span> priority
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide mb-2">Retired / Lost ({due.retirement.length})</p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {due.retirement.map((item) => (
                  <div key={`ret-${item.id}`} className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                    <div className="text-xs font-semibold text-zinc-200">{item.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      {item.type} · {item.department} · <span className="font-semibold text-red-400">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Booking Heatmap */}
      <Card className="p-5">
        <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2 mb-5">
          <BarChart3 className="h-4 w-4 text-cyan-400" />
          Booking Heatmap — Peak Usage (by Day &amp; Hour)
        </h4>
        {heatmap.length === 0 ? (
          <div className="py-10 text-center text-sm text-zinc-600">No booking data available</div>
        ) : (
          <HeatmapGrid data={heatmap} />
        )}
      </Card>
    </div>
  );
};

export default Reports;
