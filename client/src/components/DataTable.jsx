import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import Button from "./Button";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const DataTable = ({
  columns,
  data = [],
  loading = false,
  pagination,
  onPageChange,
  emptyMessage = "No records found",
}) => {
  const { page = 1, totalPages = 1, total = 0 } = pagination || {};

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      {/* Table Container */}
      <div className="flex-1 overflow-auto border border-zinc-800/80 rounded-xl bg-zinc-900/20 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 select-none ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20">
                  <LoadingSpinner size="md" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-20 text-center text-sm font-medium text-zinc-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-zinc-800/20 transition-colors duration-150"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-6 py-4 text-sm font-medium text-zinc-300 ${col.className || ""}`}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/50 mt-4 select-none">
          <div className="text-xs text-zinc-400">
            Showing Page <span className="font-semibold text-zinc-200">{page}</span> of{" "}
            <span className="font-semibold text-zinc-200">{totalPages}</span> (Total{" "}
            <span className="font-semibold text-zinc-200">{total}</span> items)
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
