import { useEffect, useMemo, useState } from "react";

import {
  MapPin,
  Search,
  RefreshCw,
  Navigation,
  FolderKanban,
  CalendarDays,
  IndianRupee,
  Activity,
  X,
} from "lucide-react";

import api from "../api/axios.js";

function InfrastructureMap() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] =
    useState(null);

  // ==========================================
  // FETCH PROJECTS
  // ==========================================

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const response = await api.get("/projects");

      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Map fetch error:", error);

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
      return (
        project.name
          .toLowerCase()
          .includes(searchText) ||
        project.location
          .toLowerCase()
          .includes(searchText) ||
        (project.manager || "")
          .toLowerCase()
          .includes(searchText)
      );
    });
  }, [projects, search]);

  // ==========================================
  // STATUS COLOR
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
      case "ON_TRACK":
        return "bg-emerald-400";

      case "AT_RISK":
        return "bg-yellow-400";

      case "DELAYED":
        return "bg-red-400";

      case "COMPLETED":
        return "bg-cyan-400";

      default:
        return "bg-slate-400";
    }
  };

  // ==========================================
  // STATUS TEXT
  // ==========================================

  const getStatusText = (status) => {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // ==========================================
  // STATUS BADGE
  // ==========================================

  const getStatusBadge = (status) => {
    switch (status) {
      case "ON_TRACK":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

      case "AT_RISK":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

      case "DELAYED":
        return "border-red-500/20 bg-red-500/10 text-red-400";

      case "COMPLETED":
        return "border-cyan-500/20 bg-cyan-500/10 text-cyan-400";

      default:
        return "border-slate-500/20 bg-slate-500/10 text-slate-400";
    }
  };

  // ==========================================
  // MAP MARKER POSITION
  // ==========================================

  const getMarkerPosition = (index, total) => {
    const positions = [
      { top: "22%", left: "18%" },
      { top: "38%", left: "42%" },
      { top: "18%", left: "67%" },
      { top: "58%", left: "25%" },
      { top: "68%", left: "52%" },
      { top: "42%", left: "78%" },
      { top: "75%", left: "75%" },
      { top: "30%", left: "55%" },
      { top: "62%", left: "68%" },
      { top: "48%", left: "12%" },
    ];

    return (
      positions[index % positions.length] || {
        top: `${20 + (index * 13) % 65}%`,
        left: `${15 + (index * 19) % 70}%`,
      }
    );
  };

  // ==========================================
  // OPEN GOOGLE MAPS
  // ==========================================

  const openGoogleMaps = (location) => {
    const encodedLocation =
      encodeURIComponent(location);

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`,
      "_blank"
    );
  };

  // ==========================================
  // FORMAT BUDGET
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
  // PROJECT COUNTS
  // ==========================================

  const counts = useMemo(() => {
    return {
      total: projects.length,

      onTrack: projects.filter(
        (project) =>
          project.status === "ON_TRACK"
      ).length,

      atRisk: projects.filter(
        (project) =>
          project.status === "AT_RISK"
      ).length,

      delayed: projects.filter(
        (project) =>
          project.status === "DELAYED"
      ).length,

      completed: projects.filter(
        (project) =>
          project.status === "COMPLETED"
      ).length,
    };
  }, [projects]);

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
              Loading infrastructure map...
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
            GEOSPATIAL MONITORING
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Infrastructure Map
          </h1>

          <p className="mt-2 text-slate-400">
            Monitor infrastructure projects by
            location and operational status.
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
            : "Refresh Map"}
        </button>

      </div>

      {/* SUMMARY */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-500">
            Total
          </p>

          <p className="mt-2 text-2xl font-bold">
            {counts.total}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs text-emerald-400">
            On Track
          </p>

          <p className="mt-2 text-2xl font-bold">
            {counts.onTrack}
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-xs text-yellow-400">
            At Risk
          </p>

          <p className="mt-2 text-2xl font-bold">
            {counts.atRisk}
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-xs text-red-400">
            Delayed
          </p>

          <p className="mt-2 text-2xl font-bold">
            {counts.delayed}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <p className="text-xs text-cyan-400">
            Completed
          </p>

          <p className="mt-2 text-2xl font-bold">
            {counts.completed}
          </p>
        </div>

      </div>

      {/* SEARCH */}

      <div className="mt-6 flex max-w-2xl items-center rounded-xl border border-slate-800 bg-slate-900">

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

      {/* MAIN MAP AREA */}

      <div className="mt-6 grid gap-5 xl:grid-cols-3">

        {/* MAP */}

        <div className="relative h-[650px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 xl:col-span-2">

          {/* MAP BACKGROUND */}

          <div className="absolute inset-0 bg-slate-950">

            {/* GRID */}

            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)",
                backgroundSize: "55px 55px",
              }}
            />

            {/* ROADS */}

            <div className="absolute left-[8%] top-[20%] h-[2px] w-[85%] rotate-[12deg] bg-slate-800" />

            <div className="absolute left-[5%] top-[48%] h-[2px] w-[90%] rotate-[-8deg] bg-slate-800" />

            <div className="absolute left-[20%] top-[5%] h-[90%] w-[2px] rotate-[18deg] bg-slate-800" />

            <div className="absolute left-[65%] top-[5%] h-[90%] w-[2px] rotate-[-15deg] bg-slate-800" />

            <div className="absolute left-[10%] top-[72%] h-[2px] w-[80%] rotate-[5deg] bg-slate-800" />

            {/* WATER AREA */}

            <div className="absolute -right-20 top-[20%] h-[300px] w-[250px] rounded-full bg-cyan-500/5 blur-3xl" />

            {/* MAP LABEL */}

            <div className="absolute left-6 top-6">

              <div className="rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur">

                <div className="flex items-center gap-2">

                  <MapPin
                    size={17}
                    className="text-cyan-400"
                  />

                  <span className="text-sm font-semibold">
                    NEXORA Project Network
                  </span>

                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredProjects.length} monitored
                  location
                  {filteredProjects.length !== 1
                    ? "s"
                    : ""}
                </p>

              </div>

            </div>

            {/* MARKERS */}

            {filteredProjects.map(
              (project, index) => {

                const position =
                  getMarkerPosition(
                    index,
                    filteredProjects.length
                  );

                const isSelected =
                  selectedProject?.id ===
                  project.id;

                return (
                  <button
                    key={project.id}
                    onClick={() =>
                      setSelectedProject(
                        project
                      )
                    }
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition hover:scale-125"
                    style={position}
                    title={project.name}
                  >

                    {/* PULSE */}

                    <span
                      className={`absolute -inset-2 rounded-full opacity-20 ${getStatusColor(
                        project.status
                      )} ${
                        isSelected
                          ? "animate-ping"
                          : ""
                      }`}
                    />

                    {/* MARKER */}

                    <span
                      className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-950 shadow-lg ${getStatusColor(
                        project.status
                      )}`}
                    >

                      <MapPin
                        size={18}
                        className="text-slate-950"
                      />

                    </span>

                  </button>
                );
              }
            )}

            {/* NO PROJECTS */}

            {filteredProjects.length ===
              0 && (
              <div className="absolute inset-0 flex items-center justify-center">

                <div className="text-center">

                  <MapPin
                    size={45}
                    className="mx-auto text-slate-600"
                  />

                  <p className="mt-4 font-semibold text-slate-400">
                    No locations found
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Try another search.
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* LEGEND */}

          <div className="absolute bottom-5 left-5 rounded-xl border border-slate-800 bg-slate-950/95 p-4 backdrop-blur">

            <p className="mb-3 text-xs font-semibold uppercase text-slate-500">
              Project Status
            </p>

            <div className="grid grid-cols-2 gap-x-5 gap-y-2">

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                On Track
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                At Risk
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                Delayed
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                Completed
              </div>

            </div>

          </div>

        </div>

        {/* PROJECT DETAILS */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900">

          {!selectedProject ? (

            <div className="flex h-full min-h-[500px] flex-col items-center justify-center p-8 text-center">

              <div className="rounded-2xl bg-cyan-500/10 p-5">

                <MapPin
                  size={35}
                  className="text-cyan-400"
                />

              </div>

              <h2 className="mt-5 text-xl font-bold">
                Select a Project
              </h2>

              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                Click any project marker on the
                map to view detailed monitoring
                information.
              </p>

            </div>

          ) : (

            <div className="p-6">

              {/* DETAILS HEADER */}

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs font-semibold uppercase text-cyan-400">
                    Selected Project
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    {selectedProject.name}
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setSelectedProject(null)
                  }
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
                >
                  <X size={18} />
                </button>

              </div>

              {/* STATUS */}

              <div className="mt-5">

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                    selectedProject.status
                  )}`}
                >
                  {getStatusText(
                    selectedProject.status
                  )}
                </span>

              </div>

              {/* LOCATION */}

              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">

                <div className="flex gap-3">

                  <MapPin
                    size={19}
                    className="mt-0.5 shrink-0 text-cyan-400"
                  />

                  <div>

                    <p className="text-xs text-slate-500">
                      Location
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {selectedProject.location}
                    </p>

                  </div>

                </div>

              </div>

              {/* PROGRESS */}

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <Activity
                      size={18}
                      className="text-cyan-400"
                    />

                    <span className="text-sm text-slate-400">
                      Progress
                    </span>

                  </div>

                  <span className="font-bold text-cyan-400">
                    {selectedProject.progress}%
                  </span>

                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all"
                    style={{
                      width: `${selectedProject.progress}%`,
                    }}
                  />

                </div>

              </div>

              {/* BUDGET */}

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">

                <div className="flex items-center gap-3">

                  <IndianRupee
                    size={18}
                    className="text-cyan-400"
                  />

                  <div>

                    <p className="text-xs text-slate-500">
                      Project Budget
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatBudget(
                        Number(
                          selectedProject.budget ||
                            0
                        )
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* DATES */}

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">

                <div className="flex gap-3">

                  <CalendarDays
                    size={18}
                    className="mt-0.5 text-cyan-400"
                  />

                  <div>

                    <p className="text-xs text-slate-500">
                      Project Timeline
                    </p>

                    <p className="mt-1 text-sm text-slate-300">

                      {new Date(
                        selectedProject.startDate
                      ).toLocaleDateString(
                        "en-IN"
                      )}

                      {" → "}

                      {new Date(
                        selectedProject.endDate
                      ).toLocaleDateString(
                        "en-IN"
                      )}

                    </p>

                  </div>

                </div>

              </div>

              {/* MANAGER */}

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">

                <div className="flex items-center gap-3">

                  <FolderKanban
                    size={18}
                    className="text-cyan-400"
                  />

                  <div>

                    <p className="text-xs text-slate-500">
                      Project Manager
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {selectedProject.manager ||
                        "Not assigned"}
                    </p>

                  </div>

                </div>

              </div>

              {/* GOOGLE MAPS */}

              <button
                onClick={() =>
                  openGoogleMaps(
                    selectedProject.location
                  )
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                <Navigation size={18} />
                Open in Google Maps
              </button>

            </div>

          )}

        </div>

      </div>

      {/* PROJECT LIST */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-bold">
              Monitored Locations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              All infrastructure projects currently
              visible on the monitoring network.
            </p>

          </div>

          <FolderKanban
            size={22}
            className="text-cyan-400"
          />

        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">

          {filteredProjects.map(
            (project) => (

              <button
                key={project.id}
                onClick={() =>
                  setSelectedProject(
                    project
                  )
                }
                className={`rounded-xl border p-4 text-left transition ${
                  selectedProject?.id ===
                  project.id
                    ? "border-cyan-500/50 bg-cyan-500/5"
                    : "border-slate-800 bg-slate-950 hover:border-slate-700"
                }`}
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="truncate font-semibold">
                      {project.name}
                    </p>

                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                      <MapPin size={12} />
                      {project.location}
                    </p>

                  </div>

                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${getStatusColor(
                      project.status
                    )}`}
                  />

                </div>

                <div className="mt-4 flex items-center justify-between text-xs">

                  <span className="text-slate-500">
                    Progress
                  </span>

                  <span className="font-semibold text-cyan-400">
                    {project.progress}%
                  </span>

                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="h-full rounded-full bg-cyan-500"
                    style={{
                      width: `${project.progress}%`,
                    }}
                  />

                </div>

              </button>

            )
          )}

        </div>

      </div>

      {/* FOOTER */}

      <div className="mt-8 border-t border-slate-800 pt-5 text-xs text-slate-600">
        NEXORA Geospatial Monitoring • Live
        project data from PostgreSQL
      </div>

    </div>
  );
}

export default InfrastructureMap;