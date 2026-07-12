import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Card from "../components/Card";
import Badge from "../components/Badge";
<<<<<<< HEAD
import LoadingSpinner from "../components/LoadingSpinner";
<<<<<<< HEAD
import departmentService from "../services/departmentService";
import categoryService from "../services/categoryService";
import employeeService from "../services/employeeService";
import activityService from "../services/activityService";
import dashboardService from "../services/dashboardService";
import RegisterAssetModal from "../components/RegisterAssetModal";
=======
=======
>>>>>>> 85b1237 (redesign enterprise dashboard and improve UI integration)
import dashboardService from "../services/dashboardService";
import notificationService from "../services/notificationService";
>>>>>>> 8e81198 (feat: redesign dashboard with premium glassmorphism and real-time metrics)
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
<<<<<<< HEAD
import toast from "react-hot-toast";
import {
  UsersIcon,
  Squares2X2Icon,
  TagIcon,
  ClipboardDocumentIcon,
  PlusIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
<<<<<<< HEAD
  BriefcaseIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
=======
  ArchiveBoxIcon,
  CheckCircleIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  BellIcon,
  ArrowPathIcon,
  ClockIcon,
  ArrowUpRightIcon,
  QueueListIcon
>>>>>>> 8e81198 (feat: redesign dashboard with premium glassmorphism and real-time metrics)
} from "@heroicons/react/24/outline";
=======
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Calendar,
  Wrench,
  Sparkles,
  Search,
  Archive,
  CheckCircle,
  Cpu,
  Clock,
  ArrowUpRight,
  Bell,
  Activity,
  ArrowRight,
  Brain,
  AlertTriangle
} from "lucide-react";
>>>>>>> 85b1237 (redesign enterprise dashboard and improve UI integration)

