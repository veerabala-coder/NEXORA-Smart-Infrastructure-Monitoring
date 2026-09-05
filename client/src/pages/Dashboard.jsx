import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FolderKanban,
  Activity,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  CalendarClock,
  RefreshCw,
  WalletCards,
  ShieldAlert,
  CheckCircle2,
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
  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const response =
        await api.get("/projects");

      setProjects(
        response.data.projects || []
      );

    } catch (error) {
      console.error(
        "Dashboard fetch error:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        localStorage.removeItem(
          "nexora_token"
        );

        localStorage.removeItem(
          "nexora_user"
        );

        window.location.href =
          "/login";
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const statistics = useMemo(() => {

    const total =
      projects.length;

    const active =
      projects.filter(
        (p) =>
          p.status ===
            "ON_TRACK" ||
          p.status ===
            "AT_RISK"
      ).length;

    const completed =
      projects.filter(
        (p) =>
          p.status ===
          "COMPLETED"
      ).length;

    const delayed =
      projects.filter(
        (p) =>
          p.status ===
          "DELAYED"
      ).length;

    const atRisk =
      projects.filter(
        (p) =>
          p.status ===
          "AT_RISK"
      ).length;

    const averageProgress =
      total > 0
        ? Math.round(
            projects.reduce(
              (sum, p) =>
                sum +
                Number(
                  p.progress || 0
                ),
              0
            ) / total
          )
        : 0;

    const approvedBudget =
      projects.reduce(
        (sum, p) =>
          sum +
          Number(
            p.approvedBudget ??
              p.budget ??
              0
          ),
        0
      );

    const estimatedCost =
      projects.reduce(
        (sum, p) =>
          sum +
          Number(
            p.estimatedFinalCost ??
              p.budget ??
              0
          ),
        0
      );

    const additionalFunding =
      projects.reduce(
        (sum, p) =>
          sum +
          Number(
            p.additionalFunding ||
              0
          ),
        0
      );

    const fundingProjects =
      projects.filter(
        (p) =>
          Number(
            p.additionalFunding ||
              0
          ) > 0
      ).length;

    return {
      total,
      active,
      completed,
      delayed,
      atRisk,
      averageProgress,
      approvedBudget,
      estimatedCost,
      additionalFunding,
      fundingProjects,
    };

  }, [projects]);

  const formatMoney = (value) => {
    const amount =
      Number(value || 0);

    if (
      amount >= 10000000
    ) {
      return `₹${(
        amount /
        10000000
      ).toFixed(1)} Cr`;
    }

    if (
      amount >= 100000
    ) {
      return `₹${(
        amount /
        100000
      ).toFixed(1)} L`;
    }

    return `₹${amount.toLocaleString(
      "en-IN"
    )}`;
  };

  const chartData =
    projects
      .slice(0, 8)
      .map((project) => ({
        name:
          project.name.length >
          18
            ? project.name.slice(
                0,
                18
              ) + "..."
            : project.name,

        progress:
          Number(
            project.progress ||
              0
          ),
      }));

  const fundingProjects =
    projects.filter(
      (p) =>
        Number(
          p.additionalFunding ||
            0
        ) > 0
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">

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
            project performance and financial health.
          </p>

        </div>

        <button
          onClick={async () => {
            setRefreshing(true);
            await fetchProjects();
            setRefreshing(false);
          }}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-medium text-slate-300 hover:border-cyan-500 hover:text-cyan-400"
        >

          <RefreshCw
            size={18}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh Data"}

        </button>

      </div>

      {/* MAIN STATS */}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">

        <StatCard
          title="Total Projects"
          value={
            statistics.total
          }
          icon={FolderKanban}
          description="Projects registered"
        />

        <StatCard
          title="Active Projects"
          value={
            statistics.active
          }
          icon={Activity}
          description="On Track + At Risk"
        />

        <StatCard
          title="Completed"
          value={
            statistics.completed
          }
          icon={CheckCircle2}
          description="Successfully completed"
        />

        <StatCard
          title="Delayed"
          value={
            statistics.delayed
          }
          icon={AlertTriangle}
          description="Require attention"
        />

        <StatCard
          title="At Risk"
          value={
            statistics.atRisk
          }
          icon={ShieldAlert}
          description="Risk detected"
        />

      </div>

      {/* FINANCIAL STATS */}

      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <FinancialCard
          title="Approved Budget"
          value={formatMoney(
            statistics.approvedBudget
          )}
          icon={IndianRupee}
        />

        <FinancialCard
          title="Estimated Final Cost"
          value={formatMoney(
            statistics.estimatedCost
          )}
          icon={TrendingUp}
        />

        <FinancialCard
          title="Additional Funding"
          value={formatMoney(
            statistics.additionalFunding
          )}
          icon={WalletCards}
          danger={
            statistics.additionalFunding >
            0
          }
        />

        <FinancialCard
          title="Funding Projects"
          value={
            statistics.fundingProjects
          }
          icon={AlertTriangle}
          danger={
            statistics.fundingProjects >
            0
          }
        />

      </div>

      {/* FUNDING ALERT */}

      {statistics.fundingProjects >
        0 && (

        <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-red-500/10 p-3 text-red-400">

                <ShieldAlert
                  size={25}
                />

              </div>

              <div>

                <p className="text-sm font-semibold text-red-400">
                  🚨 FUNDING ALERTS
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {
                    statistics.fundingProjects
                  }{" "}
                  projects require
                  additional funding
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Total additional funding
                  required:
                </p>

                <p className="mt-1 text-2xl font-bold text-red-400">
                  {formatMoney(
                    statistics.additionalFunding
                  )}
                </p>

              </div>

            </div>

            <button
              onClick={() => {
                window.location.href =
                  "/alerts?filter=FUNDING";
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-400"
            >
              View Funding Alerts
              <ArrowRight
                size={17}
              />
            </button>

          </div>

        </div>

      )}

      {/* CHART */}

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-bold">
              Project Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current project completion levels
            </p>

          </div>

          <span className="text-sm text-cyan-400">
            Average:{" "}
            {
              statistics.averageProgress
            }%
          </span>

        </div>

        <div className="mt-6 h-80">

          {chartData.length ===
          0 ? (

            <div className="flex h-full items-center justify-center text-slate-500">
              No project data available.
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={chartData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />

                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tick={{
                    fontSize: 11,
                  }}
                />

                <YAxis
                  domain={[0, 100]}
                  stroke="#64748b"
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      "#0f172a",
                    border:
                      "1px solid #334155",
                    borderRadius:
                      "12px",
                    color: "#fff",
                  }}
                  formatter={(
                    value
                  ) => [
                    `${value}%`,
                    "Progress",
                  ]}
                />

                <Bar
                  dataKey="progress"
                  fill="#06b6d4"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          )}

        </div>

      </div>

      {/* FUNDING PROJECTS */}

      {fundingProjects.length >
        0 && (

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold">
                Projects Requiring Funding
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Projects projected to exceed
                approved budgets
              </p>

            </div>

            <WalletCards
              size={22}
              className="text-red-400"
            />

          </div>

          <div className="mt-5 space-y-3">

            {fundingProjects
              .slice(0, 5)
              .map((project) => (

                <div
                  key={project.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-red-500/10 bg-red-500/5 p-4 md:flex-row md:items-center"
                >

                  <div>

                    <p className="font-semibold">
                      {project.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {project.location}
                    </p>

                  </div>

                  <div className="text-left md:text-right">

                    <p className="text-xs text-slate-500">
                      Additional Funding
                    </p>

                    <p className="font-bold text-red-400">
                      {formatMoney(
                        project.additionalFunding
                      )}
                    </p>

                  </div>

                </div>

              ))}

          </div>

        </div>

      )}

      {/* DEADLINES */}

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex items-center gap-3">

          <CalendarClock
            size={22}
            className="text-cyan-400"
          />

          <div>

            <h2 className="text-lg font-bold">
              Upcoming Deadlines
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Projects approaching completion
            </p>

          </div>

        </div>

        <div className="mt-5 space-y-3">

          {projects
            .filter(
              (p) =>
                p.status !==
                "COMPLETED"
            )
            .sort(
              (a, b) =>
                new Date(
                  a.endDate
                ) -
                new Date(
                  b.endDate
                )
            )
            .slice(0, 5)
            .map((project) => {

              const days = Math.ceil(
                (
                  new Date(
                    project.endDate
                  ).getTime() -
                  new Date().getTime()
                ) /
                  (1000 *
                    60 *
                    60 *
                    24)
              );

              return (
                <div
                  key={project.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 md:flex-row md:items-center"
                >

                  <div>

                    <p className="font-medium">
                      {project.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {project.location}
                    </p>

                  </div>

                  <div className="text-sm">

                    <span
                      className={
                        days <= 7
                          ? "font-bold text-red-400"
                          : days <=
                            30
                          ? "font-bold text-yellow-400"
                          : "text-emerald-400"
                      }
                    >
                      {days} days
                    </span>

                  </div>

                </div>
              );
            })}

        </div>

      </div>

    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>

        </div>

        <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
          <Icon size={22} />
        </div>

      </div>

    </div>
  );
}

function FinancialCard({
  title,
  value,
  icon: Icon,
  danger = false,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        danger
          ? "border-red-500/20 bg-red-500/5"
          : "border-slate-800 bg-slate-900"
      }`}
    >

      <div className="flex items-center gap-3">

        <div
          className={`rounded-xl p-3 ${
            danger
              ? "bg-red-500/10 text-red-400"
              : "bg-cyan-500/10 text-cyan-400"
          }`}
        >
          <Icon size={20} />
        </div>

        <div>

          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p
            className={`mt-1 text-2xl font-bold ${
              danger
                ? "text-red-400"
                : "text-white"
            }`}
          >
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;