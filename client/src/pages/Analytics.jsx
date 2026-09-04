import { useEffect, useMemo, useState } from "react";

import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import api from "../api/axios.js";

function Analytics() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH PROJECTS
  // ==========================================

  const fetchProjects = async () => {
    setLoading(true);

    try {
      const response = await api.get("/projects");

      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Analytics fetch error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("nexora_token");
        localStorage.removeItem("nexora_user");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ==========================================
  // STATISTICS
  // ==========================================

  const stats = useMemo(() => {
    const total = projects.length;

    const average =
      total === 0
        ? 0
        : Math.round(
            projects.reduce(
              (sum, project) =>
                sum + Number(project.progress || 0),
              0
            ) / total
          );

    return {
      total,
      average,

      onTrack: projects.filter(
        (p) => p.status === "ON_TRACK"
      ).length,

      risk: projects.filter(
        (p) => p.status === "AT_RISK"
      ).length,

      delayed: projects.filter(
        (p) => p.status === "DELAYED"
      ).length,

      completed: projects.filter(
        (p) => p.status === "COMPLETED"
      ).length,
    };
  }, [projects]);

  // ==========================================
  // STATUS DATA
  // ==========================================

  const statusData = [
    {
      name: "On Track",
      value: stats.onTrack,
    },
    {
      name: "At Risk",
      value: stats.risk,
    },
    {
      name: "Delayed",
      value: stats.delayed,
    },
    {
      name: "Completed",
      value: stats.completed,
    },
  ];

  // ==========================================
  // PROGRESS DATA
  // ==========================================

  const progressData = projects
    .slice(0, 10)
    .map((project) => ({
      name:
        project.name.length > 18
          ? `${project.name.slice(0, 18)}...`
          : project.name,

      progress: Number(project.progress || 0),
    }));

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-10">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <p className="text-sm font-semibold text-cyan-400">
            INTELLIGENCE
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Project Analytics
          </h1>

          <p className="mt-2 text-slate-400">
            Live performance insights from your
            infrastructure projects.
          </p>
        </div>

        <button
          onClick={fetchProjects}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              loading ? "animate-spin" : ""
            }
          />

          {loading ? "Refreshing..." : "Refresh"}
        </button>

      </div>

      {/* LOADING */}

      {loading ? (

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
          <div className="flex items-center gap-3">
            <RefreshCw
              size={20}
              className="animate-spin text-cyan-400"
            />

            Loading analytics...
          </div>
        </div>

      ) : (

        <>

          {/* =====================================
              STAT CARDS
          ====================================== */}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <Stat
              title="Total Projects"
              value={stats.total}
              icon={BarChart3}
            />

            <Stat
              title="Average Progress"
              value={`${stats.average}%`}
              icon={TrendingUp}
            />

            <Stat
              title="At Risk"
              value={stats.risk}
              icon={AlertTriangle}
            />

            <Stat
              title="Completed"
              value={stats.completed}
              icon={CheckCircle2}
            />

          </div>

          {/* =====================================
              CHARTS
          ====================================== */}

          <div className="mt-6 grid gap-6 xl:grid-cols-3">

            {/* BAR CHART */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">

              <h2 className="text-lg font-semibold">
                Project Progress
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Progress of your projects.
              </p>

              <div className="mt-6 h-80">

                {progressData.length > 0 ? (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart data={progressData}>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#334155"
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 11,
                        }}
                      />

                      <YAxis
                        domain={[0, 100]}
                        tick={{
                          fill: "#94a3b8",
                        }}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="progress"
                        fill="#22d3ee"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                      />

                    </BarChart>
                  </ResponsiveContainer>

                ) : (

                  <div className="flex h-full items-center justify-center text-slate-500">
                    No project data available.
                  </div>

                )}

              </div>

            </div>

            {/* PIE CHART */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <h2 className="text-lg font-semibold">
                Status Distribution
              </h2>

              <div className="mt-6 h-64">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>

                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {statusData.map(
                        (_, index) => (
                          <Cell
                            key={index}
                            fill={
                              [
                                "#22c55e",
                                "#eab308",
                                "#ef4444",
                                "#06b6d4",
                              ][index]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                  </PieChart>
                </ResponsiveContainer>

              </div>

              <div className="space-y-3 text-sm">

                {statusData.map((item) => (

                  <div
                    key={item.name}
                    className="flex justify-between border-b border-slate-800 pb-2"
                  >
                    <span className="text-slate-400">
                      {item.name}
                    </span>

                    <span className="font-semibold">
                      {item.value}
                    </span>
                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* =====================================
              PROJECT PERFORMANCE TABLE
          ====================================== */}

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-lg font-semibold">
              Project Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Detailed performance of infrastructure
              projects.
            </p>

            <div className="mt-5 overflow-x-auto">

              {projects.length === 0 ? (

                <div className="py-8 text-center text-slate-500">
                  No projects available.
                </div>

              ) : (

                <table className="w-full text-left text-sm">

                  <thead className="text-slate-500">

                    <tr className="border-b border-slate-800">

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

                    </tr>

                  </thead>

                  <tbody>

                    {projects.map((project) => (

                      <tr
                        key={project.id}
                        className="border-b border-slate-800/70"
                      >

                        <td className="py-4 font-medium text-white">
                          {project.name}
                        </td>

                        <td className="py-4 text-slate-400">
                          {project.location}
                        </td>

                        <td className="py-4">

                          <div className="flex items-center gap-3">

                            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-800">

                              <div
                                className="h-full rounded-full bg-cyan-500"
                                style={{
                                  width: `${project.progress}%`,
                                }}
                              />

                            </div>

                            <span className="text-cyan-400">
                              {project.progress}%
                            </span>

                          </div>

                        </td>

                        <td className="py-4">

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              project.status ===
                              "ON_TRACK"
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                : project.status ===
                                  "AT_RISK"
                                ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                                : project.status ===
                                  "DELAYED"
                                ? "border-red-500/20 bg-red-500/10 text-red-400"
                                : "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                            }`}
                          >
                            {project.status.replaceAll(
                              "_",
                              " "
                            )}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              )}

            </div>

          </div>

        </>

      )}

    </div>
  );
}

// ==========================================
// STAT COMPONENT
// ==========================================

function Stat({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-cyan-500/30">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {value}
          </p>

        </div>

        <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
          <Icon size={22} />
        </div>

      </div>

    </div>
  );
}

export default Analytics;