import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  FolderKanban,
  MapPin,
  CalendarDays,
  IndianRupee,
  ShieldAlert,
} from "lucide-react";

import api from "../api/axios.js";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    budget: "",
    progress: 0,
    status: "ON_TRACK",
    startDate: "",
    endDate: "",
    manager: "",
  });

  // ==========================================
  // USER / ROLE
  // ==========================================

  const user = JSON.parse(
    localStorage.getItem("nexora_user") || "{}"
  );

  const role = user.role || "USER";

  const canCreate =
    role === "ADMIN" ||
    role === "OFFICER" ||
    role === "CONTRACTOR";

  const canUpdate =
    role === "ADMIN" ||
    role === "OFFICER" ||
    role === "CONTRACTOR";

  const canDelete =
    role === "ADMIN" ||
    role === "OFFICER";

  // ==========================================
  // FETCH PROJECTS
  // ==========================================

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/projects");

      setProjects(response.data.projects || []);
    } catch (err) {
      console.error("Projects fetch error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("nexora_token");
        localStorage.removeItem("nexora_user");
        window.location.href = "/login";
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to load projects."
      );
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
  // FORM
  // ==========================================

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      location: "",
      budget: "",
      progress: 0,
      status: "ON_TRACK",
      startDate: "",
      endDate: "",
      manager: "",
    });

    setEditingProject(null);
  };

  const openCreateForm = () => {
    setError("");
    setSuccess("");
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (project) => {
    setError("");
    setSuccess("");

    setEditingProject(project);

    setForm({
      name: project.name || "",
      description: project.description || "",
      location: project.location || "",
      budget: project.budget ?? "",
      progress: project.progress ?? 0,
      status: project.status || "ON_TRACK",
      startDate: project.startDate
        ? project.startDate.slice(0, 10)
        : "",
      endDate: project.endDate
        ? project.endDate.slice(0, 10)
        : "",
      manager: project.manager || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // CREATE / UPDATE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!form.location.trim()) {
      setError("Project location is required.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setError(
        "Start date and end date are required."
      );
      return;
    }

    if (
      new Date(form.endDate) <
      new Date(form.startDate)
    ) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    try {
      if (editingProject) {
        await api.put(
          `/projects/${editingProject.id}`,
          {
            name: form.name,
            description: form.description,
            location: form.location,
            budget:
              form.budget === ""
                ? null
                : Number(form.budget),
            progress: Number(form.progress),
            status: form.status,
            startDate: form.startDate,
            endDate: form.endDate,
            manager: form.manager,
          }
        );

        setSuccess(
          "Project updated successfully."
        );
      } else {
        await api.post("/projects", {
          name: form.name,
          description: form.description,
          location: form.location,
          budget:
            form.budget === ""
              ? null
              : Number(form.budget),
          progress: Number(form.progress),
          status: form.status,
          startDate: form.startDate,
          endDate: form.endDate,
          manager: form.manager,
        });

        setSuccess(
          "Project created successfully."
        );
      }

      closeForm();
      await fetchProjects();
    } catch (err) {
      console.error("Project save error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("nexora_token");
        localStorage.removeItem("nexora_user");
        window.location.href = "/login";
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to perform this action."
        );
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to save project."
      );
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    if (!canDelete) {
      setError(
        "You do not have permission to delete projects."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/projects/${id}`);

      setSuccess(
        "Project deleted successfully."
      );

      await fetchProjects();
    } catch (err) {
      console.error("Delete project error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("nexora_token");
        localStorage.removeItem("nexora_user");
        window.location.href = "/login";
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to delete projects."
        );
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to delete project."
      );
    }
  };

  // ==========================================
  // FILTER
  // ==========================================

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const searchText = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchText ||
        project.name
          ?.toLowerCase()
          .includes(searchText) ||
        project.location
          ?.toLowerCase()
          .includes(searchText) ||
        project.manager
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  // ==========================================
  // HELPERS
  // ==========================================

  const formatStatus = (status) => {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

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
              Loading projects...
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
            NEXORA MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Infrastructure Projects
          </h1>

          <p className="mt-2 text-slate-400">
            Manage and monitor registered
            infrastructure projects.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          {canCreate && (
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              <Plus size={18} />
              Add Project
            </button>
          )}

        </div>
      </div>

      {/* ROLE BADGE */}

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
        <ShieldAlert
          size={18}
          className="text-cyan-400"
        />

        <p className="text-sm text-slate-400">
          Current role:
          <span className="ml-2 font-semibold text-cyan-400">
            {role}
          </span>
        </p>

        {!canCreate && (
          <span className="text-xs text-slate-500">
            View-only access
          </span>
        )}
      </div>

      {/* MESSAGES */}

      {error && (
        <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {/* SEARCH + FILTER */}

      <div className="mt-6 flex flex-col gap-3 md:flex-row">

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search projects, locations or managers..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500"
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

      {/* PROJECT COUNT */}

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-300">
            {filteredProjects.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-300">
            {projects.length}
          </span>{" "}
          projects
        </p>
      </div>

      {/* PROJECT CARDS */}

      <div className="mt-5 grid gap-5 xl:grid-cols-2">

        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center xl:col-span-2">

            <FolderKanban
              size={40}
              className="mx-auto text-slate-600"
            />

            <p className="mt-4 font-medium text-slate-300">
              No projects found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or
              status filter.
            </p>

          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg transition hover:border-cyan-500/30"
            >

              {/* CARD HEADER */}

              <div className="flex items-start justify-between gap-4">

                <div className="flex gap-4">

                  <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                    <FolderKanban size={22} />
                  </div>

                  <div>
                    <h2 className="font-bold text-white">
                      {project.name}
                    </h2>

                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={13} />
                      {project.location}
                    </div>
                  </div>

                </div>

                <span
                  className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                    project.status
                  )}`}
                >
                  {formatStatus(
                    project.status
                  )}
                </span>

              </div>

              {/* DESCRIPTION */}

              {project.description && (
                <p className="mt-5 text-sm leading-6 text-slate-400">
                  {project.description}
                </p>
              )}

              {/* PROGRESS */}

              <div className="mt-6">

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Project Progress
                  </span>

                  <span className="text-sm font-bold text-cyan-400">
                    {project.progress}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all"
                    style={{
                      width: `${project.progress}%`,
                    }}
                  />
                </div>

              </div>

              {/* DETAILS */}

              <div className="mt-6 grid grid-cols-2 gap-4">

                <div className="rounded-xl bg-slate-950/60 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <IndianRupee size={14} />
                    Budget
                  </div>

                  <p className="mt-1 font-semibold text-slate-200">
                    {formatBudget(
                      Number(project.budget || 0)
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950/60 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays size={14} />
                    End Date
                  </div>

                  <p className="mt-1 font-semibold text-slate-200">
                    {new Date(
                      project.endDate
                    ).toLocaleDateString()}
                  </p>
                </div>

              </div>

              {/* MANAGER */}

              <div className="mt-4 text-xs text-slate-500">
                Manager:{" "}
                <span className="text-slate-300">
                  {project.manager ||
                    "Not assigned"}
                </span>
              </div>

              {/* ACTIONS */}

              {(canUpdate || canDelete) && (
                <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-5">

                  {canUpdate && (
                    <button
                      onClick={() =>
                        openEditForm(project)
                      }
                      className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() =>
                        handleDelete(project.id)
                      }
                      className="flex items-center gap-2 rounded-lg border border-red-500/20 px-4 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  )}

                </div>
              )}

            </div>
          ))
        )}

      </div>

      {/* ==========================================
          PROJECT FORM MODAL
      ========================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingProject
                    ? "Edit Project"
                    : "Create Project"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Enter infrastructure project
                  information.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              <div className="grid gap-5 md:grid-cols-2">

                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Project Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter project name"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>

                {/* LOCATION */}

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Location *
                  </label>

                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>

              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe the project..."
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {/* BUDGET */}

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Budget (₹)
                  </label>

                  <input
                    type="number"
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    placeholder="5000000"
                    min="0"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>

                {/* MANAGER */}

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Manager
                  </label>

                  <input
                    name="manager"
                    value={form.manager}
                    onChange={handleChange}
                    placeholder="Manager name"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>

              </div>

              <div className="grid gap-5 md:grid-cols-3">

                {/* PROGRESS */}

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Progress (%)
                  </label>

                  <input
                    type="number"
                    name="progress"
                    value={form.progress}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>

                {/* STATUS */}

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500"
                  >
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

                <div />

              </div>

              {/* DATES */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Start Date *
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    End Date *
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  {editingProject
                    ? "Update Project"
                    : "Create Project"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Projects;