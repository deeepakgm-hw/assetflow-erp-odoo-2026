import React, { useState, useEffect } from "react";
import { Cpu, UserCheck, CheckCircle2, AlertOctagon } from "lucide-react";
import { allocationApi } from "../services/allocationApi";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import AllocationForm from "../components/allocation/AllocationForm";
import CurrentHolderCard from "../components/allocation/CurrentHolderCard";
import TransferModal from "../components/allocation/TransferModal";
import AllocationHistory from "../components/allocation/AllocationHistory";

export default function AllocationPage() {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [history, setHistory] = useState([]);
  const [apiConnected, setApiConnected] = useState(false);

  // Form State
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadData = async () => {
    try {
      const [assetData, employeeData, historyData] = await Promise.all([
        allocationApi.fetchAssets(),
        allocationApi.fetchEmployees(),
        allocationApi.fetchHistory()
      ]);
      setAssets(assetData);
      setEmployees(employeeData);
      setHistory(historyData);
      setApiConnected(true);
    } catch (error) {
      console.warn("Using mock allocation data because API is unavailable:", error.message);
      setAssets(allocationApi.getAssets() || []);
      setEmployees(allocationApi.getEmployees() || []);
      setHistory(allocationApi.getHistory() || []);
      setApiConnected(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAllocate = async (assetId, employeeId, returnDate) => {
    try {
      setActionError("");
      const res = apiConnected
        ? await allocationApi.allocateAssetRemote(assetId, employeeId, returnDate)
        : allocationApi.allocateAsset(assetId, employeeId, returnDate);
      if (res.success) {
        setSelectedAssetId("");
        setSelectedEmployeeId("");
        loadData();
      } else {
        setActionError(res.message || "Unable to allocate asset.");
      }
    } catch (error) {
      setActionError(error.message || "Unable to allocate asset.");
    }
  };

  const handleTransferSubmit = async (transferDetails) => {
    try {
      setActionError("");
      const res = apiConnected
        ? await allocationApi.createTransferRequestRemote(
          transferDetails.assetId,
          transferDetails.fromEmployeeId,
          transferDetails.toEmployeeId,
          transferDetails.reason,
          transferDetails.priority
        )
        : allocationApi.createTransferRequest(
        transferDetails.assetId,
        transferDetails.fromEmployeeId,
        transferDetails.toEmployeeId,
        transferDetails.reason,
        transferDetails.priority
      );
      if (res.success) {
        setTransferModalOpen(false);
        setSelectedAssetId("");
        setSelectedEmployeeId("");
        loadData();
      } else {
        setActionError(res.message || "Unable to submit transfer request.");
      }
    } catch (error) {
      setActionError(error.message || "Unable to submit transfer request.");
    }
  };

  // Calculations for KPI Cards
  const totalCount = assets.length;
  const allocatedCount = assets.filter(a => a.status === "Allocated" || a.status === "Overdue").length;
  const availableCount = assets.filter(a => a.status === "Available").length;
  const overdueCount = assets.filter(a => a.status === "Overdue").length;

  const activeSelectedAsset = assets.find(a => a.id === selectedAssetId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Allocation & Transfer"
        subtitle="Manage checkout assignments, returns, and inter-employee equipment rerouting requests."
      />

      {actionError && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
          {actionError}
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Hardware Assets"
          value={totalCount}
          icon={Cpu}
          color="primary"
        />
        <StatCard
          title="Allocated Units"
          value={allocatedCount}
          icon={UserCheck}
          color="primary"
        />
        <StatCard
          title="Available In Warehouse"
          value={availableCount}
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          title="Overdue Returns"
          value={overdueCount}
          icon={AlertOctagon}
          color={overdueCount > 0 ? "danger" : "neutral"}
          trend={overdueCount > 0 ? "Urgent return needed" : "Healthy"}
          trendType={overdueCount > 0 ? "down" : "up"}
        />
      </div>

      {/* Checkout Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Form */}
        <div className="lg:col-span-1">
          <AllocationForm
            assets={assets}
            employees={employees}
            selectedAssetId={selectedAssetId}
            setSelectedAssetId={setSelectedAssetId}
            selectedEmployeeId={selectedEmployeeId}
            setSelectedEmployeeId={setSelectedEmployeeId}
            expectedReturnDate={expectedReturnDate}
            setExpectedReturnDate={setExpectedReturnDate}
            onAllocate={handleAllocate}
          />
        </div>

        {/* Right Side: Warning Detail Card */}
        <div className="lg:col-span-2 space-y-4">
          {activeSelectedAsset && activeSelectedAsset.status !== "Available" ? (
            <CurrentHolderCard
              asset={activeSelectedAsset}
              employees={employees}
              onTransferRequest={() => setTransferModalOpen(true)}
            />
          ) : (
            <div className="p-12 border border-slate-800/60 bg-slate-900/10 rounded-xl flex flex-col items-center justify-center text-center text-slate-500 text-xs gap-2.5 h-full">
              <Cpu className="w-10 h-10 text-slate-700" />
              <div>
                <span className="font-bold text-slate-400 block">Asset Allocation Panel</span>
                <p className="max-w-xs mt-1 text-slate-500 leading-normal">
                  Select an asset on the form. If it is already allocated, details of the current checkout holder and a transfer request action will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: History Logs */}
      <div>
        <AllocationHistory historyList={history} />
      </div>

      {/* Transfer Request Modal */}
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        asset={activeSelectedAsset}
        employees={employees}
        onSubmit={handleTransferSubmit}
      />
    </div>
  );
}
