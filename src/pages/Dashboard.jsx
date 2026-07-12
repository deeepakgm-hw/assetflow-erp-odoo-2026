import React, { useState, useEffect, useCallback } from "react";
import { 
  Cpu, 
  UserCheck, 
  Wrench, 
  CalendarDays, 
  RefreshCw, 
  AlertTriangle, 
  ArrowRight, 
  Check, 
  X, 
  Inbox,
  Info
} from "lucide-react";
import { allocationApi } from "../services/allocationApi";
import { bookingApi } from "../services/bookingApi";
import StatCard from "../components/common/StatCard";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [history, setHistory] = useState([]);
  const [apiConnected, setApiConnected] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [assetData, bookingData, transferData, historyData] = await Promise.all([
        allocationApi.fetchAssets(),
        bookingApi.fetchBookings(),
        allocationApi.fetchTransfers(),
        allocationApi.fetchHistory()
      ]);

      setAssets(assetData || []);
      setBookings(bookingData || []);
      setTransfers(transferData || []);
      setHistory(historyData || []);
      setApiConnected(true);
    } catch (error) {
      console.warn("Using mock dashboard data because API is unavailable:", error.message);
      setAssets(allocationApi.getAssets() || []);
      setBookings(bookingApi.getBookings() || []);
      setTransfers(allocationApi.getTransfers() || []);
      setHistory(allocationApi.getHistory() || []);
      setApiConnected(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle Transfer Actions
  const handleApproveTransfer = async (id) => {
    try {
      setActionError("");
      if (apiConnected) {
        await allocationApi.approveTransferRemote(id);
      } else {
        allocationApi.approveTransfer(id);
      }
      loadData();
    } catch (error) {
      setActionError(error.message || "Unable to approve transfer.");
    }
  };

  const handleRejectTransfer = async (id) => {
    try {
      setActionError("");
      if (apiConnected) {
        await allocationApi.rejectTransferRemote(id);
      } else {
        allocationApi.rejectTransfer(id);
      }
      loadData();
    } catch (error) {
      setActionError(error.message || "Unable to reject transfer.");
    }
  };

  // Calculations
  const availableCount = assets.filter(a => a.status === "Available").length;
  const allocatedCount = assets.filter(a => a.status === "Allocated").length;
  const overdueCount = assets.filter(a => a.status === "Overdue").length;
  const maintenanceCount = assets.filter(a => a.status === "Maintenance").length;
  const activeBookingsCount = bookings.filter(b => b.status === "Upcoming" || b.status === "Ongoing").length;
  const pendingTransfersCount = transfers.filter(t => t.status === "Pending").length;

  // Filter pending transfers
  const pendingTransfersList = transfers.filter(t => t.status === "Pending").slice(0, 3);

  // Combine history + bookings + transfers into a chronological activity feed
  const getActivityFeed = () => {
    const feed = [];
    
    // Add allocations
    history.forEach(h => {
      feed.push({
        id: `FEED-ALLOC-${h.id}`,
        title: h.status === "Returned" ? "Asset Checked In" : "Asset Checked Out",
        description: h.status === "Returned" 
          ? `${h.assetName} returned by ${h.employeeName}.`
          : `${h.assetName} allocated to ${h.employeeName} (${h.department}).`,
        time: h.allocatedDate,
        type: h.status === "Returned" ? "info" : "success"
      });
    });

    // Add bookings
    bookings.slice(0, 5).forEach(b => {
      feed.push({
        id: `FEED-BKG-${b.id}`,
        title: "Resource Reserved",
        description: `${b.employeeName} booked slot (${b.startTime}-${b.endTime}) for ${b.purpose}.`,
        time: b.date,
        type: b.status === "Cancelled" ? "danger" : "primary"
      });
    });

    // Sort by "time" descending (simplified, since date strings are ISO format)
    return feed.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);
  };

  const activityFeed = getActivityFeed();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Enterprise Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time status overview of resources, allocations, and scheduling conflict resolutions.</p>
      </div>

      {actionError && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
          {actionError}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Assets Available"
          value={availableCount}
          icon={Cpu}
          color="success"
          description="In warehouse storage"
        />
        <StatCard
          title="Allocated Assets"
          value={allocatedCount}
          icon={UserCheck}
          color="primary"
          description="In active deployment"
        />
        <StatCard
          title="Returns Overdue"
          value={overdueCount}
          icon={AlertTriangle}
          color="danger"
          trend={overdueCount > 0 ? `${overdueCount} Alerts` : "Clean"}
          trendType={overdueCount > 0 ? "down" : "up"}
          description="Requires followup"
        />
        <StatCard
          title="In Maintenance"
          value={maintenanceCount}
          icon={Wrench}
          color="warning"
          description="In hardware service"
        />
        <StatCard
          title="Active Bookings"
          value={activeBookingsCount}
          icon={CalendarDays}
          color="primary"
          description="Scheduled for today"
        />
        <StatCard
          title="Pending Transfers"
          value={pendingTransfersCount}
          icon={RefreshCw}
          color="warning"
          trend={pendingTransfersCount > 0 ? "Action Required" : "No queue"}
          trendType={pendingTransfersCount > 0 ? "neutral" : "up"}
          description="Inter-employee swaps"
        />
      </div>

      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Curvy Area Chart (Allocations volume) */}
        <Card title="Allocation Activity Volume" subtitle="Monthly hardware checkout transactions" className="lg:col-span-2">
          <div className="h-64 flex flex-col justify-between">
            {/* SVG Area Chart */}
            <div className="flex-1 w-full relative mt-4">
              <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Guides */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="0" y1="160" x2="500" y2="160" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />

                {/* Glow Area */}
                <path
                  d="M 0 160 C 50 150, 100 80, 150 110 C 200 130, 250 50, 300 40 C 350 30, 400 140, 450 100 C 475 80, 500 90, 500 90 L 500 200 L 0 200 Z"
                  fill="url(#areaGlow)"
                />

                {/* Curvy Path Line */}
                <path
                  d="M 0 160 C 50 150, 100 80, 150 110 C 200 130, 250 50, 300 40 C 350 30, 400 140, 450 100 C 475 80, 500 90, 500 90"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
                <circle cx="150" cy="110" r="4.5" fill="#2563EB" stroke="#0F172A" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
                <circle cx="300" cy="40" r="4.5" fill="#2563EB" stroke="#0F172A" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
                <circle cx="450" cy="100" r="4.5" fill="#2563EB" stroke="#0F172A" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
              </svg>
            </div>
            
            {/* Labels */}
            <div className="flex justify-between items-center text-[10px] text-slate-550 font-semibold px-1 mt-2">
              <span>FEB</span>
              <span>MAR</span>
              <span>APR</span>
              <span>MAY</span>
              <span>JUN</span>
              <span>JUL (ACTIVE)</span>
            </div>
          </div>
        </Card>

        {/* Bar Chart (Resource utilization distribution) */}
        <Card title="Resource Popularity Index" subtitle="Monthly utilization percentage distribution">
          <div className="h-64 flex flex-col justify-between">
            <div className="space-y-4 mt-2">
              {/* Progress bars */}
              <div>
                <div className="flex justify-between text-xs text-slate-350 mb-1">
                  <span className="font-semibold text-slate-200">Boardroom Alpha</span>
                  <span className="font-mono text-blue-400 font-bold">78%</span>
                </div>
                <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: "78%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-350 mb-1">
                  <span className="font-semibold text-slate-200">Meeting Room Beta</span>
                  <span className="font-mono text-emerald-450 font-bold">62%</span>
                </div>
                <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "62%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-350 mb-1">
                  <span className="font-semibold text-slate-200">Tesla Model Y</span>
                  <span className="font-mono text-indigo-400 font-bold">45%</span>
                </div>
                <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-350 mb-1">
                  <span className="font-semibold text-slate-200">Quest 3 VR Headset</span>
                  <span className="font-mono text-amber-450 font-bold">30%</span>
                </div>
                <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "30%" }} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Rerouting requests & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Transfer Approvals Console */}
        <Card title="Transfer Approvals Queue" subtitle="Approve/reject equipment swaps between employees.">
          {pendingTransfersList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 text-xs gap-2">
              <Inbox className="w-8 h-8 text-slate-700" />
              <span>Queue clear. No pending transfers.</span>
            </div>
          ) : (
            <div className="space-y-3.5">
              {pendingTransfersList.map((trf) => (
                <div 
                  key={trf.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/30 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{trf.assetName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({trf.assetId})</span>
                    </div>
                    
                    {/* Routing */}
                    <div className="flex items-center gap-2 mt-2 text-slate-350">
                      <span className="font-semibold text-slate-400">{trf.fromEmployeeName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-semibold text-blue-400">{trf.toEmployeeName}</span>
                    </div>
                    
                    <p className="text-slate-450 italic mt-1.5 line-clamp-1">"{trf.reason}"</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      variant="success" 
                      size="sm" 
                      onClick={() => handleApproveTransfer(trf.id)} 
                      icon={Check} 
                      className="py-1 px-2.5"
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleRejectTransfer(trf.id)} 
                      icon={X} 
                      className="py-1 px-2.5"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Live System Activity Feed */}
        <Card title="Workspace Activity Stream" subtitle="Chronological audit trail of hardware and room operations.">
          <div className="flow-root">
            <ul className="-mb-8">
              {activityFeed.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activityFeed.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-850" aria-hidden="true" />
                    ) : null}
                    
                    <div className="relative flex space-x-3.5">
                      <div>
                        <span className={`
                          h-8 w-8 rounded-lg flex items-center justify-center border text-xs
                          ${activity.type === "success" ? "bg-emerald-650/10 text-emerald-450 border-emerald-500/20" : ""}
                          ${activity.type === "info" ? "bg-blue-650/10 text-blue-400 border-blue-500/20" : ""}
                          ${activity.type === "danger" ? "bg-rose-650/10 text-rose-450 border-rose-500/20" : ""}
                          ${activity.type === "primary" ? "bg-indigo-650/10 text-indigo-400 border-indigo-500/20" : ""}
                        `}>
                          <Info className="w-4 h-4" />
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between text-xs">
                          <p className="font-bold text-slate-200">{activity.title}</p>
                          <span className="text-[10px] text-slate-500">{activity.time}</span>
                        </div>
                        <p className="text-slate-400 mt-1 leading-normal text-xs">{activity.description}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>

      </div>
    </div>
  );
}
