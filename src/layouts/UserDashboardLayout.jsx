import { useEffect, useState } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Bell,
  BarChart3,
  MessageCircle,
  ShoppingCart,
  FolderKanban,
  BookOpen,
  MoreHorizontal,
  Settings,
  User,
  Calendar,
} from "lucide-react";
import { getMe, getStoredToken, setStoredToken } from "@/lib/authApi";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const SIDEBAR_NAV = [
  { to: "/dashboard", end: true, label: "Overview", icon: Home },
  { to: "/dashboard/audit", end: false, label: "Audit", icon: BarChart3 },
  { to: "/dashboard/chat", end: false, label: "Chat", icon: MessageCircle, badge: true },
  { to: "/dashboard/marketplace", end: false, label: "Services & Themes", icon: ShoppingCart },
  { to: "/dashboard/projects", end: false, label: "Projects", icon: FolderKanban },
  { to: "/dashboard/resources", end: false, label: "Resources", icon: BookOpen },
];

export default function UserDashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "01 Jan 2026", end: "31 Jan 2026" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      navigate("/auth?redirect=/dashboard", { replace: true });
      return;
    }
    (async () => {
      try {
        const me = await getMe();
        if (!me) {
          setStoredToken(null);
          navigate("/auth", { replace: true });
          return;
        }
        setUser(me);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleLogout = () => {
    setStoredToken(null);
    sessionStorage.removeItem("elursh_onboarding_session");
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Left Sidebar - icon + label on wider screens */}
      <aside className="w-16 lg:w-52 flex flex-col py-6 bg-white border-r border-neutral-200 shrink-0">
        <Link to="/" className="px-4 mb-8 flex items-center gap-2">
          <img src={logo} alt="Elursh" className="h-6 w-auto" />
        </Link>
        <nav className="flex-1 flex flex-col gap-1 px-3">
          {SIDEBAR_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800"
                )
              }
            >
              <span className="relative shrink-0">
                <item.icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </span>
              <span className="hidden lg:inline truncate">{item.label}</span>
            </NavLink>
          ))}
          <div className="w-full border-t border-neutral-200 my-4" />
          <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
            <MoreHorizontal className="w-5 h-5 shrink-0" />
            <span className="hidden lg:inline">More</span>
          </button>
        </nav>
        <div className="px-3 pt-4 border-t border-neutral-200">
          <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 transition-colors w-full">
            <Settings className="w-5 h-5 shrink-0" />
            <span className="hidden lg:inline">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-6 flex items-center justify-between border-b border-neutral-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-full bg-neutral-100 text-neutral-800 text-sm font-medium">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-neutral-600 hover:bg-neutral-50">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-700" />
              </div>
              <span className="text-sm font-medium text-neutral-800">{user?.name || "User"}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">{dateRange.start} – {dateRange.end}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
