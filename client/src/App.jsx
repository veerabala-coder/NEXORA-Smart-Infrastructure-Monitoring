import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Projects from "./pages/Projects.jsx";
import Analytics from "./pages/Analytics.jsx";
import InfrastructureMap from "./pages/InfrastructureMap.jsx";
import Alerts from "./pages/Alerts.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";

import Sidebar from "./components/Sidebar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// ======================================
// DASHBOARD
// ======================================

function DashboardLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <main className="lg:ml-64">
          <Dashboard />
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ======================================
// PROJECTS
// ======================================

function ProjectsLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <main className="lg:ml-64">
          <Projects />
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ======================================
// ANALYTICS
// ======================================

function AnalyticsLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <main className="lg:ml-64">
          <Analytics />
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ======================================
// INFRASTRUCTURE MAP
// ======================================

function MapLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <main className="lg:ml-64">
          <InfrastructureMap />
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ======================================
// ALERTS
// ======================================

function AlertsLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <main className="lg:ml-64">
          <Alerts />
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ======================================
// REPORTS
// ======================================

function ReportsLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <main className="lg:ml-64">
          <Reports />
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ======================================
// SETTINGS
// ======================================

function SettingsLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <main className="lg:ml-64">
          <Settings />
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ======================================
// APP
// ======================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={<DashboardLayout />}
        />

        {/* PROJECTS */}

        <Route
          path="/projects"
          element={<ProjectsLayout />}
        />

        {/* ANALYTICS */}

        <Route
          path="/analytics"
          element={<AnalyticsLayout />}
        />

        {/* MAP */}

        <Route
          path="/map"
          element={<MapLayout />}
        />

        {/* ALERTS */}

        <Route
          path="/alerts"
          element={<AlertsLayout />}
        />

        {/* REPORTS */}

        <Route
          path="/reports"
          element={<ReportsLayout />}
        />

        {/* SETTINGS */}

        <Route
          path="/settings"
          element={<SettingsLayout />}
        />

        {/* DEFAULT */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;