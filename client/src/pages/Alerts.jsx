import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  RefreshCw,
  Search,
  ShieldAlert,
  Info,
} from "lucide-react";

import api from "../api/axios.js";

function Alerts() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  // ==========================================
  // FETCH PROJECTS
  // ==========================================

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const response = await api.get("/projects");

      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Alerts fetch error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("nexora_token");
        localStorage.removeItem("nexora_user");
        window.location.href = "/login";
        return;
      }
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
  // CREATE ALERTS
  // ==========================================

  const alerts = useMemo(() => {
    const generatedAlerts = [];

    const today = new Date();

    projects.forEach((project) => {
      // --------------------------------------
      // DELAYED
      // --------------------------------------

      if (project.status === "DELAYED") {
        generatedAlerts.push({
          id: `${project.id}-delayed`,
          projectId: project.id,
          project: project.name,
          location: project.location,
          type: "CRITICAL",
          title: "Project Delayed",
          message:
            "This project is currently delayed and requires immediate attention.",
          progress: project.progress,
          date: project.updatedAt,
          icon: ShieldAlert,
        });
      }

      // --------------------------------------
      // AT RISK
      // --------------------------------------

      if (project.status === "AT_RISK") {
        generatedAlerts.push({
          id: `${project.id}-risk`,
          projectId: project.id,
          project: project.name,
          location: project.location,
          type: "WARNING",
          title: "Project At Risk",
          message:
            "Project performance indicates a potential schedule or delivery risk.",
          progress: project.progress,
          date: project.updatedAt,
          icon: AlertTriangle,
        });
      }

      // --------------------------------------
      // LOW PROGRESS
      // --------------------------------------

      if (
        Number(project.progress || 0) < 30 &&
        project.status !== "COMPLETED"
      ) {
        generatedAlerts.push({
          id: `${project.id}-progress`,
          projectId: project.id,
          project: project.name,
          location: project.location,
          type: "INFO",
          title: "Low Project Progress",
          message:
            "Project progress is below 30%. Monitor execution closely.",
          progress: project.progress,
          date: project.updatedAt,
          icon: Info,
        });
      }

      // --------------------------------------
      // UPCOMING DEADLINE
      // --------------------------------------

      if (
        project.status !== "COMPLETED" &&
        project.endDate
      ) {
        const endDate = new Date(project.endDate);

        const difference =
          endDate.getTime() - today.getTime();

        const daysRemaining = Math.ceil(
          difference / (1000 * 60 * 60 * 24)
        );

        if (
          daysRemaining >= 0 &&
          daysRemaining <= 30
        ) {
          generatedAlerts.push({
            id: `${project.id}-deadline`,
            projectId: project.id,
            project: project.name,
            location: project.location,
            type: "DEADLINE",
            title: "Upcoming Project Deadline",
            message: `Project deadline is approaching. ${daysRemaining} day${
              daysRemaining !== 1 ? "s" : ""
            } remaining.`,
            progress: project.progress,
            date: project.endDate,
            daysRemaining,
            icon: CalendarClock,
          });
        }
      }
    });

    return generatedAlerts;
  }, [projects]);

  // ==========================================
  // FILTER ALERTS
  // ==========================================

  const filteredAlerts = useMemo(() => {
    const searchText = search.toLowerCase();

    return alerts.filter((alert) => {
      const matchesSearch =
        alert.project
          .toLowerCase()
          .includes(searchText) ||
        alert.location
          .toLowerCase()
          .includes(searchText) ||
        alert.title
          .toLowerCase()
          .includes(searchText);

      const matchesFilter =
        filter === "ALL" ||
        alert.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [alerts, search, filter]);

  // ==========================================
  // COUNTS
  // ==========================================

  const counts = useMemo(() => {
    return {
      all: alerts.length,

      critical: alerts.filter(
        (alert) => alert.type === "CRITICAL"
      ).length,

      warning: alerts.filter(
        (alert) => alert.type === "WARNING"
      ).length,

      deadline: alerts.filter(
        (alert) => alert.type === "DEADLINE"
      ).length,

      info: alerts.filter(
        (alert) => alert.type === "INFO"
      ).length,
    };
  }, [alerts]);

  // ==========================================
  // ALERT STYLE
  // ==========================================

  const getAlertStyle = (type) => {
    switch (type) {
      case "CRITICAL":
        return {
          container:
            "border-red-500/20 bg-red-500/5",
          icon:
            "bg-red-500/10 text-red-400",
          badge:
            "border-red-500/20 bg-red-500/10 text-red-400",
        };

      case "WARNING":
        return {
          container:
            "border-yellow-500/20 bg-yellow-500/5",
          icon:
            "bg-yellow-500/10 text-yellow-400",
          badge:
            "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
        };

      case "DEADLINE":
        return {
          container:
            "border-orange-500/20 bg-orange-500/5",
          icon:
            "bg-orange-500/10 text-orange-400",
          badge:
            "border-orange-500/20 bg-orange-500/10 text-orange-400",
        };

      default:
        return {
          container:
            "border-cyan-500/20 bg-cyan-500/5",
          icon:
            "bg-cyan-500/10 text-cyan-400",
          badge:
            "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
        };
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "Recently";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
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
              Loading monitoring alerts...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-10">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

        <div>
          <p className="text-sm font-semibold text-cyan-400">
            MONITORING CENTER
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Alerts & Warnings
          </h1>

          <p className="mt-2 text-slate-400">
            Monitor infrastructure risks, delays,
            deadlines and performance issues.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400 disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={
              refreshing ? "animate-spin" : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh Alerts"}
        </button>

      </div>

      {/* ALERT SUMMARY */}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">

        {/* ALL */}

        <button
          onClick={() => setFilter("ALL")}
          className={`rounded-2xl border p-5 text-left transition ${
            filter === "ALL"
              ? "border-cyan-500/50 bg-cyan-500/5"
              : "border-slate-800 bg-slate-900 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              All Alerts
            </p>

            <Bell
              size={20}
              className="text-cyan-400"
            />
          </div>

          <p className="mt-3 text-3xl font-bold">
            {counts.all}
          </p>
        </button>

        {/* CRITICAL */}

        <button
          onClick={() => setFilter("CRITICAL")}
          className={`rounded-2xl border p-5 text-left transition ${
            filter === "CRITICAL"
              ? "border-red-500/50 bg-red-500/5"
              : "border-slate-800 bg-slate-900 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Critical
            </p>

            <ShieldAlert
              size={20}
              className="text-red-400"
            />
          </div>

          <p className="mt-3 text-3xl font-bold">
            {counts.critical}
          </p>
        </button>

        {/* WARNING */}

        <button
          onClick={() => setFilter("WARNING")}
          className={`rounded-2xl border p-5 text-left transition ${
            filter === "WARNING"
              ? "border-yellow-500/50 bg-yellow-500/5"
              : "border-slate-800 bg-slate-900 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Warnings
            </p>

            <AlertTriangle
              size={20}
              className="text-yellow-400"
            />
          </div>

          <p className="mt-3 text-3xl font-bold">
            {counts.warning}
          </p>
        </button>

        {/* DEADLINE */}

        <button
          onClick={() => setFilter("DEADLINE")}
          className={`rounded-2xl border p-5 text-left transition ${
            filter === "DEADLINE"
              ? "border-orange-500/50 bg-orange-500/5"
              : "border-slate-800 bg-slate-900 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Deadlines
            </p>

            <CalendarClock
              size={20}
              className="text-orange-400"
            />
          </div>

          <p className="mt-3 text-3xl font-bold">
            {counts.deadline}
          </p>
        </button>

        {/* INFO */}

        <button
          onClick={() => setFilter("INFO")}
          className={`rounded-2xl border p-5 text-left transition ${
            filter === "INFO"
              ? "border-cyan-500/50 bg-cyan-500/5"
              : "border-slate-800 bg-slate-900 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Information
            </p>

            <Info
              size={20}
              className="text-cyan-400"
            />
          </div>

          <p className="mt-3 text-3xl font-bold">
            {counts.info}
          </p>
        </button>

      </div>

      {/* SEARCH */}

      <div className="mt-8 flex max-w-xl items-center rounded-xl border border-slate-800 bg-slate-900">

        <Search
          size={19}
          className="ml-4 text-slate-500"
        />

        <input
          type="text"
          placeholder="Search alerts or projects..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-600"
        />

      </div>

      {/* FILTER LABEL */}

      <div className="mt-5 flex items-center justify-between">

        <p className="text-sm text-slate-400">
          Showing{" "}
          <span className="font-semibold text-white">
            {filteredAlerts.length}
          </span>{" "}
          alert
          {filteredAlerts.length !== 1
            ? "s"
            : ""}
        </p>

        {filter !== "ALL" && (
          <button
            onClick={() => setFilter("ALL")}
            className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
          >
            Clear filter
          </button>
        )}

      </div>

      {/* ALERT LIST */}

      <div className="mt-5 space-y-4">

        {filteredAlerts.length === 0 ? (

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">

            <CheckCircle2
              size={45}
              className="mx-auto text-emerald-400"
            />

            <h2 className="mt-4 text-xl font-bold">
              No Active Alerts
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your infrastructure projects are
              currently within the monitored
              thresholds.
            </p>

          </div>

        ) : (

          filteredAlerts.map((alert) => {

            const style =
              getAlertStyle(alert.type);

            const Icon = alert.icon;

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border p-5 transition hover:border-slate-600 ${style.container}`}
              >

                <div className="flex flex-col gap-5 md:flex-row">

                  {/* ICON */}

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
                  >
                    <Icon size={23} />
                  </div>

                  {/* CONTENT */}

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-col justify-between gap-3 md:flex-row">

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="text-lg font-bold">
                            {alert.title}
                          </h2>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${style.badge}`}
                          >
                            {alert.type}
                          </span>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {alert.project}
                          {" • "}
                          {alert.location}
                        </p>

                      </div>

                      <p className="text-xs text-slate-500">
                        {formatDate(alert.date)}
                      </p>

                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-300">
                      {alert.message}
                    </p>

                    {/* PROGRESS */}

                    <div className="mt-5 max-w-xl">

                      <div className="mb-2 flex justify-between text-xs">

                        <span className="text-slate-500">
                          Project Progress
                        </span>

                        <span className="font-semibold text-cyan-400">
                          {alert.progress}%
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                        <div
                          className="h-full rounded-full bg-cyan-500 transition-all"
                          style={{
                            width: `${alert.progress}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* DEADLINE INFO */}

                    {alert.type === "DEADLINE" &&
                      alert.daysRemaining !==
                        undefined && (

                        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-2 text-xs font-semibold text-orange-400">

                          <CalendarClock
                            size={15}
                          />

                          {alert.daysRemaining} day
                          {alert.daysRemaining !==
                          1
                            ? "s"
                            : ""}{" "}
                          remaining

                        </div>
                      )}

                  </div>

                </div>

              </div>
            );
          })

        )}

      </div>

      {/* FOOTER */}

      <div className="mt-8 border-t border-slate-800 pt-5 text-xs text-slate-600">
        NEXORA monitoring engine automatically
        evaluates project status, progress and
        deadlines.
      </div>

    </div>
  );
}

export default Alerts;