// Recharts imports for premium SVG graphs
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  PieChart,
  Pie
} from "recharts";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const Dashboard = () => {
  const { user } = useAuth();
<<<<<<< HEAD
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
=======
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssets: 0,
    allocatedAssets: 0,
    availableAssets: 0,
    departments: 0,
    employees: 0,
    pendingMaintenance: 0,
    resourceBookingsToday: 0,
    pendingApprovals: 0
>>>>>>> 8e81198 (feat: redesign dashboard with premium glassmorphism and real-time metrics)
  });

  const [recentLogs, setRecentLogs] = useState([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState([]);
  const [resourceBookings, setResourceBookings] = useState([]);
  const [recentAssets, setRecentAssets] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [statusData, setStatusData] = useState([]);
  const [deptData, setDeptData] = useState([]);

  // Time ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
<<<<<<< HEAD
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
=======
      const [statsRes, notifRes] = await Promise.all([
        dashboardService.getDetails(),
        notificationService.getAll({ limit: 4 })
      ]);

      const data = statsRes.data;
      setStats(data.kpis);
      setRecentLogs(data.recentActivities || []);
      setUpcomingMaintenance(data.upcomingMaintenance || []);
      setResourceBookings(data.resourceBookings || []);
      setRecentAssets(data.recentAssets || []);
      setRecentNotifications(notifRes.data || []);
>>>>>>> 8e81198 (feat: redesign dashboard with premium glassmorphism and real-time metrics)

      // Mapping status chart
      setStatusData(
        data.assetStatusChart.map((x, idx) => ({
          name: x.name,
          value: x.value,
          color: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"][idx % 5]
        }))
      );

<<<<<<< HEAD
<<<<<<< HEAD
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
=======
      // Departments distribution chart config
      const deptLabels = data.departmentChart.map((x) => x.name);
      const deptValues = data.departmentChart.map((x) => x.value);
>>>>>>> 8e81198 (feat: redesign dashboard with premium glassmorphism and real-time metrics)

      setChartData({
        status: {
          labels: statusLabels,
          datasets: [
            {
              label: "Assets Status",
              data: statusValues,
              backgroundColor: [
                "rgba(59, 130, 246, 0.45)", // Blue (Allocated)
                "rgba(16, 185, 129, 0.45)", // Emerald (Available)
                "rgba(245, 158, 11, 0.45)", // Amber (Maintenance)
                "rgba(139, 92, 246, 0.45)", // Purple (Retired)
                "rgba(239, 68, 68, 0.45)"   // Red (Lost)
              ],
              borderColor: [
                "rgba(59, 130, 246, 1)",
                "rgba(16, 185, 129, 1)",
                "rgba(245, 158, 11, 1)",
                "rgba(139, 92, 246, 1)",
                "rgba(239, 68, 68, 1)"
              ],
              borderWidth: 1.5,
              borderRadius: 4
            }
          ]
        },
        departments: {
          labels: deptLabels,
          datasets: [
            {
              label: "Headcount",
              data: deptValues,
              backgroundColor: [
                "rgba(139, 92, 246, 0.45)",
                "rgba(236, 72, 153, 0.45)",
                "rgba(59, 130, 246, 0.45)",
                "rgba(16, 185, 129, 0.45)",
                "rgba(245, 158, 11, 0.45)"
              ],
              borderColor: [
                "rgba(139, 92, 246, 1)",
                "rgba(236, 72, 153, 1)",
                "rgba(59, 130, 246, 1)",
                "rgba(16, 185, 129, 1)",
                "rgba(245, 158, 11, 1)"
              ],
              borderWidth: 1.5
            }
          ]
        }
      });
=======
      // Mapping department distribution
      setDeptData(
        data.departmentChart.map((x, idx) => ({
          name: x.name,
          value: x.value,
          color: ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"][idx % 5]
        }))
      );
>>>>>>> 85b1237 (redesign enterprise dashboard and improve UI integration)
    } catch (error) {
      console.error("Dashboard synchronization error:", error);
      toast.error("Failed to load real-time database ledger metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Socket triggers
  const socket = useSocket(user?.id);
  useEffect(() => {
    if (!socket) return;
    const handleSync = () => fetchDashboardData();
    socket.on("dashboard_update", handleSync);
    socket.on("activity_logged", handleSync);
    return () => {
      socket.off("dashboard_update", handleSync);
      socket.off("activity_logged", handleSync);
    };
  }, [socket, fetchDashboardData]);

  const handleQuickAction = (actionName) => {
    toast.success(`${actionName} Wizard launched!`, {
      style: {
        background: "#18181b",
        color: "#f4f4f5",
        border: "1px solid #27272a"
      }
    });
  };

<<<<<<< HEAD
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
=======
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
    }
  };

  const kpis = [
    { name: "Total Assets", value: stats.totalAssets, change: "+12.4% MoM", icon: Archive, color: "text-blue-400", bg: "bg-blue-500/10", border: "hover:border-blue-500/30" },
    { name: "Allocated", value: stats.allocatedAssets, change: "85% Utilized", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/30" },
    { name: "Available", value: stats.availableAssets, change: "Ready to deploy", icon: Cpu, color: "text-zinc-400", bg: "bg-zinc-500/10", border: "hover:border-zinc-700" },
    { name: "Departments", value: stats.departments, change: "Active sectors", icon: Building2, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "hover:border-indigo-500/30" },
    { name: "Employees", value: stats.employees, change: "Internal staff", icon: Users, color: "text-amber-400", bg: "bg-amber-500/10", border: "hover:border-amber-500/30" },
    { name: "Maintenance", value: stats.pendingMaintenance, change: "Requires review", icon: Wrench, color: "text-rose-400", bg: "bg-rose-500/10", border: "hover:border-rose-500/30" },
    { name: "Resource Bookings", value: stats.resourceBookingsToday, change: "Reservations", icon: Calendar, color: "text-teal-400", bg: "bg-teal-500/10", border: "hover:border-teal-500/30" },
    { name: "Approvals", value: stats.pendingApprovals, change: "Awaiting review", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10", border: "hover:border-purple-500/30" }
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse select-none max-w-[1600px] mx-auto pb-10">
        <div className="h-20 bg-zinc-900/60 border border-zinc-850 rounded-2xl"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-900/40 border border-zinc-850 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-zinc-900/30 border border-zinc-850 rounded-2xl"></div>
          <div className="h-[400px] bg-zinc-900/30 border border-zinc-850 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 select-none max-w-[1650px] mx-auto pb-10 font-sans"
    >
      {/* Top Banner Control deck */}
      <motion.div
        variants={itemVariants}
        className="backdrop-blur-md bg-zinc-900/40 border border-zinc-850/70 p-5 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl"
      >
        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/15">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>Operational Console</span>
            </h1>
            <p className="text-xs text-zinc-400 font-medium">
              Enterprise control center for <span className="text-zinc-200 font-bold">{user?.name || "Operator"}</span>
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500" />
            </span>
            <input
              type="text"
              placeholder="Query assets, departments, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-2.5 text-xs bg-zinc-950/80 border border-zinc-850 focus:border-blue-500/50 rounded-xl text-zinc-250 placeholder-zinc-600 focus:outline-none transition-all"
            />
            <span className="absolute inset-y-0 right-2 flex items-center">
              <kbd className="bg-zinc-900 border border-zinc-800 text-[9px] font-bold px-1.5 py-0.5 rounded text-zinc-400">Ctrl+K</kbd>
            </span>
          </form>

          {/* Sync Ticker */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs bg-zinc-950/50 border border-zinc-850 px-3 py-2 rounded-xl text-zinc-300 font-semibold">
              <Clock className="h-4 w-4 text-blue-400" />
              <span>{currentTime}</span>
            </div>

            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Live Sync</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Columns (3 xl) */}
        <div className="xl:col-span-3 space-y-6">
          {/* KPI Dashboard row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.map((card, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card
                  className={`backdrop-blur-md bg-zinc-900/30 border border-zinc-850/60 p-4 hover:scale-[1.02] hover:shadow-xl hover:shadow-zinc-950/50 transition-all duration-300 group ${card.border}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      {card.name}
                    </span>
                    <div className={`h-8 w-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center border border-current/5 group-hover:scale-105 transition-transform`}>
                      <card.icon className="h-4 w-4" />
                    </div>
                  </div>
<<<<<<< HEAD
                </div>
                <h4 className="text-2xl font-black text-zinc-150 mt-3 tracking-tight group-hover:text-white">
                  {card.value}
>>>>>>> 8e81198 (feat: redesign dashboard with premium glassmorphism and real-time metrics)
                </h4>
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold">
                  {card.trend}
                </p>
              </Card>
=======
                  <h4 className="text-2xl font-black text-zinc-200 mt-2 tracking-tight group-hover:text-white">
                    {card.value}
                  </h4>
                  <p className="text-[9px] text-zinc-550 mt-1 font-bold">
                    {card.change}
                  </p>
                </Card>
              </motion.div>
>>>>>>> 85b1237 (redesign enterprise dashboard and improve UI integration)
            ))}
          </div>

          {/* AI Insights Ticker */}
          <motion.div
            variants={itemVariants}
            className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-transparent border border-purple-500/20 flex items-center space-x-3.5 backdrop-blur-sm"
          >
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
              <Brain className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-purple-400 uppercase tracking-wider">AI Asset lifecycle Insights</span>
                <span className="bg-purple-500/15 text-[8px] font-black text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/25 uppercase">Predictive</span>
              </div>
<<<<<<< HEAD
<<<<<<< HEAD
              <div className={`h-10 w-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center border border-current/10 group-hover:scale-115 transition-all duration-300`}>
                <stat.icon className="h-5 w-5" />
=======
              <div className="h-60 relative">
                {chartData.status.labels.length === 0 ? (
                  <p className="text-xs text-zinc-500 flex h-full items-center justify-center">No status data synced</p>
                ) : (
                  <Bar data={chartData.status} options={barOptions} />
                )}
>>>>>>> 8e81198 (feat: redesign dashboard with premium glassmorphism and real-time metrics)
              </div>
            </Card>
=======
              <p className="text-xs text-zinc-400 font-medium">
                AI model predicts <span className="text-zinc-205 font-bold">3 engineering workstations</span> will need maintenance checkout within 15 days. Proactive scheduling will reduce downtime risk by 88%.
              </p>
            </div>
          </motion.div>
>>>>>>> 85b1237 (redesign enterprise dashboard and improve UI integration)

          {/* SVG Vector Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Lifecycle Status */}
            <motion.div variants={itemVariants}>
              <Card className="backdrop-blur-md bg-zinc-900/30 border border-zinc-850/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-zinc-450 uppercase tracking-wider flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span>Asset Lifecycle Distribution</span>
                  </h4>
                  <Badge variant="blue" className="text-[9px] uppercase tracking-wider">Active Inventory</Badge>
                </div>
                <div className="h-56">
                  {statusData.length === 0 ? (
                    <p className="text-xs text-zinc-650 flex h-full items-center justify-center">No status data synced</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#52525b" fontSize={9} fontWeight="600" />
                        <YAxis stroke="#52525b" fontSize={9} fontWeight="600" allowDecimals={false} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", fontSize: "11px", color: "#f4f4f5" }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Department Headcount */}
            <motion.div variants={itemVariants}>
              <Card className="backdrop-blur-md bg-zinc-900/30 border border-zinc-850/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-zinc-455 uppercase tracking-wider flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>Department headcount allocation</span>
                  </h4>
                  <Badge variant="indigo" className="text-[9px] uppercase tracking-wider">Postgres Source</Badge>
                </div>
                <div className="h-56 flex items-center justify-center relative">
                  {deptData.length === 0 ? (
                    <p className="text-xs text-zinc-650 flex h-full items-center justify-center">No headcount synced</p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={deptData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {deptData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", fontSize: "11px", color: "#f4f4f5" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Legend grid */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col space-y-1.5 max-w-[120px]">
                        {deptData.map((entry, idx) => (
                          <div key={idx} className="flex items-center space-x-1.5 text-[9px] font-bold text-zinc-400">
                            <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                            <span className="truncate">{entry.name}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Third Row: Upcoming Maintenance & Today's Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maintenance */}
            <motion.div variants={itemVariants}>
              <Card className="backdrop-blur-md bg-zinc-900/30 border border-zinc-850/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-zinc-450 uppercase tracking-wider flex items-center space-x-2">
                    <Wrench className="h-4 w-4 text-rose-500" />
                    <span>Upcoming Maintenance ledger</span>
                  </h4>
                  <Link to="/organization" className="text-[10px] text-blue-400 font-bold hover:underline">Launch Tickets</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[9px] font-bold tracking-wider">
                        <th className="pb-2.5">Asset</th>
                        <th className="pb-2.5">Dept</th>
                        <th className="pb-2.5">Due Date</th>
                        <th className="pb-2.5 text-right">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/40">
                      {upcomingMaintenance.map((m) => (
                        <tr key={m.id} className="hover:bg-zinc-900/10">
                          <td className="py-2.5 font-semibold text-zinc-200">{m.assetName}</td>
                          <td className="py-2.5 text-zinc-450">{m.department}</td>
                          <td className="py-2.5 text-zinc-450">{m.dueDate}</td>
                          <td className="py-2.5 text-right">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-wide border ${
                              m.priority === "High"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}>
                              {m.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>

            {/* Bookings */}
            <motion.div variants={itemVariants}>
              <Card className="backdrop-blur-md bg-zinc-900/30 border border-zinc-850/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-zinc-450 uppercase tracking-wider flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-teal-500" />
                    <span>Today's Resource Bookings</span>
                  </h4>
                  <Badge variant="success" className="text-[9px] uppercase tracking-wider">Reserved</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[9px] font-bold tracking-wider">
                        <th className="pb-2.5">Resource</th>
                        <th className="pb-2.5">Owner</th>
                        <th className="pb-2.5">Hours</th>
                        <th className="pb-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/40">
                      {resourceBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-zinc-900/10">
                          <td className="py-2.5 font-semibold text-zinc-200 flex items-center space-x-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 flex-shrink-0 animate-pulse"></span>
                            <span>{b.resource}</span>
                          </td>
                          <td className="py-2.5 text-zinc-450">{b.bookedBy}</td>
                          <td className="py-2.5 text-zinc-450">{b.time}</td>
                          <td className="py-2.5 text-right">
                            <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-wider">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Actions and Alert Feeds */}
        <div className="space-y-6 col-span-1">
<<<<<<< HEAD
          {/* Quick Actions Control Hub */}
          <Card className="backdrop-blur-md bg-zinc-900/40 border border-zinc-850 p-5 space-y-4">
            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center space-x-2">
              <PlusIcon className="h-4 w-4 text-blue-500" />
              <span>Control Hub Actions</span>
            </h4>
            <div className="flex flex-col space-y-2">
              {[
                { name: "Add New Asset", color: "hover:border-blue-500/30" },
                { name: "Allocate Asset", color: "hover:border-indigo-500/30" },
                { name: "Book Resource", color: "hover:border-teal-500/30" },
                { name: "Create Maintenance Ticket", color: "hover:border-rose-500/30" },
                { name: "Add Department", color: "hover:border-zinc-500" },
                { name: "Add Employee", color: "hover:border-zinc-500" }
              ].map((act, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(act.name)}
                  className={`w-full py-2.5 px-4 text-xs font-bold text-left rounded-xl bg-zinc-950/60 border border-zinc-850 hover:bg-zinc-900/80 hover:text-white transition-all duration-300 flex items-center justify-between group ${act.color}`}
                >
                  <span>{act.name}</span>
                  <ArrowUpRightIcon className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
                </button>
              ))}
            </div>
          </Card>

<<<<<<< HEAD
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
=======
          {/* Recent Live Notifications */}
          <Card className="backdrop-blur-md bg-zinc-900/40 border border-zinc-850 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center space-x-2">
                <BellIcon className="h-4 w-4 text-amber-500" />
                <span>Recent System Alerts</span>
=======
          {/* Quick Actions Panel */}
          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-md bg-zinc-900/30 border border-zinc-850/60 p-5 space-y-4">
              <h4 className="text-xs font-black text-zinc-450 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span>Quick Actions Hub</span>
>>>>>>> 85b1237 (redesign enterprise dashboard and improve UI integration)
              </h4>
              <div className="flex flex-col space-y-2">
                {[
                  { name: "Add New Asset", color: "hover:border-blue-500/35" },
                  { name: "Allocate Asset", color: "hover:border-indigo-500/35" },
                  { name: "Book Resource", color: "hover:border-teal-500/35" },
                  { name: "Create Maintenance Ticket", color: "hover:border-rose-500/35" },
                  { name: "Add Department", color: "hover:border-zinc-650" },
                  { name: "Add Employee", color: "hover:border-zinc-650" }
                ].map((act, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(act.name)}
                    className={`w-full py-2.5 px-4 text-xs font-bold text-left rounded-xl bg-zinc-950/60 border border-zinc-850 hover:bg-zinc-900/80 hover:text-white transition-all duration-300 flex items-center justify-between group ${act.color}`}
                  >
                    <span>{act.name}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-zinc-550 group-hover:text-zinc-200 transition-colors" />
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* System Alerts and Messages */}
          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-md bg-zinc-900/30 border border-zinc-850/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-zinc-450 uppercase tracking-wider flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-amber-500" />
                  <span>Unresolved system Alerts</span>
                </h4>
                <Link to="/notifications" className="text-[10px] text-blue-450 font-bold hover:underline">Inbox</Link>
              </div>
              <div className="space-y-2.5">
                {recentNotifications.length === 0 ? (
                  <p className="text-xs text-zinc-650 text-center py-6">No unread notifications</p>
                ) : (
                  recentNotifications.map((notif) => (
                    <div key={notif.id} className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-850 flex items-start space-x-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0 animate-pulse"></div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-zinc-300 leading-relaxed font-semibold">{notif.message}</p>
                        <p className="text-[8px] text-zinc-550 font-bold">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
<<<<<<< HEAD
                  </div>
                ))
              )}
>>>>>>> 8e81198 (feat: redesign dashboard with premium glassmorphism and real-time metrics)
            </div>
          </Card>
=======
                  ))
                )}
              </div>
            </Card>
          </motion.div>
>>>>>>> 85b1237 (redesign enterprise dashboard and improve UI integration)
        </div>
      </div>

<<<<<<< HEAD
      {/* Quick Action: Register Modal */}
      <RegisterAssetModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={fetchDashboardData}
      />
=======
      {/* Bottom Panel: Modern Recent Assets Registry DataTable */}
      <motion.div variants={itemVariants}>
        <Card className="backdrop-blur-md bg-zinc-900/30 border border-zinc-850/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                Global Asset Registry Ledger
              </h4>
              <p className="text-xs text-zinc-550 mt-0.5">Latest procurement modifications registered.</p>
            </div>
<<<<<<< HEAD
          ))}
        </div>
      </Card>
>>>>>>> 8e81198 (feat: redesign dashboard with premium glassmorphism and real-time metrics)
    </div>
=======
            <Badge variant="blue" className="text-[9px] uppercase tracking-wider">Synchronized</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-550 uppercase text-[9px] font-bold tracking-wider">
                  <th className="pb-3">Asset ID</th>
                  <th className="pb-3">Asset Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Custodian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/35">
                {recentAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-zinc-900/10 transition-colors">
                    <td className="py-3.5 font-mono text-[9px] text-zinc-500">AST-{1000 + asset.id}</td>
                    <td className="py-3.5 font-bold text-zinc-200">{asset.name}</td>
                    <td className="py-3.5 text-zinc-400">{asset.categoryName}</td>
                    <td className="py-3.5 text-zinc-400">{asset.departmentName}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                        asset.status === "Active" || asset.status === "Available"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : asset.status === "Allocated"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-semibold text-zinc-300">{asset.assignedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Bottom Panel: Activity Audit Logs */}
      <motion.div variants={itemVariants}>
        <Card className="backdrop-blur-md bg-zinc-900/30 border border-zinc-850/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span>Enterprise Activity log feed</span>
            </h4>
            <Link to="/activity" className="text-xs text-blue-450 font-bold hover:underline">Full Audit Trail →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="p-3 bg-zinc-950/65 rounded-xl border border-zinc-850 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-300 font-semibold">{log.action}</p>
                  <div className="flex items-center space-x-2 text-[8px] text-zinc-550 font-bold">
                    <span>By {log.user?.name || "System"}</span>
                    <span>•</span>
                    <span>{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <Badge variant="neutral" className="uppercase text-[9px] font-bold">{log.entityType}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
>>>>>>> 85b1237 (redesign enterprise dashboard and improve UI integration)
  );
};

export default Dashboard;
