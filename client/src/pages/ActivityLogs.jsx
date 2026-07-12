import React, { useState, useEffect, useCallback } from "react";
import activityService from "../services/activityService";
import Button from "../components/Button";
import Badge from "../components/Badge";
import SearchBar from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
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
    <div className="space-y-6 select-none max-w-4xl">
      {/* Title */}
      <div>
        <h3 className="text-xl font-bold text-zinc-100">Audit Trail Logs</h3>
        <p className="text-sm text-zinc-400 mt-1">
          Chronological record of admin actions, organization changes, and asset activities.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by action or user name..."
          className="max-w-xs"
        />
      </div>

      {/* Timeline List */}
      <div className="relative border-l border-zinc-800 ml-4 pl-6 space-y-8 py-2">
        {loading ? (
          <div className="py-20 flex justify-center -ml-6">
            <LoadingSpinner size="md" />
          </div>
        ) : logs.length === 0 ? (
          <div className="border border-zinc-800/80 rounded-xl bg-zinc-900/10 p-12 text-center text-zinc-500 font-medium -ml-6">
            <ClipboardDocumentIcon className="h-10 w-10 text-zinc-650 mx-auto mb-3" />
            <p className="text-sm">No activity logs recorded.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="relative group">
              {/* Timeline Indicator Dot */}
              <span className="absolute -left-9 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-zinc-500 group-hover:border-zinc-700 transition-colors">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500/80" />
              </span>

              {/* Log Details Container */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3 flex-wrap gap-y-1.5">
                  <p className="text-sm text-zinc-200 font-semibold leading-relaxed">
                    {log.action}
                  </p>
                  <Badge variant={getActionColor(log.action)} className="uppercase tracking-wider">
                    {log.entityType}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-xs text-zinc-500 font-semibold">
                  <span>By {log.user?.name || "System User"}</span>
                  <span>•</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                  {log.entityId && (
                    <>
                      <span>•</span>
                      <span className="font-mono">ID: {log.entityId}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/40">
          <div className="text-xs text-zinc-400">
            Showing Page <span className="font-semibold text-zinc-200">{pagination.page}</span> of{" "}
            <span className="font-semibold text-zinc-200">{pagination.totalPages}</span> (Total{" "}
            <span className="font-semibold text-zinc-200">{pagination.total}</span> logs)
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
