import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Map,
  Bell,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(
    localStorage.getItem("nexora_user") || "{}"
  );

  const role = user.role || "USER";

  const menu = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      roles: [
        "USER",
        "ADMIN",
        "OFFICER",
        "CONTRACTOR",
        "INSPECTOR",
      ],
    },
    {
      name: "Projects",
      icon: FolderKanban,
      path: "/projects",
      roles: [
        "USER",
        "ADMIN",
        "OFFICER",
        "CONTRACTOR",
        "INSPECTOR",
      ],
    },
    {
      name: "Analytics",
      icon: BarChart3,
      path: "/analytics",
      roles: [
        "USER",
        "ADMIN",
        "OFFICER",
        "CONTRACTOR",
        "INSPECTOR",
      ],
    },
    {
      name: "Infrastructure Map",
      icon: Map,
      path: "/map",
      roles: [
        "USER",
        "ADMIN",
        "OFFICER",
        "CONTRACTOR",
        "INSPECTOR",
      ],
    },
    {
      name: "Alerts",
      icon: Bell,
      path: "/alerts",
      roles: [
        "USER",
        "ADMIN",
        "OFFICER",
        "CONTRACTOR",
        "INSPECTOR",
      ],
    },
    {
      name: "Reports",
      icon: FileText,
      path: "/reports",
      roles: [
        "USER",
        "ADMIN",
        "OFFICER",
        "CONTRACTOR",
        "INSPECTOR",
      ],
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
      roles: [
        "USER",
        "ADMIN",
        "OFFICER",
        "CONTRACTOR",
        "INSPECTOR",
      ],
    },
  ];

  const visibleMenu = menu.filter((item) =>
    item.roles.includes(role)
  );

  const handleLogout = () => {
    localStorage.removeItem("nexora_token");
    localStorage.removeItem("nexora_user");

    navigate("/login");
  };

  const getRoleStyle = () => {
    switch (role) {
      case "ADMIN":
        return "text-purple-400";

      case "OFFICER":
        return "text-cyan-400";

      case "CONTRACTOR":
        return "text-yellow-400";

      case "INSPECTOR":
        return "text-emerald-400";

      default:
        return "text-slate-400";
    }
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800 bg-slate-950 lg:block">

      {/* LOGO */}

      <div className="border-b border-slate-800 p-6">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-cyan-500/10 p-2">
            <ShieldCheck
              size={24}
              className="text-cyan-400"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-cyan-400">
              NEXORA
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Infrastructure Intelligence
            </p>
          </div>

        </div>

      </div>

      {/* USER */}

      <div className="border-b border-slate-800 p-4">

        <p className="text-sm font-semibold text-white">
          {user.name || "User"}
        </p>

        <p
          className={`mt-1 text-xs font-bold uppercase ${getRoleStyle()}`}
        >
          {role}
        </p>

        <p className="mt-2 truncate text-xs text-slate-600">
          {user.email || "No email"}
        </p>

      </div>

      {/* NAVIGATION */}

      <nav className="mt-6 space-y-2 px-3">

        {visibleMenu.map((item) => {

          const Icon = item.icon;

          const isActive =
            location.pathname === item.path;

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >

              <Icon size={19} />

              <span>
                {item.name}
              </span>

            </button>
          );
        })}

      </nav>

      {/* SECURITY STATUS */}

      <div className="absolute bottom-20 left-3 w-[calc(100%-24px)] rounded-xl border border-slate-800 bg-slate-900/60 p-3">

        <div className="flex items-center gap-2">

          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

          <span className="text-xs text-slate-500">
            Secure Session
          </span>

        </div>

        <p className="mt-1 text-[10px] text-slate-600">
          JWT authenticated
        </p>

      </div>

      {/* LOGOUT */}

      <button
        onClick={handleLogout}
        className="absolute bottom-6 left-3 flex w-[calc(100%-24px)] items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
      >

        <LogOut size={19} />

        <span>
          Logout
        </span>

      </button>

    </aside>
  );
}

export default Sidebar;