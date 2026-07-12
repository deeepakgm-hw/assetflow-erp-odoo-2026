import React, { useState, useEffect, useCallback } from "react";
import activityService from "../services/activityService";
import Badge from "../components/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { Clipboard, ShieldAlert, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await activityService.getAll({
        page,
        limit: 15,
        search: search.trim() || undefined,
      });
      setLogs(res.data?.logs || []);
      setPagination(
        res.data?.pagination || {
          total: 0,
          page: 1,
          limit: 15,
          totalPages: 1,
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to load activity logs.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionColor = (action) => {
    const act = action.toUpperCase();
    if (act.includes("CREATE")) return "success";
    if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("PROMOTE") || act.includes("ASSIGN")) return "warning";
    if (act.includes("DELETE") || act.includes("REMOVE") || act.includes("DEACTIVATE")) return "danger";
    return "neutral";
  };

  return (
    <div className="space-y-6 select-none max-w-5xl mx-auto font-sans pb-10">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-blue-500" />
            <span>Enterprise Audit Ledger</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Immutable chronological logging of all state mutations and administrative adjustments.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Refresh Logs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 bg-zinc-900/30 p-3 rounded-2xl border border-zinc-850">
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </span>
          <input
            type="text"
            placeholder="Search by action or administrator..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-950/80 border border-zinc-800 focus:border-blue-500/50 rounded-xl text-zinc-250 placeholder-zinc-600 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative border-l border-zinc-800 ml-4 pl-6 space-y-6 py-2">
        {loading ? (
          <div className="py-20 flex justify-center -ml-6">
            <span className="h-6 w-6 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="border border-zinc-850/60 rounded-2xl bg-zinc-900/10 p-16 text-center text-zinc-550 -ml-6">
            <Clipboard className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider">No Activity Logged</p>
            <p className="text-xs text-zinc-500 mt-1">Audit log is clean.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <AnimatePresence>
              {logs.map((log) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  key={log.id}
                  className="relative group"
                >
                  {/* Timeline Indicator Dot */}
                  <span className="absolute -left-9 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 border border-zinc-850 text-zinc-500 group-hover:border-zinc-700 transition-colors shadow">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  </span>

                  {/* Log Details Container */}
                  <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-850 hover:border-zinc-800 transition-all duration-300 space-y-2">
                    <div className="flex items-center space-x-3 flex-wrap gap-y-1.5">
                      <p className="text-xs font-bold text-zinc-200 leading-relaxed">
                        {log.action}
                      </p>
                      <Badge variant={getActionColor(log.action)} className="uppercase tracking-wider text-[8px] font-black">
                        {log.entityType}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-zinc-500 font-bold">
                      <span>Operator: {log.user?.name || "System Ledger"}</span>
                      <span>•</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      {log.entityId && (
                        <>
                          <span>•</span>
                          <span className="font-mono">Reference Node: #{log.entityId}</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/20 border border-zinc-850 rounded-2xl">
          <div className="text-xs text-zinc-500 font-medium">
            Showing Page <span className="font-bold text-zinc-300">{pagination.page}</span> of{" "}
            <span className="font-bold text-zinc-300">{pagination.totalPages}</span> ({pagination.total} entries)
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
