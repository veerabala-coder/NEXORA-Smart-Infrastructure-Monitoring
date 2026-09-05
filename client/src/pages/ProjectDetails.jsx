import { useEffect, useState } from "react";

import {
  X,
  MapPin,
  CalendarDays,
  IndianRupee,
  UserRound,
  ShieldAlert,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Activity,
  WalletCards,
  TrendingUp,
} from "lucide-react";

import api from "../api/axios.js";

function ProjectDetails({
  projectId,
  onClose,
}) {
  const [project, setProject] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          `/projects/${projectId}`
        );

      setProject(response.data.project);
    } catch (err) {
      console.error(
        "Project details error:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        localStorage.removeItem(
          "nexora_token"
        );
        localStorage.removeItem(
          "nexora_user"
        );

        window.location.href =
          "/login";

        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load project details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const formatMoney = (value) => {
    const amount = Number(value || 0);

    if (amount >= 10000000) {
      return `₹${(
        amount / 10000000
      ).toFixed(1)} Cr`;
    }

    if (amount >= 100000) {
      return `₹${(
        amount / 100000
      ).toFixed(1)} L`;
    }

    return `₹${amount.toLocaleString(
      "en-IN"
    )}`;
  };

  const formatDate = (value) => {
    if (!value) return "Not available";

    return new Date(
      value
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatStatus = (status) =>
    String(status || "")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );

  const financialStatusStyle = {
    WITHIN_BUDGET:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",

    BUDGET_WATCH:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",

    FUNDING_RISK:
      "border-orange-500/30 bg-orange-500/10 text-orange-400",

    CRITICAL_FUNDING_REQUIRED:
      "border-red-500/30 bg-red-500/10 text-red-400",
  };

  const riskStyle = {
    LOW:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",

    MEDIUM:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",

    HIGH:
      "border-orange-500/30 bg-orange-500/10 text-orange-400",

    CRITICAL:
      "border-red-500/30 bg-red-500/10 text-red-400",
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
          <Activity
            size={35}
            className="mx-auto animate-spin text-cyan-400"
          />

          <p className="mt-4 text-slate-400">
            Loading project intelligence...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-slate-900 p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Project Details
            </h2>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X size={21} />
            </button>
          </div>

          <p className="mt-6 text-red-400">
            {error ||
              "Project not found."}
          </p>
        </div>
      </div>
    );
  }

  const milestones =
    Array.isArray(project.milestones)
      ? project.milestones
      : [];

  const risks =
    Array.isArray(project.risks)
      ? project.risks
      : [];

  const activities =
    Array.isArray(project.activities)
      ? project.activities
      : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">

        {/* HEADER */}

        <div className="sticky top-0 z-10 rounded-t-3xl border-b border-slate-800 bg-slate-950/95 p-6 backdrop-blur">

          <div className="flex items-start justify-between gap-5">

            <div>
              <p className="text-sm font-semibold text-cyan-400">
                PROJECT INTELLIGENCE
              </p>

              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                {project.name}
              </h1>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">

                <span className="flex items-center gap-2">
                  <MapPin
                    size={16}
                    className="text-cyan-400"
                  />
                  {project.location}
                </span>

                <span>
                  Project ID: #{project.id}
                </span>

              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-slate-700 p-3 text-slate-400 hover:border-cyan-500 hover:text-white"
            >
              <X size={22} />
            </button>

          </div>

        </div>

        <div className="space-y-6 p-6">

          {/* OVERVIEW */}

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            <InfoCard
              icon={MapPin}
              label="Location"
              value={project.location}
            />

            <InfoCard
              icon={UserRound}
              label="Project Manager"
              value={
                project.manager ||
                "Not assigned"
              }
            />

            <InfoCard
              icon={CalendarDays}
              label="Start Date"
              value={formatDate(
                project.startDate
              )}
            />

            <InfoCard
              icon={CalendarDays}
              label="Expected Completion"
              value={formatDate(
                project.endDate
              )}
            />

          </section>

          {/* DESCRIPTION + STATUS */}

          <section className="grid gap-5 xl:grid-cols-3">

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">

              <h2 className="text-lg font-bold">
                Project Overview
              </h2>

              <p className="mt-4 leading-7 text-slate-400">
                {project.description ||
                  "No project description available."}
              </p>

              <div className="mt-6">

                <div className="mb-2 flex justify-between">

                  <span className="text-sm text-slate-500">
                    Project Progress
                  </span>

                  <span className="font-bold text-cyan-400">
                    {project.progress}%
                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all"
                    style={{
                      width: `${project.progress}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-500">
                Operational Status
              </p>

              <div className="mt-3">

                <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-400">
                  {formatStatus(
                    project.status
                  )}
                </span>

              </div>

              <p className="mt-6 text-sm text-slate-500">
                Financial Status
              </p>

              <span
                className={`mt-3 inline-flex rounded-full border px-4 py-2 text-sm font-bold ${
                  financialStatusStyle[
                    project.financialStatus
                  ]
                }`}
              >
                {project.financialStatus ===
                "WITHIN_BUDGET"
                  ? "🟢 Within Budget"
                  : project.financialStatus ===
                    "BUDGET_WATCH"
                  ? "🟡 Budget Watch"
                  : project.financialStatus ===
                    "FUNDING_RISK"
                  ? "🟠 Funding Risk"
                  : "🔴 Critical Funding Required"}
              </span>

            </div>

          </section>

          {/* FINANCIAL */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

              <div>
                <p className="text-sm font-semibold text-cyan-400">
                  FINANCIAL MONITORING
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Financial Overview
                </h2>
              </div>

              <span
                className={`rounded-full border px-4 py-2 text-sm font-bold ${
                  riskStyle[
                    project.riskLevel
                  ]
                }`}
              >
                {project.riskLevel ===
                "CRITICAL"
                  ? "🔴"
                  : project.riskLevel ===
                    "HIGH"
                  ? "🟠"
                  : project.riskLevel ===
                    "MEDIUM"
                  ? "🟡"
                  : "🟢"}{" "}
                {project.riskLevel} RISK
              </span>

            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <FinancialCard
                label="Approved Budget"
                value={formatMoney(
                  project.approvedBudget
                )}
              />

              <FinancialCard
                label="Amount Spent"
                value={formatMoney(
                  project.amountSpent
                )}
              />

              <FinancialCard
                label="Remaining Budget"
                value={formatMoney(
                  project.remainingBudget
                )}
              />

              <FinancialCard
                label="Estimated Final Cost"
                value={formatMoney(
                  project.estimatedFinalCost
                )}
              />

            </div>

            <div className="mt-6">

              <div className="mb-2 flex justify-between text-sm">

                <span className="text-slate-500">
                  Budget Utilization
                </span>

                <span className="font-semibold text-cyan-400">
                  {project.budgetUtilization}%
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                <div
                  className={`h-full rounded-full ${
                    project.budgetUtilization >
                    100
                      ? "bg-red-500"
                      : "bg-cyan-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      project.budgetUtilization,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

            {/* FUNDING WARNING */}

            {project.additionalFunding >
              0 ? (

              <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">

                <div className="flex items-start gap-4">

                  <ShieldAlert
                    size={26}
                    className="mt-1 shrink-0 text-red-400"
                  />

                  <div>

                    <h3 className="font-bold text-red-400">
                      🚨 ADDITIONAL FUNDING REQUIRED
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      This project is projected
                      to exceed the approved
                      budget and requires
                      additional funding.
                    </p>

                    <p className="mt-4 text-2xl font-bold text-red-400">
                      {formatMoney(
                        project.additionalFunding
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Projected overrun:{" "}
                      {
                        project.overrunPercentage
                      }
                      %
                    </p>

                  </div>

                </div>

              </div>

            ) : (

              <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">

                <div className="flex items-center gap-3">

                  <CheckCircle2
                    className="text-emerald-400"
                    size={25}
                  />

                  <div>

                    <h3 className="font-bold text-emerald-400">
                      🟢 WITHIN BUDGET
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Current projection remains
                      within the approved budget.
                    </p>

                  </div>

                </div>

              </div>

            )}

          </section>

          {/* MILESTONES */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center gap-3">

              <CheckCircle2
                className="text-cyan-400"
                size={22}
              />

              <h2 className="text-xl font-bold">
                Project Milestones
              </h2>

            </div>

            <div className="mt-6 space-y-4">

              {milestones.length ===
              0 ? (

                <p className="text-sm text-slate-500">
                  No milestones recorded.
                </p>

              ) : (

                milestones.map(
                  (milestone, index) => {

                    const completed =
                      milestone.status ===
                      "COMPLETED";

                    const inProgress =
                      milestone.status ===
                      "IN_PROGRESS";

                    return (
                      <div
                        key={index}
                        className="flex items-start gap-4"
                      >

                        <div
                          className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            completed
                              ? "bg-emerald-500/10 text-emerald-400"
                              : inProgress
                              ? "bg-cyan-500/10 text-cyan-400"
                              : "bg-slate-800 text-slate-500"
                          }`}
                        >

                          {completed ? (
                            <CheckCircle2
                              size={17}
                            />
                          ) : inProgress ? (
                            <Activity
                              size={17}
                            />
                          ) : (
                            <Clock3
                              size={17}
                            />
                          )}

                        </div>

                        <div className="flex-1 border-b border-slate-800 pb-4">

                          <div className="flex flex-col justify-between gap-2 sm:flex-row">

                            <p className="font-semibold">
                              {milestone.name}
                            </p>

                            <span className="text-xs font-semibold text-slate-500">
                              {formatStatus(
                                milestone.status
                              )}
                            </span>

                          </div>

                          {milestone.date && (
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(
                                milestone.date
                              )}
                            </p>
                          )}

                        </div>

                      </div>
                    );
                  }
                )

              )}

            </div>

          </section>

          {/* RISKS + ISSUES */}

          <section className="grid gap-5 lg:grid-cols-2">

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="flex items-center gap-3">

                <AlertTriangle
                  size={22}
                  className="text-yellow-400"
                />

                <h2 className="text-xl font-bold">
                  Risk Analysis
                </h2>

              </div>

              <div className="mt-5 space-y-3">

                {risks.length ===
                0 ? (

                  <p className="text-sm text-slate-500">
                    No specific risks recorded.
                  </p>

                ) : (

                  risks.map(
                    (risk, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                      >

                        <div className="flex justify-between gap-3">

                          <p className="font-medium">
                            {risk.name}
                          </p>

                          <span className="text-xs font-bold text-orange-400">
                            {risk.level ||
                              "MEDIUM"}
                          </span>

                        </div>

                        {risk.description && (
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {risk.description}
                          </p>
                        )}

                      </div>
                    )
                  )

                )}

              </div>

            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="flex items-center gap-3">

                <ShieldAlert
                  size={22}
                  className="text-red-400"
                />

                <h2 className="text-xl font-bold">
                  Current Issues
                </h2>

              </div>

              <p className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-7 text-slate-400">
                {project.issues ||
                  "No current issues reported."}
              </p>

            </div>

          </section>

          {/* RECENT ACTIVITY */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center gap-3">

              <Activity
                size={22}
                className="text-cyan-400"
              />

              <h2 className="text-xl font-bold">
                Recent Project Activity
              </h2>

            </div>

            <div className="mt-6 space-y-4">

              {activities.length ===
              0 ? (

                <p className="text-sm text-slate-500">
                  No recent activity recorded.
                </p>

              ) : (

                activities.map(
                  (activity, index) => (
                    <div
                      key={index}
                      className="flex gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4"
                    >

                      <div className="mt-1">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                          <Activity
                            size={17}
                          />
                        </div>

                      </div>

                      <div>

                        <p className="font-medium">
                          {activity.title ||
                            activity.message ||
                            "Project activity"}
                        </p>

                        {activity.description && (
                          <p className="mt-1 text-sm text-slate-500">
                            {
                              activity.description
                            }
                          </p>
                        )}

                        {activity.date && (
                          <p className="mt-2 text-xs text-slate-600">
                            {formatDate(
                              activity.date
                            )}
                          </p>
                        )}

                      </div>

                    </div>
                  )
                )

              )}

            </div>

          </section>

        </div>
      </div>
    </div>
  );
}

// ======================================================
// SMALL COMPONENTS
// ======================================================

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
          <Icon size={19} />
        </div>

        <div>

          <p className="text-xs text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-200">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

function FinancialCard({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-white">
        {value}
      </p>

    </div>
  );
}

export default ProjectDetails;