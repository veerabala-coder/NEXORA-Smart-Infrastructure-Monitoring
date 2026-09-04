import { useEffect, useMemo, useState } from "react";

import {
  FileText,
  Search,
  RefreshCw,
  Download,
  Printer,
  FolderKanban,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  X,
} from "lucide-react";

import api from "../api/axios.js";

function Reports() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showReport, setShowReport] = useState(false);

  // ==========================================
  // FETCH PROJECTS
  // ==========================================

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const response = await api.get("/projects");

      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Reports fetch error:", error);

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
  // FILTER PROJECTS
  // ==========================================

  const filteredProjects = useMemo(() => {
    const searchText = search.toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        project.name
          .toLowerCase()
          .includes(searchText) ||
        project.location
          .toLowerCase()
          .includes(searchText) ||
        (project.manager || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  // ==========================================
  // REPORT STATISTICS
  // ==========================================

  const statistics = useMemo(() => {
    const total = filteredProjects.length;

    const completed = filteredProjects.filter(
      (project) =>
        project.status === "COMPLETED"
    ).length;

    const delayed = filteredProjects.filter(
      (project) =>
        project.status === "DELAYED"
    ).length;

    const atRisk = filteredProjects.filter(
      (project) =>
        project.status === "AT_RISK"
    ).length;

    const onTrack = filteredProjects.filter(
      (project) =>
        project.status === "ON_TRACK"
    ).length;

    const averageProgress =
      total > 0
        ? Math.round(
            filteredProjects.reduce(
              (sum, project) =>
                sum +
                Number(project.progress || 0),
              0
            ) / total
          )
        : 0;

    const totalBudget =
      filteredProjects.reduce(
        (sum, project) =>
          sum + Number(project.budget || 0),
        0
      );

    return {
      total,
      completed,
      delayed,
      atRisk,
      onTrack,
      averageProgress,
      totalBudget,
    };
  }, [filteredProjects]);

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatBudget = (amount) => {
    if (!amount) {
      return "₹0";
    }

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
  // EXPORT CSV
  // ==========================================

  const exportCSV = () => {
    if (filteredProjects.length === 0) {
      alert("No projects available to export.");
      return;
    }

    const headers = [
      "Project Name",
      "Location",
      "Manager",
      "Budget",
      "Progress",
      "Status",
      "Start Date",
      "End Date",
    ];

    const rows = filteredProjects.map(
      (project) => [
        project.name,
        project.location,
        project.manager || "Not assigned",
        project.budget || 0,
        `${project.progress}%`,
        formatStatus(project.status),
        new Date(
          project.startDate
        ).toLocaleDateString("en-IN"),
        new Date(
          project.endDate
        ).toLocaleDateString("en-IN"),
      ]
    );

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value);

            return `"${text.replaceAll(
              '"',
              '""'
            )}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `NEXORA_Project_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ==========================================
  // PRINT REPORT
  // ==========================================

  const printReport = () => {
    setShowReport(true);

    setTimeout(() => {
      window.print();
    }, 300);
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
              Preparing project reports...
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

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center print:hidden">

        <div>
          <p className="text-sm font-semibold text-cyan-400">
            REPORTING CENTER
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Project Reports
          </h1>

          <p className="mt-2 text-slate-400">
            Generate and export infrastructure
            project monitoring reports.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
          >
            <Download size={18} />

            Export CSV
          </button>

          <button
            onClick={printReport}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Printer size={18} />

            Print Report
          </button>

        </div>

      </div>

      {/* REPORT HEADER FOR PRINT */}

      <div className="hidden print:block">
        <h1 className="text-3xl font-bold">
          NEXORA Project Monitoring Report
        </h1>

        <p className="mt-2 text-sm">
          Generated on{" "}
          {new Date().toLocaleDateString(
            "en-IN"
          )}
        </p>
      </div>

      {/* SEARCH + FILTER */}

      <div className="mt-8 flex flex-col gap-4 md:flex-row print:hidden">

        <div className="flex flex-1 items-center rounded-xl border border-slate-800 bg-slate-900">

          <Search
            size={19}
            className="ml-4 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search project, location or manager..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-600"
          />

        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
        >
          <option value="ALL">
            All Status
          </option>

          <option value="ON_TRACK">
            On Track
          </option>

          <option value="AT_RISK">
            At Risk
          </option>

          <option value="DELAYED">
            Delayed
          </option>

          <option value="COMPLETED">
            Completed
          </option>
        </select>

      </div>

      {/* SUMMARY CARDS */}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
              <FolderKanban size={20} />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Total Projects
              </p>

              <p className="mt-1 text-2xl font-bold">
                {statistics.total}
              </p>
            </div>

          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <TrendingUp size={20} />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Average Progress
              </p>

              <p className="mt-1 text-2xl font-bold">
                {statistics.averageProgress}%
              </p>
            </div>

          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
              <AlertTriangle size={20} />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Delayed
              </p>

              <p className="mt-1 text-2xl font-bold">
                {statistics.delayed}
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
              <p className="text-xs text-slate-500">
                At Risk
              </p>

              <p className="mt-1 text-2xl font-bold">
                {statistics.atRisk}
              </p>
            </div>

          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
              <IndianRupee size={20} />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Total Budget
              </p>

              <p className="mt-1 text-2xl font-bold">
                {formatBudget(
                  statistics.totalBudget
                )}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* REPORT TABLE */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex items-center justify-between print:hidden">

          <div>
            <h2 className="text-lg font-bold">
              Infrastructure Project Report
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredProjects.length} project
              {filteredProjects.length !== 1
                ? "s"
                : ""}{" "}
              included in this report
            </p>
          </div>

          <FileText
            size={22}
            className="text-cyan-400"
          />

        </div>

        <div className="mt-6 overflow-x-auto">

          {filteredProjects.length === 0 ? (

            <div className="py-12 text-center">

              <FolderKanban
                size={40}
                className="mx-auto text-slate-600"
              />

              <p className="mt-4 text-slate-500">
                No projects match your filters.
              </p>

            </div>

          ) : (

            <table className="w-full min-w-[1000px] text-left">

              <thead>

                <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">

                  <th className="pb-4">
                    Project
                  </th>

                  <th className="pb-4">
                    Location
                  </th>

                  <th className="pb-4">
                    Budget
                  </th>

                  <th className="pb-4">
                    Progress
                  </th>

                  <th className="pb-4">
                    Status
                  </th>

                  <th className="pb-4">
                    Start
                  </th>

                  <th className="pb-4">
                    End
                  </th>

                  <th className="pb-4">
                    Manager
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredProjects.map(
                  (project) => (

                    <tr
                      key={project.id}
                      className="border-b border-slate-800/70"
                    >

                      <td className="py-5">

                        <p className="font-semibold text-white">
                          {project.name}
                        </p>

                        <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                          {project.description ||
                            "No description"}
                        </p>

                      </td>

                      <td className="py-5 text-sm text-slate-400">
                        {project.location}
                      </td>

                      <td className="py-5 text-sm font-medium text-slate-300">
                        {formatBudget(
                          Number(
                            project.budget || 0
                          )
                        )}
                      </td>

                      <td className="py-5">

                        <div className="flex items-center gap-3">

                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-800">

                            <div
                              className="h-full rounded-full bg-cyan-500"
                              style={{
                                width: `${project.progress}%`,
                              }}
                            />

                          </div>

                          <span className="text-xs font-semibold text-cyan-400">
                            {project.progress}%
                          </span>

                        </div>

                      </td>

                      <td className="py-5">

                        <span
                          className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            project.status
                          )}`}
                        >
                          {formatStatus(
                            project.status
                          )}
                        </span>

                      </td>

                      <td className="py-5 text-sm text-slate-400">
                        {new Date(
                          project.startDate
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>

                      <td className="py-5 text-sm text-slate-400">
                        {new Date(
                          project.endDate
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>

                      <td className="py-5 text-sm text-slate-400">
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

      {/* REPORT DETAILS */}

      <div className="mt-6 grid gap-5 md:grid-cols-2">

        {/* PROJECT HEALTH */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-lg font-bold">
            Project Health
          </h2>

          <div className="mt-5 space-y-4">

            {/* ON TRACK */}

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-400">
                On Track
              </span>

              <span className="font-semibold text-emerald-400">
                {statistics.onTrack}
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${
                    statistics.total
                      ? (statistics.onTrack /
                          statistics.total) *
                        100
                      : 0
                  }%`,
                }}
              />

            </div>

            {/* AT RISK */}

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-400">
                At Risk
              </span>

              <span className="font-semibold text-yellow-400">
                {statistics.atRisk}
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-yellow-500"
                style={{
                  width: `${
                    statistics.total
                      ? (statistics.atRisk /
                          statistics.total) *
                        100
                      : 0
                  }%`,
                }}
              />

            </div>

            {/* DELAYED */}

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-400">
                Delayed
              </span>

              <span className="font-semibold text-red-400">
                {statistics.delayed}
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-red-500"
                style={{
                  width: `${
                    statistics.total
                      ? (statistics.delayed /
                          statistics.total) *
                        100
                      : 0
                  }%`,
                }}
              />

            </div>

            {/* COMPLETED */}

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-400">
                Completed
              </span>

              <span className="font-semibold text-cyan-400">
                {statistics.completed}
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-cyan-500"
                style={{
                  width: `${
                    statistics.total
                      ? (statistics.completed /
                          statistics.total) *
                        100
                      : 0
                  }%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* REPORT SUMMARY */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-lg font-bold">
            Report Summary
          </h2>

          <div className="mt-5 space-y-4 text-sm">

            <div className="flex justify-between border-b border-slate-800 pb-3">

              <span className="text-slate-500">
                Total projects
              </span>

              <span className="font-semibold">
                {statistics.total}
              </span>

            </div>

            <div className="flex justify-between border-b border-slate-800 pb-3">

              <span className="text-slate-500">
                Average progress
              </span>

              <span className="font-semibold text-cyan-400">
                {statistics.averageProgress}%
              </span>

            </div>

            <div className="flex justify-between border-b border-slate-800 pb-3">

              <span className="text-slate-500">
                Completed projects
              </span>

              <span className="font-semibold text-emerald-400">
                {statistics.completed}
              </span>

            </div>

            <div className="flex justify-between border-b border-slate-800 pb-3">

              <span className="text-slate-500">
                Projects requiring attention
              </span>

              <span className="font-semibold text-red-400">
                {statistics.delayed +
                  statistics.atRisk}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-500">
                Total monitored budget
              </span>

              <span className="font-semibold">
                {formatBudget(
                  statistics.totalBudget
                )}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* PRINT CLOSE BUTTON */}

      {showReport && (
        <div className="fixed bottom-6 right-6 z-50 print:hidden">

          <button
            onClick={() =>
              setShowReport(false)
            }
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 shadow-xl hover:bg-slate-800"
          >
            <X size={17} />

            Close
          </button>

        </div>
      )}

      {/* FOOTER */}

      <div className="mt-8 border-t border-slate-800 pt-5 text-xs text-slate-600 print:hidden">
        NEXORA Smart Infrastructure Monitoring
        Platform • Project Reporting Module
      </div>

    </div>
  );
}

export default Reports;