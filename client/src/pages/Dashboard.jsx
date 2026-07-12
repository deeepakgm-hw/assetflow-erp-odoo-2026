import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import departmentService from "../services/departmentService";
import categoryService from "../services/categoryService";
import employeeService from "../services/employeeService";
import activityService from "../services/activityService";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import {
  UsersIcon,
  Squares2X2Icon,
  TagIcon,
  ClipboardDocumentIcon,
  PlusIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
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
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    departments: { labels: [], datasets: [] },
    categories: { labels: [], datasets: [] },
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      // Call backend APIs concurrently
      const [deptRes, catRes, empRes, actRes] = await Promise.all([
        departmentService.getAll(),
        categoryService.getAll(),
        employeeService.getAll({ limit: 100 }),
        activityService.getAll({ limit: 5 }),
      ]);

      const depts = deptRes.data || [];
      const cats = catRes.data || [];
      const emps = empRes.data?.employees || [];
      const logs = actRes.data?.logs || [];

      setStats({
        departments: depts.length,
        categories: cats.length,
        employees: empRes.data?.pagination?.total || emps.length,
        activities: actRes.data?.pagination?.total || logs.length,
      });

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

  const statCards = [
    {
      name: "Total Employees",
      value: stats.employees,
      icon: UsersIcon,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      name: "Total Departments",
      value: stats.departments,
      icon: Squares2X2Icon,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      name: "Asset Categories",
      value: stats.categories,
      icon: TagIcon,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      name: "Total System Audits",
      value: stats.activities,
      icon: ClipboardDocumentIcon,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
  ];

  // Options for Chart styling (Dark theme)
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(63, 63, 70, 0.2)",
        },
        ticks: {
          color: "#a1a1aa",
          font: { size: 10, weight: "500" },
        },
      },
      y: {
        grid: {
          color: "rgba(63, 63, 70, 0.2)",
        },
        ticks: {
          color: "#a1a1aa",
          font: { size: 10, weight: "500" },
          stepSize: 1,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#a1a1aa",
          font: { size: 10, weight: "600" },
          padding: 12,
        },
      },
    },
  };

  return (
    <div className="space-y-8 select-none">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-100 flex items-center space-x-2">
            <span>ERP Statistics Overview</span>
            <SparklesIcon className="h-5 w-5 text-blue-500 animate-pulse" />
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            Monitor organizational metrics, department workloads, and categories in real-time.
          </p>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <Card
            key={idx}
            className={`border ${stat.border} hover:scale-[1.02] hover:shadow-xl hover:shadow-zinc-950/40 transition-all duration-300 group`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {stat.name}
                </p>
                <h4 className="text-3xl font-black text-zinc-100 mt-2 tracking-tight group-hover:text-white">
                  {stat.value}
                </h4>
              </div>
              <div className={`h-12 w-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center border border-current/10 group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-6 w-6" />
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
              <Bar data={chartData.departments} options={barOptions} />
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
              <Doughnut data={chartData.categories} options={doughnutOptions} />
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
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/organization"
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/60 hover:border-zinc-700 transition-all text-center space-y-2 group"
              >
                <PlusIcon className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide">Add Dept</span>
              </Link>
              <Link
                to="/organization"
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/60 hover:border-zinc-700 transition-all text-center space-y-2 group"
              >
                <TagIcon className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide">Configure Cat</span>
              </Link>
            </div>
          </Card>

          <Card className="border border-zinc-800/80 space-y-6">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Quick Shortcuts
            </h4>
            <div className="flex flex-col space-y-3">
              <Link
                to="/organization"
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/50 hover:border-zinc-700 transition-all text-xs font-bold text-zinc-300 group"
              >
                <span>Employee Directory</span>
                <span className="text-zinc-500 group-hover:text-blue-450 transition-colors">→</span>
              </Link>
              <Link
                to="/notifications"
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/50 hover:border-zinc-700 transition-all text-xs font-bold text-zinc-300 group"
              >
                <span>View System Alerts</span>
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
                  <span>Search System</span>
                </span>
                <span className="bg-zinc-800 border border-zinc-700 text-[10px] font-bold px-1.5 py-0.5 rounded text-zinc-400">Ctrl + K</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
