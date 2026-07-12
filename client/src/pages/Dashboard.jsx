import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import departmentService from "../services/departmentService";
import categoryService from "../services/categoryService";
import employeeService from "../services/employeeService";
import activityService from "../services/activityService";
import dashboardService from "../services/dashboardService";
import RegisterAssetModal from "../components/RegisterAssetModal";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import toast from "react-hot-toast";
import {
  UsersIcon,
  Squares2X2Icon,
  TagIcon,
  ClipboardDocumentIcon,
  PlusIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  BriefcaseIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

// Chart.js imports
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    categories: 0,
    activities: 0,
  });

  // KPI States
  const [kpis, setKpis] = useState({
    assetsAvailable: 0,
    assetsAllocated: 0,
    maintenanceToday: 0,
    activeBookings: 0,
    pendingTransfers: 0,
    upcomingReturns: 0,
  });

  const [overdueAssets, setOverdueAssets] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const [chartData, setChartData] = useState({
    departments: { labels: [], datasets: [] },
    categories: { labels: [], datasets: [] },
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch each API with fallbacks to avoid page crashes if some models don't exist yet
      const [deptRes, catRes, empRes, actRes, kpiRes, overdueRes] = await Promise.all([
        departmentService.getAll().catch(() => ({ data: [] })),
        categoryService.getAll().catch(() => ({ data: [] })),
        employeeService.getAll({ limit: 100 }).catch(() => ({ data: { employees: [] } })),
        activityService.getAll({ limit: 5 }).catch(() => ({ data: { logs: [] } })),
        dashboardService.getKPIs().catch(() => ({
          assetsAvailable: 0,
          assetsAllocated: 0,
          maintenanceToday: 0,
          activeBookings: 0,
          pendingTransfers: 0,
          upcomingReturns: 0,
        })),
        dashboardService.getOverdue().catch(() => ({ data: { assets: [] } })),
      ]);

      const depts = deptRes.data || [];
      const cats = catRes.data || [];
      const emps = empRes.data?.employees || [];
      const logs = actRes.data?.logs || [];
      
      // Support nested API layouts
      const kpiData = kpiRes.data || kpiRes || {};
      const overdueData = overdueRes.data?.assets || overdueRes.data || [];

      setStats({
        departments: depts.length,
        categories: cats.length,
        employees: empRes.data?.pagination?.total || emps.length,
        activities: actRes.data?.pagination?.total || logs.length,
      });

      setKpis({
        assetsAvailable: kpiData.assetsAvailable || 0,
        assetsAllocated: kpiData.assetsAllocated || 0,
        maintenanceToday: kpiData.maintenanceToday || 0,
        activeBookings: kpiData.activeBookings || 0,
        pendingTransfers: kpiData.pendingTransfers || 0,
        upcomingReturns: kpiData.upcomingReturns || 0,
      });

      setOverdueAssets(overdueData);
      setRecentLogs(logs);

      // Process Chart Data: Employees by Department
      const deptCounts = {};
      depts.forEach((d) => {
        deptCounts[d.name] = 0;
      });
      emps.forEach((emp) => {
        const deptName = emp.department?.name || "Unassigned";
        deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
      });

      const deptLabels = Object.keys(deptCounts);
      const deptValues = Object.values(deptCounts);

      // Process Chart Data: Custom fields count per Category
      const catLabels = cats.map((c) => c.name);
      const catValues = cats.map((c) => {
        if (!c.customFields) return 0;
        try {
          const parsed = typeof c.customFields === "string" ? JSON.parse(c.customFields) : c.customFields;
          return Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
        } catch {
          return 0;
        }
      });

      setChartData({
        departments: {
          labels: deptLabels,
          datasets: [
            {
              label: "Employees Count",
              data: deptValues,
              backgroundColor: "rgba(37, 99, 235, 0.4)",
              borderColor: "rgba(37, 99, 235, 1)",
              borderWidth: 1.5,
              borderRadius: 6,
            },
          ],
        },
        categories: {
          labels: catLabels,
          datasets: [
            {
              label: "Metadata Fields Configured",
              data: catValues,
              backgroundColor: [
                "rgba(16, 185, 129, 0.4)",
                "rgba(245, 158, 11, 0.4)",
                "rgba(139, 92, 246, 0.4)",
                "rgba(236, 72, 153, 0.4)",
                "rgba(59, 130, 246, 0.4)",
              ],
              borderColor: [
                "rgba(16, 185, 129, 1)",
                "rgba(245, 158, 11, 1)",
                "rgba(139, 92, 246, 1)",
                "rgba(236, 72, 153, 1)",
                "rgba(59, 130, 246, 1)",
              ],
              borderWidth: 1.5,
            },
          ],
        },
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Connect to Socket.io to receive live updates
  const socket = useSocket(user?.id);

  useEffect(() => {
    if (!socket) return;

    const handleDashboardRefresh = (payload) => {
      console.log("Real-time dashboard update event received:", payload);
      fetchDashboardData();
    };

    socket.on("dashboard_update", handleDashboardRefresh);
    socket.on("activity_logged", handleDashboardRefresh);

    return () => {
      socket.off("dashboard_update", handleDashboardRefresh);
      socket.off("activity_logged", handleDashboardRefresh);
    };
  }, [socket, fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 6 Custom Asset-related KPI cards configuration
  const assetKpis = [
    {
      name: "Assets Available",
      value: kpis.assetsAvailable,
      icon: BriefcaseIcon,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      name: "Assets Allocated",
      value: kpis.assetsAllocated,
      icon: UserIcon,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      name: "Maintenance Today",
      value: kpis.maintenanceToday,
      icon: WrenchScrewdriverIcon,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      name: "Active Bookings",
      value: kpis.activeBookings,
      icon: CalendarDaysIcon,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      name: "Pending Transfers",
      value: kpis.pendingTransfers,
      icon: ArrowPathIcon,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
    },
    {
      name: "Upcoming Returns",
      value: kpis.upcomingReturns,
      icon: ClockIcon,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-100 flex items-center space-x-2">
            <span>Asset & Resource Control Panel</span>
            <SparklesIcon className="h-5 w-5 text-blue-500 animate-pulse" />
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time control over asset registry, inventory tracking, scheduled maintenance, and resource bookings.
          </p>
        </div>
      </div>

      {/* Overdue Banner Warning */}
      {overdueAssets.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-red-500/20 rounded-lg text-red-400">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider">Overdue Asset Returns Detected</p>
              <p className="text-xs text-red-300 mt-0.5">
                You have {overdueAssets.length} asset allocation(s) exceeding their expected return schedules.
              </p>
            </div>
          </div>
          <Link
            to="/assets"
            className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:underline"
          >
            <span>Review Overdue list</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Asset KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {assetKpis.map((stat, idx) => (
          <Card
            key={idx}
            className={`border ${stat.border} hover:scale-[1.02] hover:shadow-xl hover:shadow-zinc-950/40 transition-all duration-300 group p-4`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">
                  {stat.name}
                </p>
                <h4 className="text-2xl font-black text-zinc-100 mt-2 tracking-tight group-hover:text-white">
                  {stat.value}
                </h4>
              </div>
              <div className={`h-10 w-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center border border-current/10 group-hover:scale-115 transition-all duration-300`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Analytics Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border border-zinc-800/80 p-5 space-y-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Employees distribution by Department
          </h4>
          <div className="h-64 relative">
            {chartData.departments.labels.length === 0 ? (
              <p className="text-sm text-zinc-500 flex h-full items-center justify-center">No department metrics available</p>
            ) : (
              <Bar data={chartData.departments} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: "rgba(63, 63, 70, 0.2)" }, ticks: { color: "#a1a1aa", font: { size: 10, weight: "500" } } },
                  y: { grid: { color: "rgba(63, 63, 70, 0.2)" }, ticks: { color: "#a1a1aa", font: { size: 10, weight: "500" }, stepSize: 1 } },
                }
              }} />
            )}
          </div>
        </Card>

        <Card className="border border-zinc-800/80 p-5 space-y-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Asset Category Metadata Complexity
          </h4>
          <div className="h-64 relative">
            {chartData.categories.labels.length === 0 ? (
              <p className="text-sm text-zinc-500 flex h-full items-center justify-center">No categories metrics available</p>
            ) : (
              <Doughnut data={chartData.categories} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "right", labels: { color: "#a1a1aa", font: { size: 10, weight: "600" }, padding: 12 } } }
              }} />
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
        {/* Recent Audit Timeline */}
        <Card className="lg:col-span-2 border border-zinc-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Live Audits Timeline
            </h4>
            <Link
              to="/activity"
              className="text-xs text-blue-400 font-semibold hover:underline"
            >
              View Full Audit Trail
            </Link>
          </div>

          <div className="divide-y divide-zinc-850">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-zinc-500 py-6 text-center">
                No recent system audits
              </p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between space-x-4">
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-200 font-medium leading-relaxed">
                      {log.action}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-zinc-500 font-semibold">
                      <span>By {log.user?.name || "System"}</span>
                      <span>•</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <Badge variant="neutral" className="uppercase tracking-wider text-[9px] font-bold">
                    {log.entityType}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Action Center & Shortcuts */}
        <div className="space-y-6">
          <Card className="border border-zinc-800/80 space-y-6">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Asset Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/60 hover:border-zinc-700 transition-all text-center space-y-2 group w-full"
              >
                <PlusIcon className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide">Register Asset</span>
              </button>
              <button
                onClick={() => toast("Resource booking scheduler coming soon!")}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/60 hover:border-zinc-700 transition-all text-center space-y-2 group w-full"
              >
                <CalendarDaysIcon className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide">Book Resource</span>
              </button>
              <button
                onClick={() => toast("Maintenance scheduler interface coming soon!")}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/60 hover:border-zinc-700 transition-all text-center space-y-2 group w-full col-span-2"
              >
                <WrenchScrewdriverIcon className="h-5 w-5 text-amber-405 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide">Raise Maintenance</span>
              </button>
            </div>
          </Card>

          <Card className="border border-zinc-800/80 space-y-6">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Quick Shortcuts
            </h4>
            <div className="flex flex-col space-y-3">
              <Link
                to="/assets"
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/50 hover:border-zinc-700 transition-all text-xs font-bold text-zinc-300 group"
              >
                <span>Hardware Inventory list</span>
                <span className="text-zinc-500 group-hover:text-blue-450 transition-colors">→</span>
              </Link>
              <Link
                to="/organization"
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/50 hover:border-zinc-700 transition-all text-xs font-bold text-zinc-300 group"
              >
                <span>Configure Categories</span>
                <span className="text-zinc-500 group-hover:text-blue-450 transition-colors">→</span>
              </Link>
              <button
                onClick={() => {
                  window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
                }}
                className="flex items-center justify-between w-full p-3 rounded-lg bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/50 hover:border-zinc-700 transition-all text-xs font-bold text-zinc-350 text-left group"
              >
                <span className="flex items-center space-x-2">
                  <MagnifyingGlassIcon className="h-4 w-4 text-zinc-550" />
                  <span>Search Registry</span>
                </span>
                <span className="bg-zinc-800 border border-zinc-700 text-[10px] font-bold px-1.5 py-0.5 rounded text-zinc-400">Ctrl + K</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Action: Register Modal */}
      <RegisterAssetModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default Dashboard;
