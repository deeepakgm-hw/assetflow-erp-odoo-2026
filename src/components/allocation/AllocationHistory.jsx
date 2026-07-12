import React, { useState } from "react";
import Card from "../common/Card";
import SearchBar from "../common/SearchBar";
import Select from "../common/Select";
import AllocationStatusBadge from "./AllocationStatusBadge";
import Button from "../common/Button";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";

export default function AllocationHistory({ historyList = [] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchClear = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  // Filter history list
  const filteredHistory = historyList.filter(item => {
    const matchesSearch = 
      item.assetName.toLowerCase().includes(search.toLowerCase()) ||
      item.assetId.toLowerCase().includes(search.toLowerCase()) ||
      item.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = filterStatus === "" || item.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Paginate list
  const totalItems = filteredHistory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

  const statusOptions = [
    { value: "Allocated", label: "Allocated" },
    { value: "Returned", label: "Returned" },
    { value: "Overdue", label: "Overdue" }
  ];

  return (
    <Card title="Allocation History Logs" subtitle="Historical audit records of asset assignments.">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-5">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          onClear={handleSearchClear}
          placeholder="Search by asset, employee, department..."
          className="w-full md:max-w-md"
        />
        
        <Select
          options={statusOptions}
          value={filterStatus}
          onChange={handleFilterChange}
          placeholder="All Statuses"
          containerClassName="w-full md:w-48"
        />
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto w-full border border-slate-700/50 rounded-lg bg-slate-900/10">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-750 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Asset</th>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Allocated Date</th>
              <th className="py-3 px-4">Returned Date</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-8 h-8 text-slate-650" />
                    <span>No allocation records match the filter criteria.</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-200 block">{item.assetName}</span>
                    <span className="text-[10px] text-slate-500">{item.assetId}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-250 font-medium">{item.employeeName}</td>
                  <td className="py-3.5 px-4 text-slate-400">{item.department}</td>
                  <td className="py-3.5 px-4">{item.allocatedDate}</td>
                  <td className="py-3.5 px-4">{item.returnedDate || <span className="text-slate-600">—</span>}</td>
                  <td className="py-3.5 px-4">
                    <AllocationStatusBadge status={item.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-700/20 text-xs text-slate-450">
          <span>
            Showing <strong className="text-slate-300">{startIndex + 1}</strong> to{" "}
            <strong className="text-slate-300">
              {Math.min(startIndex + itemsPerPage, totalItems)}
            </strong>{" "}
            of <strong className="text-slate-300">{totalItems}</strong> records
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              icon={ChevronLeft}
            />
            <span className="px-3 font-semibold text-slate-350">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              icon={ChevronRight}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
