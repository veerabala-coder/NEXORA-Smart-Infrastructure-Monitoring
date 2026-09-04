import { useEffect, useMemo, useState } from "react";

import {
  FolderKanban,
  Activity,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  CalendarClock,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import api from "../api/axios.js";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // FETCH PROJECTS
  // ==========================================

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("nexora_token");

      if (!token) {
        localStorage.removeItem("nexora_user");
        window.location.href = "/login";
        return;
      }

      const response = await api.get("/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("nexora_token");
        localStorage.removeItem("nexora_user");

        window.location.href = "/login";
        return;
      }

      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    setRefreshing(true);

    await fetchProjects();

    setRefreshing(false);
  };

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  const statistics = useMemo(() => {
    const total = projects.length;

    const active = projects.filter(
      (project) =>
        project.status === "ON_TRACK" ||
        project.status === "AT_RISK"
    ).length;

    const delayed = projects.filter(
      (project) => project.status === "DELAYED"
    ).length;

    const completed = projects.filter(
      (project) => project.status === "COMPLETED"
    ).length;

    const onTrack = projects.filter(
      (project) => project.status === "ON_TRACK"
    ).length;

    const atRisk = projects.filter(
      (project) => project.status === "AT_RISK"
    ).length;

    const averageProgress =
      total > 0
        ? Math.round(
            projects.reduce(
              (sum, project) =>
                sum + Number(project.progress || 0),
              0
            ) / total
          )
        : 0;

    const totalBudget = projects.reduce(
      (sum, project) =>
        sum + Number(project.budget || 0),
      0
    );

    return {
      total,
      active,
      delayed,
      completed,
      onTrack,
      atRisk,
      averageProgress,
      totalBudget,
    };
  }, [projects]);

  // ==========================================
  // UPCOMING DEADLINES
  // ==========================================

  const upcomingProjects = useMemo(() => {
    const today = new Date();

    return projects
      .filter((project) => {
        if (project.status === "COMPLETED") {
          return false;
        }

        const endDate = new Date(project.endDate);

        return endDate >= today;
      })
      .sort(
        (a, b) =>
          new Date(a.endDate) -
          new Date(b.endDate)
      )
      .slice(0, 5);
  }, [projects]);

  // ==========================================
  // RECENT PROJECTS
  // ==========================================

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);
  }, [projects]);

  // ==========================================
  // CHART DATA
  // ==========================================

  const chartData = useMemo(() => {
    return projects.slice(0, 8).map((project) => ({
      name:
        project.name.length > 18
          ? project.name.substring(0, 18) + "..."
          : project.name,
      progress: Number(project.progress || 0),
    }));
  }, [projects]);

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "ON_TRACK":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

      case "AT_RISK":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      case "DELAYED":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      case "COMPLETED":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  // ==========================================
  // FORMAT STATUS
  // ==========================================

  const formatStatus = (status) => {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatBudget = (amount) => {
    if (!amount) {
      return "₹0";
    }

    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    }

    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    }

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // ==========================================
  // DAYS REMAINING
  // ==========================================

  const getDaysRemaining = (date) => {
    const today = new Date();
    const endDate = new Date(date);

    const difference =
      endDate.getTime() - today.getTime();

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
  };

  // ==========================================
  // STAT CARD
  // ==========================================

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    iconStyle,
  }) => {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-cyan-500/30">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400">
              {title}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-white">
              {value}
            </h2>

            <p className="mt-3 text-xs text-slate-500">
              {description}
            </p>
          </div>

          <div
            className={`rounded-xl p-3 ${iconStyle}`}
          >
            <Icon size={22} />
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-10">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={35}
              className="mx-auto animate-spin text-cyan-400"
            />

            <p className="mt-4 text-slate-400">
              Loading NEXORA intelligence...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-10">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold text-cyan-400">
            NEXORA INTELLIGENCE
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Infrastructure Dashboard
          </h1>

          <p className="mt-2 text-slate-400">
            Real-time overview of infrastructure
            project performance.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={
              refreshing ? "animate-spin" : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh Data"}
        </button>
      </div>

      {/* STAT CARDS */}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Projects"
          value={statistics.total}
          icon={FolderKanban}
          description="Projects registered in NEXORA"
          iconStyle="bg-cyan-500/10 text-cyan-400"
        />

        <StatCard
          title="Active Projects"
          value={statistics.active}
          icon={Activity}
          description="On Track + At Risk"
          iconStyle="bg-emerald-500/10 text-emerald-400"
        />

        <StatCard
          title="Delayed Projects"
          value={statistics.delayed}
          icon={AlertTriangle}
          description="Projects requiring attention"
          iconStyle="bg-red-500/10 text-red-400"
        />

        <StatCard
          title="Average Progress"
          value={`${statistics.averageProgress}%`}
          icon={TrendingUp}
          description="Overall project completion"
          iconStyle="bg-purple-500/10 text-purple-400"
        />

      </div>

      {/* SECONDARY METRICS */}

      <div className="mt-5 grid gap-5 md:grid-cols-3">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
              <IndianRupee size={20} />
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Total Project Budget
              </p>

              <p className="mt-1 text-2xl font-bold">
                {formatBudget(statistics.totalBudget)}
              </p>
            </div>

          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <Activity size={20} />
            </div>

            <div>
              <p className="text-sm text-slate-400">
                On Track
              </p>

              <p className="mt-1 text-2xl font-bold">
                {statistics.onTrack}
              </p>
            </div>

          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-yellow-500/10 p-3 text-yellow-400">
              <AlertTriangle size={20} />
            </div>

            <div>
              <p className="text-sm text-slate-400">
                At Risk
              </p>

              <p className="mt-1 text-2xl font-bold">
                {statistics.atRisk}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* CHART + STATUS */}

      <div className="mt-5 grid gap-5 xl:grid-cols-3">

        {/* PROJECT PERFORMANCE */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold">
                Project Performance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current progress of infrastructure
                projects
              </p>
            </div>

          </div>

          <div className="mt-6 h-80">

            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                No project data available.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={chartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    stroke="#64748b"
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    formatter={(value) => [
                      `${value}%`,
                      "Progress",
                    ]}
                  />

                  <Bar
                    dataKey="progress"
                    fill="#06b6d4"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>
            )}

          </div>
        </div>

        {/* STATUS OVERVIEW */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-lg font-bold">
            Status Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current project health
          </p>

          <div className="mt-8 flex justify-center">

            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[12px] border-cyan-500/20">

              <div className="text-center">

                <p className="text-3xl font-bold text-cyan-400">

                  {statistics.total > 0
                    ? Math.round(
                        (statistics.onTrack /
                          statistics.total) *
                          100
                      )
                    : 0}

                  %
                </p>

                <p className="text-xs text-slate-500">
                  On Track
                </p>

              </div>

            </div>

          </div>

          <div className="mt-8 space-y-4">

            <div className="flex items-center justify-between">

              <span className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                On Track
              </span>

              <span className="font-semibold">
                {statistics.onTrack}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                At Risk
              </span>

              <span className="font-semibold">
                {statistics.atRisk}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                Delayed
              </span>

              <span className="font-semibold">
                {statistics.delayed}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                Completed
              </span>

              <span className="font-semibold">
                {statistics.completed}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* UPCOMING DEADLINES */}

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-bold">
              Upcoming Deadlines
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Projects approaching their target
              completion date
            </p>

          </div>

          <CalendarClock
            size={22}
            className="text-cyan-400"
          />

        </div>

        <div className="mt-5 overflow-x-auto">

          {upcomingProjects.length === 0 ? (
            <p className="py-6 text-center text-slate-500">
              No upcoming deadlines.
            </p>
          ) : (

            <table className="w-full min-w-[650px] text-left">

              <thead>

                <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">

                  <th className="pb-3">
                    Project
                  </th>

                  <th className="pb-3">
                    Status
                  </th>

                  <th className="pb-3">
                    Progress
                  </th>

                  <th className="pb-3">
                    Deadline
                  </th>

                  <th className="pb-3">
                    Remaining
                  </th>

                </tr>

              </thead>

              <tbody>

                {upcomingProjects.map((project) => {

                  const days =
                    getDaysRemaining(
                      project.endDate
                    );

                  return (

                    <tr
                      key={project.id}
                      className="border-b border-slate-800/70"
                    >

                      <td className="py-4">

                        <p className="font-medium text-white">
                          {project.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {project.location}
                        </p>

                      </td>

                      <td className="py-4">

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            project.status
                          )}`}
                        >
                          {formatStatus(
                            project.status
                          )}
                        </span>

                      </td>

                      <td className="py-4">

                        <div className="flex items-center gap-3">

                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-800">

                            <div
                              className="h-full rounded-full bg-cyan-500"
                              style={{
                                width: `${project.progress}%`,
                              }}
                            />

                          </div>

                          <span className="text-xs text-slate-400">
                            {project.progress}%
                          </span>

                        </div>

                      </td>

                      <td className="py-4 text-sm text-slate-400">

                        {new Date(
                          project.endDate
                        ).toLocaleDateString()}

                      </td>

                      <td className="py-4">

                        <span
                          className={`text-sm font-semibold ${
                            days <= 7
                              ? "text-red-400"
                              : days <= 30
                              ? "text-yellow-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {days} day
                          {days !== 1
                            ? "s"
                            : ""}
                        </span>

                      </td>

                    </tr>

                  );
                })}

              </tbody>

            </table>

          )}

        </div>

      </div>

      {/* RECENT PROJECTS */}

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-bold">
              Recent Projects
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest projects added to NEXORA
            </p>

          </div>

          <button
            onClick={() => {
              window.location.href =
                "/projects";
            }}
            className="flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300"
          >
            View All

            <ArrowRight size={16} />
          </button>

        </div>

        <div className="mt-5 overflow-x-auto">

          {recentProjects.length === 0 ? (

            <div className="py-8 text-center text-slate-500">
              No projects available.
            </div>

          ) : (

            <table className="w-full min-w-[650px] text-left">

              <thead>

                <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">

                  <th className="pb-3">
                    Project
                  </th>

                  <th className="pb-3">
                    Location
                  </th>

                  <th className="pb-3">
                    Progress
                  </th>

                  <th className="pb-3">
                    Status
                  </th>

                  <th className="pb-3">
                    Manager
                  </th>

                </tr>

              </thead>

              <tbody>

                {recentProjects.map(
                  (project) => (

                    <tr
                      key={project.id}
                      className="border-b border-slate-800/70"
                    >

                      <td className="py-4">

                        <p className="font-medium text-white">
                          {project.name}
                        </p>

                      </td>

                      <td className="py-4 text-sm text-slate-400">
                        {project.location}
                      </td>

                      <td className="py-4">

                        <div className="flex items-center gap-3">

                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-800">

                            <div
                              className="h-full rounded-full bg-cyan-500"
                              style={{
                                width: `${project.progress}%`,
                              }}
                            />

                          </div>

                          <span className="text-xs text-slate-400">
                            {project.progress}%
                          </span>

                        </div>

                      </td>

                      <td className="py-4">

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            project.status
                          )}`}
                        >
                          {formatStatus(
                            project.status
                          )}
                        </span>

                      </td>

                      <td className="py-4 text-sm text-slate-400">
                        {project.manager ||
                          "Not assigned"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      </div>

      {/* FOOTER */}

      <div className="mt-6 flex flex-col justify-between gap-2 border-t border-slate-800 pt-5 text-xs text-slate-600 md:flex-row">

        <p>
          NEXORA Smart Infrastructure Monitoring
          Platform
        </p>

        <p>
          Live data • PostgreSQL • Prisma •
          Express API
        </p>

      </div>

    </div>
  );
}

export default Dashboard;