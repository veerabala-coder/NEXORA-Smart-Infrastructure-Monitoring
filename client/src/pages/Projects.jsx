import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  MapPin,
  CalendarDays,
  Pencil,
  Trash2,
  FolderKanban,
  X,
  Eye,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import api from "../api/axios.js";

import ProjectDetails from "./ProjectDetails.jsx";

function Projects() {
  const [projects, setProjects] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [editingProject, setEditingProject] =
    useState(null);

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState(null);

  const [formData, setFormData] =
    useState({
      name: "",
      description: "",
      location: "",
      budget: "",
      amountSpent: "",
      estimatedFinalCost: "",
      progress: 0,
      status: "ON_TRACK",
      startDate: "",
      endDate: "",
      manager: "",
      issues: "",
    });

  const user = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "nexora_user"
        ) || "null"
      );
    } catch {
      return null;
    }
  }, []);

  const role = user?.role || "USER";

  const canManage =
    role === "ADMIN" ||
    role === "OFFICER" ||
    role === "CONTRACTOR";

  const canDelete =
    role === "ADMIN" ||
    role === "OFFICER";

  // ==================================================
  // FETCH
  // ==================================================

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
        "Projects fetch error:",
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

  // ==================================================
  // URL PROJECT
  // ==================================================

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const projectId =
      params.get("project");

    if (projectId) {
      setSelectedProjectId(
        Number(projectId)
      );
    }
  }, []);

  // ==================================================
  // FORM
  // ==================================================

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      budget: "",
      amountSpent: "",
      estimatedFinalCost: "",
      progress: 0,
      status: "ON_TRACK",
      startDate: "",
      endDate: "",
      manager: "",
      issues: "",
    });

    setEditingProject(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==================================================
  // CREATE / UPDATE
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canManage) {
      alert(
        "You do not have permission to manage projects."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,

        budget:
          formData.budget === ""
            ? null
            : Number(formData.budget),

        amountSpent:
          formData.amountSpent === ""
            ? null
            : Number(formData.amountSpent),

        estimatedFinalCost:
          formData.estimatedFinalCost === ""
            ? null
            : Number(
                formData.estimatedFinalCost
              ),

        progress: Number(
          formData.progress
        ),
      };

      let response;

      if (editingProject) {
        response = await api.put(
          `/projects/${editingProject.id}`,
          payload
        );
      } else {
        response = await api.post(
          "/projects",
          payload
        );
      }

      if (
        response.status >= 200 &&
        response.status < 300
      ) {
        alert(
          editingProject
            ? "Project updated successfully!"
            : "Project created successfully!"
        );

        setShowForm(false);

        resetForm();

        await fetchProjects();
      }

    } catch (error) {
      console.error(
        "Project save error:",
        error
      );

      if (
        error.response?.status === 403
      ) {
        alert(
          "You do not have permission to perform this action."
        );
      } else {
        alert(
          error.response?.data?.message ||
            "Unable to save project."
        );
      }

    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // EDIT
  // ==================================================

  const handleEdit = (project) => {
    if (!canManage) {
      alert(
        "You have view-only access."
      );
      return;
    }

    setEditingProject(project);

    setFormData({
      name: project.name || "",
      description:
        project.description || "",
      location:
        project.location || "",

      budget:
        project.budget ?? "",

      amountSpent:
        project.amountSpent ?? "",

      estimatedFinalCost:
        project.estimatedFinalCost ?? "",

      progress:
        project.progress ?? 0,

      status:
        project.status || "ON_TRACK",

      startDate:
        project.startDate
          ? new Date(
              project.startDate
            )
              .toISOString()
              .slice(0, 10)
          : "",

      endDate:
        project.endDate
          ? new Date(
              project.endDate
            )
              .toISOString()
              .slice(0, 10)
          : "",

      manager:
        project.manager || "",

      issues:
        project.issues || "",
    });

    setShowForm(true);
  };

  // ==================================================
  // DELETE
  // ==================================================

  const handleDelete = async (id) => {
    if (!canDelete) {
      alert(
        "Only Admin and Officer can delete projects."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this project?"
      );

    if (!confirmed) return;

    try {
      await api.delete(
        `/projects/${id}`
      );

      alert(
        "Project deleted successfully!"
      );

      fetchProjects();

    } catch (error) {
      console.error(
        "Delete project error:",
        error
      );

      if (
        error.response?.status === 403
      ) {
        alert(
          "You do not have permission to delete this project."
        );
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to delete project."
        );
      }
    }
  };

  // ==================================================
  // SEARCH
  // ==================================================

  const filteredProjects =
    useMemo(() => {
      const text =
        search.toLowerCase();

      return projects.filter(
        (project) =>
          project.name
            .toLowerCase()
            .includes(text) ||
          project.location
            .toLowerCase()
            .includes(text) ||
          (project.manager || "")
            .toLowerCase()
            .includes(text)
      );
    }, [projects, search]);

  // ==================================================
  // MONEY
  // ==================================================

  const formatMoney = (value) => {
    const amount = Number(
      value || 0
    );

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

  // ==================================================
  // STATUS
  // ==================================================

  const getStatusStyle = (
    status
  ) => {
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

  const formatStatus = (
    status
  ) =>
    String(status || "")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );

  // ==================================================
  // FINANCIAL STATUS
  // ==================================================

  const getFinancialStatus = (
    project
  ) => {
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

    if (
      budget <= 0 ||
      estimated <= budget
    ) {
      return {
        label: "Within Budget",
        style:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        funding: 0,
      };
    }

    const funding =
      estimated - budget;

    const percentage =
      (funding / budget) * 100;

    if (percentage <= 5) {
      return {
        label: "Budget Watch",
        style:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
        funding,
      };
    }

    if (percentage <= 15) {
      return {
        label: "Funding Risk",
        style:
          "border-orange-500/20 bg-orange-500/10 text-orange-400",
        funding,
      };
    }

    return {
      label:
        "Critical Funding Required",
      style:
        "border-red-500/20 bg-red-500/10 text-red-400",
      funding,
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-10">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

        <div>

          <p className="text-sm font-semibold text-cyan-400">
            PROJECT MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Infrastructure Projects
          </h1>

          <p className="mt-2 text-slate-400">
            Monitor, analyze and manage
            infrastructure project health.
          </p>

        </div>

        {canManage && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus size={19} />
            Add Project
          </button>
        )}

      </div>

      {/* ROLE */}

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 px-5 py-4">

        <span className="text-sm text-slate-400">
          Current role:
        </span>

        <span className="ml-2 font-bold text-cyan-400">
          {role}
        </span>

        <span className="ml-3 text-xs text-slate-500">
          {canManage
            ? "Management access"
            : "View-only access"}
        </span>

      </div>

      {/* SEARCH */}

      <div className="mt-6 flex max-w-xl items-center rounded-xl border border-slate-800 bg-slate-900">

        <Search
          size={19}
          className="ml-4 text-slate-500"
        />

        <input
          type="text"
          placeholder="Search projects, locations or managers..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-600"
        />

      </div>

      {/* COUNT */}

      <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">

        <FolderKanban size={17} />

        Showing{" "}
        <span className="font-semibold text-white">
          {filteredProjects.length}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-white">
          {projects.length}
        </span>{" "}
        projects

      </div>

      {/* PROJECTS */}

      <div className="mt-5 grid gap-5 xl:grid-cols-2">

        {loading ? (

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
            Loading projects...
          </div>

        ) : filteredProjects.length ===
          0 ? (

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
            No projects found.
          </div>

        ) : (

          filteredProjects.map(
            (project) => {

              const financial =
                getFinancialStatus(
                  project
                );

              return (
                <div
                  key={project.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-500/40"
                >

                  {/* TITLE */}

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h2 className="text-xl font-bold">
                        {project.name}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {project.description ||
                          "No description available."}
                      </p>

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

                  {/* LOCATION */}

                  <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">

                    <MapPin
                      size={17}
                      className="text-cyan-400"
                    />

                    {project.location}

                  </div>

                  {/* DATES */}

                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">

                    <CalendarDays
                      size={17}
                      className="text-cyan-400"
                    />

                    {new Date(
                      project.startDate
                    ).toLocaleDateString(
                      "en-IN"
                    )}

                    {" → "}

                    {new Date(
                      project.endDate
                    ).toLocaleDateString(
                      "en-IN"
                    )}

                  </div>

                  {/* PROGRESS */}

                  <div className="mt-6">

                    <div className="mb-2 flex justify-between text-sm">

                      <span className="text-slate-400">
                        Project Progress
                      </span>

                      <span className="font-semibold text-cyan-400">
                        {project.progress}%
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                      <div
                        className="h-full rounded-full bg-cyan-500"
                        style={{
                          width: `${project.progress}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* FINANCIAL */}

                  <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">

                    <div className="flex items-center gap-2">

                      <IndianRupee
                        size={17}
                        className="text-cyan-400"
                      />

                      <span className="text-xs text-slate-500">
                        Approved Budget
                      </span>

                      <span className="ml-auto font-semibold">
                        {formatMoney(
                          project.budget
                        )}
                      </span>

                    </div>

                    <div className="mt-3">

                      {financial.funding >
                      0 ? (

                        <div className="flex items-center gap-2 text-sm font-semibold text-red-400">

                          <AlertTriangle
                            size={17}
                          />

                          🚨{" "}
                          {formatMoney(
                            financial.funding
                          )}{" "}
                          Additional Funding Required

                        </div>

                      ) : (

                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">

                          <CheckCircle2
                            size={17}
                          />

                          🟢 Within Budget

                        </div>

                      )}

                    </div>

                  </div>

                  {/* MANAGER + ACTIONS */}

                  <div className="mt-6 flex flex-col gap-4 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="text-xs text-slate-500">
                        Project Manager
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-300">
                        {project.manager ||
                          "Not assigned"}
                      </p>

                    </div>

                    <div className="flex flex-wrap gap-2">

                      <button
                        onClick={() =>
                          setSelectedProjectId(
                            project.id
                          )
                        }
                        className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                      >
                        <Eye size={16} />
                        View Details
                      </button>

                      {canManage && (
                        <button
                          onClick={() =>
                            handleEdit(
                              project
                            )
                          }
                          className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:border-cyan-500 hover:text-cyan-400"
                          title="Edit project"
                        >
                          <Pencil size={17} />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() =>
                            handleDelete(
                              project.id
                            )
                          }
                          className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:border-red-500 hover:text-red-400"
                          title="Delete project"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}

                    </div>

                  </div>

                </div>
              );
            }
          )

        )}

      </div>

      {/* FORM */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5">

          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-cyan-400">
                  PROJECT MANAGEMENT
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {editingProject
                    ? "Edit Project"
                    : "Add New Project"}
                </h2>

              </div>

              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={21} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm text-slate-300">
                  Project Name *
                </label>

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm text-slate-300">
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  rows="3"
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm text-slate-300">
                  Location *
                </label>

                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Example: Cuddalore, Tamil Nadu"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />

              </div>

              {/* FINANCIAL */}

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">

                <div className="mb-4 flex items-center gap-2">

                  <IndianRupee
                    size={19}
                    className="text-cyan-400"
                  />

                  <h3 className="font-semibold">
                    Financial Monitoring
                  </h3>

                </div>

                <div className="grid gap-5 md:grid-cols-3">

                  <div>

                    <label className="mb-2 block text-xs text-slate-400">
                      Approved Budget
                    </label>

                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      min="0"
                      placeholder="240000000"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-xs text-slate-400">
                      Amount Spent
                    </label>

                    <input
                      type="number"
                      name="amountSpent"
                      value={
                        formData.amountSpent
                      }
                      onChange={handleChange}
                      min="0"
                      placeholder="185000000"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-xs text-slate-400">
                      Estimated Final Cost
                    </label>

                    <input
                      type="number"
                      name="estimatedFinalCost"
                      value={
                        formData.estimatedFinalCost
                      }
                      onChange={handleChange}
                      min="0"
                      placeholder="275000000"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                    />

                  </div>

                </div>

                <p className="mt-3 text-xs text-slate-500">
                  NEXORA automatically calculates
                  additional funding and financial
                  risk from these values.
                </p>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm text-slate-300">
                    Progress (%)
                  </label>

                  <input
                    type="number"
                    name="progress"
                    value={
                      formData.progress
                    }
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm text-slate-300">
                    Operational Status
                  </label>

                  <select
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
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

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm text-slate-300">
                    Start Date *
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={
                      formData.startDate
                    }
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm text-slate-300">
                    Expected Completion *
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={
                      formData.endDate
                    }
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  />

                </div>

              </div>

              <div>

                <label className="mb-2 block text-sm text-slate-300">
                  Project Manager
                </label>

                <input
                  name="manager"
                  value={
                    formData.manager
                  }
                  onChange={handleChange}
                  placeholder="Example: Cuddalore Municipal Corporation"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm text-slate-300">
                  Current Issues
                </label>

                <textarea
                  name="issues"
                  value={
                    formData.issues
                  }
                  onChange={handleChange}
                  rows="3"
                  placeholder="Example: Material cost increase..."
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />

              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingProject
                    ? "Update Project"
                    : "Create Project"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* DETAILS */}

      {selectedProjectId && (
        <ProjectDetails
          projectId={
            selectedProjectId
          }
          onClose={() => {
            setSelectedProjectId(
              null
            );

            window.history.replaceState(
              {},
              "",
              "/projects"
            );
          }}
        />
      )}

    </div>
  );
}

export default Projects;