import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  RefreshCw,
  Search,
  ShieldAlert,
  Info,
  WalletCards,
  ArrowRight,
} from "lucide-react";

import api from "../api/axios.js";

function Alerts() {
  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const urlFilter =
      params.get("filter");

    if (urlFilter === "FUNDING") {
      setFilter("FUNDING");
    }
  }, []);

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
        "Alerts fetch error:",
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

  const alerts = useMemo(() => {
    const generated = [];

    const today = new Date();

    projects.forEach((project) => {

      // ======================================
      // FUNDING
      // ======================================

      const budget = Number(
        project.budget || 0
      );

      const estimated =
        project.estimatedFinalCost !==
        null &&
        project.estimatedFinalCost !==
          undefined
          ? Number(
              project.estimatedFinalCost
            )
          : budget;

      const additionalFunding =
        Math.max(
          estimated - budget,
          0
        );

      if (
        budget > 0 &&
        additionalFunding > 0
      ) {
        const overrunPercentage =
          (additionalFunding /
            budget) *
          100;

        const fundingType =
          overrunPercentage > 15
            ? "CRITICAL"
            : "FUNDING";

        generated.push({
          id: `${project.id}-funding`,
          projectId: project.id,
          project: project.name,
          location: project.location,
          type: fundingType,
          category: "FUNDING",
          title:
            overrunPercentage > 15
              ? "Critical Funding Required"
              : "Additional Funding Required",
          message:
            "This project is projected to exceed the approved budget and requires additional funding.",
          value: additionalFunding,
          relevantValue:
            `₹${(
              additionalFunding /
              10000000
            ).toFixed(1)} Cr`,
          date: project.updatedAt,
          icon: WalletCards,
        });
      }

      // ======================================
      // DELAYED
      // ======================================

      if (
        project.status ===
        "DELAYED"
      ) {
        generated.push({
          id: `${project.id}-delayed`,
          projectId: project.id,
          project: project.name,
          location: project.location,
          type: "CRITICAL",
          category: "SCHEDULE",
          title:
            "Delayed Project",
          message:
            "This project is currently delayed and requires immediate attention.",
          value: project.progress,
          relevantValue:
            `${project.progress}% progress`,
          date: project.updatedAt,
          icon: ShieldAlert,
        });
      }

      // ======================================
      // AT RISK
      // ======================================

      if (
        project.status ===
        "AT_RISK"
      ) {
        generated.push({
          id: `${project.id}-risk`,
          projectId: project.id,
          project: project.name,
          location: project.location,
          type: "WARNING",
          category: "RISK",
          title:
            "Project At Risk",
          message:
            "Project performance indicates a potential schedule or delivery risk.",
          value: project.progress,
          relevantValue:
            `${project.progress}% progress`,
          date: project.updatedAt,
          icon: AlertTriangle,
        });
      }

      // ======================================
      // LOW PROGRESS
      // ======================================

      if (
        Number(
          project.progress || 0
        ) < 30 &&
        project.status !==
          "COMPLETED"
      ) {
        generated.push({
          id: `${project.id}-progress`,
          projectId: project.id,
          project: project.name,
          location: project.location,
          type: "INFO",
          category: "PROGRESS",
          title:
            "Low Project Progress",
          message:
            "Project progress is below 30%. Monitor execution closely.",
          value: project.progress,
          relevantValue:
            `${project.progress}% progress`,
          date: project.updatedAt,
          icon: Info,
        });
      }

      // ======================================
      // DEADLINE
      // ======================================

      if (
        project.status !==
          "COMPLETED" &&
        project.endDate
      ) {
        const endDate =
          new Date(
            project.endDate
          );

        const difference =
          endDate.getTime() -
          today.getTime();

        const daysRemaining =
          Math.ceil(
            difference /
              (1000 *
                60 *
                60 *
                24)
          );

        if (
          daysRemaining >= 0 &&
          daysRemaining <= 30
        ) {
          generated.push({
            id: `${project.id}-deadline`,
            projectId: project.id,
            project:
              project.name,
            location:
              project.location,
            type: "DEADLINE",
            category: "SCHEDULE",
            title:
              "Upcoming Deadline",
            message: `Project deadline is approaching. ${daysRemaining} day${
              daysRemaining !== 1
                ? "s"
                : ""
            } remaining.`,
            value:
              daysRemaining,
            relevantValue:
              `${daysRemaining} days remaining`,
            date:
              project.endDate,
            icon: CalendarClock,
          });
        }
      }

    });

    return generated;
  }, [projects]);

  const filteredAlerts =
    useMemo(() => {
      const text =
        search.toLowerCase();

      return alerts.filter(
        (alert) => {

          const matchesSearch =
            alert.project
              .toLowerCase()
              .includes(text) ||
            alert.location
              .toLowerCase()
              .includes(text) ||
            alert.title
              .toLowerCase()
              .includes(text);

          let matchesFilter = true;

          if (filter === "CRITICAL") {
            matchesFilter =
              alert.type ===
              "CRITICAL";
          } else if (
            filter === "FUNDING"
          ) {
            matchesFilter =
              alert.category ===
              "FUNDING";
          } else if (
            filter === "SCHEDULE"
          ) {
            matchesFilter =
              alert.category ===
              "SCHEDULE";
          } else if (
            filter === "PROGRESS"
          ) {
            matchesFilter =
              alert.category ===
              "PROGRESS";
          } else if (
            filter === "RISK"
          ) {
            matchesFilter =
              alert.category ===
              "RISK";
          }

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      alerts,
      search,
      filter,
    ]);

  const counts = useMemo(
    () => ({
      all: alerts.length,

      critical:
        alerts.filter(
          (a) =>
            a.type ===
            "CRITICAL"
        ).length,

      funding:
        alerts.filter(
          (a) =>
            a.category ===
            "FUNDING"
        ).length,

      schedule:
        alerts.filter(
          (a) =>
            a.category ===
            "SCHEDULE"
        ).length,

      progress:
        alerts.filter(
          (a) =>
            a.category ===
            "PROGRESS"
        ).length,

      risk:
        alerts.filter(
          (a) =>
            a.category ===
            "RISK"
        ).length,
    }),
    [alerts]
  );

  const getStyle = (alert) => {

    if (
      alert.type ===
      "CRITICAL"
    ) {
      return {
        container:
          "border-red-500/20 bg-red-500/5",
        icon:
          "bg-red-500/10 text-red-400",
        badge:
          "border-red-500/20 bg-red-500/10 text-red-400",
      };
    }

    if (
      alert.category ===
      "FUNDING"
    ) {
      return {
        container:
          "border-orange-500/20 bg-orange-500/5",
        icon:
          "bg-orange-500/10 text-orange-400",
        badge:
          "border-orange-500/20 bg-orange-500/10 text-orange-400",
      };
    }

    if (
      alert.type ===
      "WARNING"
    ) {
      return {
        container:
          "border-yellow-500/20 bg-yellow-500/5",
        icon:
          "bg-yellow-500/10 text-yellow-400",
        badge:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
      };
    }

    if (
      alert.type ===
      "DEADLINE"
    ) {
      return {
        container:
          "border-orange-500/20 bg-orange-500/5",
        icon:
          "bg-orange-500/10 text-orange-400",
        badge:
          "border-orange-500/20 bg-orange-500/10 text-orange-400",
      };
    }

    return {
      container:
        "border-cyan-500/20 bg-cyan-500/5",
      icon:
        "bg-cyan-500/10 text-cyan-400",
      badge:
        "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
    };
  };

  const viewProject = (
    projectId
  ) => {
    window.location.href =
      `/projects?project=${projectId}`;
  };

  const formatDate = (date) => {
    if (!date)
      return "Recently";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    await fetchProjects();

    setRefreshing(false);
  };

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
            Monitor funding, schedule,
            risk and project performance.
          </p>

        </div>

        <button
          onClick={handleRefresh}
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
            : "Refresh Alerts"}

        </button>

      </div>

      {/* SUMMARY */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

        <FilterCard
          active={
            filter === "ALL"
          }
          label="All"
          count={counts.all}
          icon={Bell}
          onClick={() =>
            setFilter("ALL")
          }
        />

        <FilterCard
          active={
            filter ===
            "CRITICAL"
          }
          label="Critical"
          count={
            counts.critical
          }
          icon={ShieldAlert}
          onClick={() =>
            setFilter(
              "CRITICAL"
            )
          }
        />

        <FilterCard
          active={
            filter ===
            "FUNDING"
          }
          label="Funding"
          count={counts.funding}
          icon={WalletCards}
          onClick={() =>
            setFilter(
              "FUNDING"
            )
          }
        />

        <FilterCard
          active={
            filter ===
            "SCHEDULE"
          }
          label="Schedule"
          count={
            counts.schedule
          }
          icon={CalendarClock}
          onClick={() =>
            setFilter(
              "SCHEDULE"
            )
          }
        />

        <FilterCard
          active={
            filter ===
            "PROGRESS"
          }
          label="Progress"
          count={
            counts.progress
          }
          icon={Info}
          onClick={() =>
            setFilter(
              "PROGRESS"
            )
          }
        />

        <FilterCard
          active={
            filter === "RISK"
          }
          label="Risk"
          count={counts.risk}
          icon={
            AlertTriangle
          }
          onClick={() =>
            setFilter("RISK")
          }
        />

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
            setSearch(
              e.target.value
            )
          }
          className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-600"
        />

      </div>

      {/* LIST */}

      <div className="mt-6 space-y-4">

        {filteredAlerts.length ===
        0 ? (

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">

            <CheckCircle2
              size={45}
              className="mx-auto text-emerald-400"
            />

            <h2 className="mt-4 text-xl font-bold">
              No Active Alerts
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your infrastructure projects
              are currently within the
              monitored thresholds.
            </p>

          </div>

        ) : (

          filteredAlerts.map(
            (alert) => {

              const style =
                getStyle(alert);

              const Icon =
                alert.icon;

              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl border p-5 ${style.container}`}
                >

                  <div className="flex flex-col gap-5 lg:flex-row">

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
                    >
                      <Icon size={23} />
                    </div>

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
                          {formatDate(
                            alert.date
                          )}
                        </p>

                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-300">
                        {alert.message}
                      </p>

                      {alert.relevantValue && (
                        <div className="mt-4 inline-flex rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-cyan-400">
                          {alert.relevantValue}
                        </div>
                      )}

                      <div className="mt-5">

                        <button
                          onClick={() =>
                            viewProject(
                              alert.projectId
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                        >
                          View Project
                          <ArrowRight
                            size={16}
                          />
                        </button>

                      </div>

                    </div>

                  </div>

                </div>
              );
            }
          )

        )}

      </div>

      <div className="mt-8 border-t border-slate-800 pt-5 text-xs text-slate-600">
        NEXORA monitoring engine automatically
        evaluates financial projections,
        project status, progress and deadlines.
      </div>

    </div>
  );
}

function FilterCard({
  active,
  label,
  count,
  icon: Icon,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-cyan-500/50 bg-cyan-500/5"
          : "border-slate-800 bg-slate-900 hover:border-slate-700"
      }`}
    >

      <div className="flex items-center justify-between">

        <span className="text-sm text-slate-400">
          {label}
        </span>

        <Icon
          size={19}
          className="text-cyan-400"
        />

      </div>

      <p className="mt-2 text-2xl font-bold">
        {count}
      </p>

    </button>
  );
}

export default Alerts;