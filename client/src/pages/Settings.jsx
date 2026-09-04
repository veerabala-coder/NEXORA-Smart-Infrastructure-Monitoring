import { useEffect, useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Bell,
  Monitor,
  Save,
  LogOut,
  RotateCcw,
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [name, setName] = useState("");

  const [notifications, setNotifications] =
    useState(true);

  const [compactMode, setCompactMode] =
    useState(false);

  const [emailAlerts, setEmailAlerts] =
    useState(true);

  const [securityAlerts, setSecurityAlerts] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ==========================================
  // LOAD USER + SETTINGS
  // ==========================================

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("nexora_user") || "{}"
    );

    setUser(storedUser);
    setName(storedUser.name || "");

    setNotifications(
      localStorage.getItem(
        "nexora_notifications"
      ) !== "false"
    );

    setCompactMode(
      localStorage.getItem(
        "nexora_compact_mode"
      ) === "true"
    );

    setEmailAlerts(
      localStorage.getItem(
        "nexora_email_alerts"
      ) !== "false"
    );

    setSecurityAlerts(
      localStorage.getItem(
        "nexora_security_alerts"
      ) !== "false"
    );
  }, []);

  // ==========================================
  // SAVE SETTINGS
  // ==========================================

  const handleSave = () => {
    setSaving(true);
    setSaved(false);

    const updatedUser = {
      ...user,
      name: name.trim() || user.name,
    };

    localStorage.setItem(
      "nexora_user",
      JSON.stringify(updatedUser)
    );

    localStorage.setItem(
      "nexora_notifications",
      String(notifications)
    );

    localStorage.setItem(
      "nexora_compact_mode",
      String(compactMode)
    );

    localStorage.setItem(
      "nexora_email_alerts",
      String(emailAlerts)
    );

    localStorage.setItem(
      "nexora_security_alerts",
      String(securityAlerts)
    );

    setUser(updatedUser);

    setTimeout(() => {
      setSaving(false);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    }, 500);
  };

  // ==========================================
  // RESET SETTINGS
  // ==========================================

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset all NEXORA preferences to default?"
    );

    if (!confirmed) {
      return;
    }

    setNotifications(true);
    setCompactMode(false);
    setEmailAlerts(true);
    setSecurityAlerts(true);

    localStorage.setItem(
      "nexora_notifications",
      "true"
    );

    localStorage.setItem(
      "nexora_compact_mode",
      "false"
    );

    localStorage.setItem(
      "nexora_email_alerts",
      "true"
    );

    localStorage.setItem(
      "nexora_security_alerts",
      "true"
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      "nexora_token"
    );

    localStorage.removeItem(
      "nexora_user"
    );

    navigate("/login");
  };

  // ==========================================
  // TOGGLE COMPONENT
  // ==========================================

  const Toggle = ({
    enabled,
    onChange,
  }) => {
    return (
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 rounded-full transition ${
          enabled
            ? "bg-cyan-500"
            : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-10">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold text-cyan-400">
            SYSTEM CONFIGURATION
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Settings
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your NEXORA profile, notifications
            and security preferences.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
            <CheckCircle2 size={18} />
            Settings saved successfully
          </div>
        )}
      </div>

      {/* MAIN GRID */}

      <div className="mt-8 grid gap-6 xl:grid-cols-3">

        {/* PROFILE */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
              <User size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Profile Information
              </h2>

              <p className="text-sm text-slate-500">
                Manage your NEXORA account information.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {/* NAME */}

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Full Name
              </label>

              <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950">
                <User
                  size={18}
                  className="ml-4 text-slate-500"
                />

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full bg-transparent px-3 py-3 text-white outline-none"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Email Address
              </label>

              <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 opacity-70">
                <Mail
                  size={18}
                  className="ml-4 text-slate-500"
                />

                <input
                  value={user.email || ""}
                  disabled
                  className="w-full bg-transparent px-3 py-3 text-slate-400 outline-none"
                />
              </div>

              <p className="mt-2 text-xs text-slate-600">
                Email changes require account
                verification.
              </p>
            </div>

            {/* ROLE */}

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Account Role
              </label>

              <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                <ShieldCheck
                  size={18}
                  className="mr-3 text-cyan-400"
                />

                <span className="font-semibold text-cyan-400">
                  {user.role || "USER"}
                </span>
              </div>
            </div>

            {/* USER ID */}

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Account ID
              </label>

              <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                <User
                  size={18}
                  className="mr-3 text-slate-500"
                />

                <span className="text-sm text-slate-400">
                  NEXORA-{user.id || "0000"}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* SECURITY STATUS */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <LockKeyhole size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Security
              </h2>

              <p className="text-sm text-slate-500">
                Session security status
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">

            <div className="flex items-center gap-3">
              <CheckCircle2
                size={20}
                className="text-emerald-400"
              />

              <div>
                <p className="font-semibold text-emerald-400">
                  Session Active
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  JWT authentication is active.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-4 space-y-3">

            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
              <span className="text-sm text-slate-400">
                Authentication
              </span>

              <span className="text-xs font-semibold text-emerald-400">
                SECURE
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
              <span className="text-sm text-slate-400">
                Token
              </span>

              <span className="text-xs font-semibold text-emerald-400">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
              <span className="text-sm text-slate-400">
                Database
              </span>

              <span className="text-xs font-semibold text-emerald-400">
                CONNECTED
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* PREFERENCES */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
            <Monitor size={21} />
          </div>

          <div>
            <h2 className="text-lg font-bold">
              Preferences
            </h2>

            <p className="text-sm text-slate-500">
              Customize your NEXORA monitoring
              experience.
            </p>
          </div>
        </div>

        <div className="mt-6 divide-y divide-slate-800">

          {/* NOTIFICATIONS */}

          <div className="flex items-center justify-between gap-5 py-5">
            <div className="flex items-start gap-4">

              <div className="rounded-lg bg-slate-950 p-2.5 text-slate-400">
                <Bell size={19} />
              </div>

              <div>
                <p className="font-medium">
                  Push Notifications
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Receive important project alerts
                  inside NEXORA.
                </p>
              </div>

            </div>

            <Toggle
              enabled={notifications}
              onChange={setNotifications}
            />
          </div>

          {/* EMAIL ALERTS */}

          <div className="flex items-center justify-between gap-5 py-5">
            <div className="flex items-start gap-4">

              <div className="rounded-lg bg-slate-950 p-2.5 text-slate-400">
                <Mail size={19} />
              </div>

              <div>
                <p className="font-medium">
                  Email Alerts
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Receive project warnings and
                  deadline notifications by email.
                </p>
              </div>

            </div>

            <Toggle
              enabled={emailAlerts}
              onChange={setEmailAlerts}
            />
          </div>

          {/* SECURITY ALERTS */}

          <div className="flex items-center justify-between gap-5 py-5">
            <div className="flex items-start gap-4">

              <div className="rounded-lg bg-slate-950 p-2.5 text-slate-400">
                <ShieldCheck size={19} />
              </div>

              <div>
                <p className="font-medium">
                  Security Alerts
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Get notified about important
                  security events.
                </p>
              </div>

            </div>

            <Toggle
              enabled={securityAlerts}
              onChange={setSecurityAlerts}
            />
          </div>

          {/* COMPACT MODE */}

          <div className="flex items-center justify-between gap-5 py-5">
            <div className="flex items-start gap-4">

              <div className="rounded-lg bg-slate-950 p-2.5 text-slate-400">
                <Monitor size={19} />
              </div>

              <div>
                <p className="font-medium">
                  Compact Dashboard
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Use a more compact layout for
                  monitoring screens.
                </p>
              </div>

            </div>

            <Toggle
              enabled={compactMode}
              onChange={setCompactMode}
            />
          </div>

        </div>
      </div>

      {/* ACTIONS */}

      <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:flex-row md:items-center">

        <div>
          <h2 className="font-bold">
            Save Configuration
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your preferences are stored locally
            for this NEXORA session.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
          >
            <RotateCcw size={18} />
            Reset
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={18} />

            {saving
              ? "Saving..."
              : "Save Settings"}
          </button>

        </div>
      </div>

      {/* DANGER ZONE */}

      <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div className="flex items-start gap-4">

            <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
              <AlertCircle size={21} />
            </div>

            <div>
              <h2 className="font-bold">
                Session Controls
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sign out from this NEXORA account
                and clear the active session.
              </p>
            </div>

          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>
      </div>

      {/* FOOTER */}

      <div className="mt-8 border-t border-slate-800 pt-5 text-xs text-slate-600">
        NEXORA Smart Infrastructure Monitoring
        Platform • Account & System Settings
      </div>

    </div>
  );
}

export default Settings;