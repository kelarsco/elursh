import { useEffect, useState } from "react";
import { Outlet, Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  BarChart3,
  MessageCircle,
  ShoppingCart,
  BookOpen,
  HelpCircle,
  Settings,
  LayoutGrid,
  Activity,
  User,
  Calendar,
  Bell,
} from "lucide-react";
import { getMe, getStoredToken, setStoredToken } from "@/lib/authApi";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

// Main sidebar: Home, Store performance, Chat, Services, Resources, Support, Settings
const SIDEBAR_NAV = [
  { to: "/dashboard", label: "Home", icon: Home, subPaths: ["/dashboard", "/dashboard/activity"] },
  { to: "/dashboard/audit", label: "Store performance", icon: BarChart3, subPaths: ["/dashboard/audit"] },
  { to: "/dashboard/chat", label: "Chat", icon: MessageCircle, badge: true, subPaths: ["/dashboard/chat"] },
  { to: "/dashboard/services/custom-project", label: "Services", icon: ShoppingCart, subPaths: ["/dashboard/services"] },
  { to: "/dashboard/resources/sales-hack", label: "Resources", icon: BookOpen, subPaths: ["/dashboard/resources"] },
  { to: "/dashboard/support", label: "Support", icon: HelpCircle, subPaths: ["/dashboard/support"] },
  { to: "/dashboard/settings", label: "Settings", icon: Settings, subPaths: ["/dashboard/settings"] },
];

const HOME_SUB_NAV = [
  { to: "/dashboard", end: true, label: "Overview", icon: LayoutGrid },
  { to: "/dashboard/activity", end: true, label: "Activity", icon: Activity },
];

const SERVICES_SUB_NAV = [
  { to: "/dashboard/services/custom-project", label: "Custom project", end: false },
  { to: "/dashboard/services/projects", label: "Manage projects", end: false },
  { to: "/dashboard/services/orders", label: "Order History", end: false },
];

const RESOURCES_SUB_NAV = [
  { to: "/dashboard/resources/sales-hack", label: "Sales Hack", end: false },
  { to: "/dashboard/resources/checklist", label: "Checklist", end: false },
];

function getSubNav(pathname) {
  if (pathname.startsWith("/dashboard/services")) return SERVICES_SUB_NAV;
  if (pathname.startsWith("/dashboard/resources")) return RESOURCES_SUB_NAV;
  if (pathname === "/dashboard" || pathname === "/dashboard/activity") return HOME_SUB_NAV;
  return null;
}

export default function UserDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const subNav = getSubNav(location.pathname);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      <aside className="w-16 lg:w-52 flex flex-col py-6 bg-white border-r border-neutral-200 shrink-0">
        <Link to="/" className="px-4 mb-8 flex items-center gap-2">
          <img src={logo} alt="Elursh" className="h-6 w-auto" />
        </Link>
        <nav className="flex-1 flex flex-col gap-1 px-3">
          {SIDEBAR_NAV.map((item) => {
            const isActive = item.subPaths?.some((p) =>
              p === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(p)
            );
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-emerald-100 text-emerald-700" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800"
                )}
              >
                <span className="relative shrink-0">
                  <item.icon className="w-5 h-5" />
                  {item.badge && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />}
                </span>
                <span className="hidden lg:inline truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-6 flex items-center justify-between border-b border-neutral-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            {subNav ? (
              <div className="flex items-center gap-1">
                {subNav.map((s) => (
                  <NavLink
                    key={s.to}
                    to={s.to}
                    end={s.end}
                    className={({ isActive }) =>
                      cn(
                        "px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2",
                        isActive ? "bg-emerald-100 text-emerald-700" : "text-neutral-600 hover:bg-neutral-100"
                      )
                    }
                  >
                    {s.icon && <s.icon className="w-4 h-4" />}
                    {s.label}
                  </NavLink>
                ))}
              </div>
            ) : (
              <span className="px-4 py-2 rounded-full bg-neutral-100 text-neutral-800 text-sm font-medium">
                Dashboard
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-neutral-600 hover:bg-neutral-50">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-700" />
              </div>
              <span className="text-sm font-medium text-neutral-800 hidden sm:inline">{user?.name || "User"}</span>
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
