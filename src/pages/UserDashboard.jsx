import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Home,
  Bell,
  TrendingUp,
  MessageCircle,
  ShoppingCart,
  FilePlus,
  BookOpen,
  MoreHorizontal,
  Settings,
  User,
  Calendar,
  AlertCircle,
  Zap,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { getMe, getStoredToken, setStoredToken } from "@/lib/authApi";
import { apiBase } from "@/lib/apiBase";
import logo from "@/assets/logo.png";

// Dashboard data - will be replaced with Shopify API data when integrated
// See https://shopify.dev/docs/api for GraphQL Admin API
const MOCK_DASHBOARD = {
  conversionRate: { value: 75, growth: 25 },
  revenue: { value: 5700, growth: 45, trend: [800, 1200, 900, 2500, 1100, 1400, 800] },
  reports: {
    critical: [
      { title: "Checkout error on mobile", type: "critical" },
      { title: "Slow homepage load (4.3s)", type: "critical" },
    ],
    upgrades: [
      { title: "Upsell missing on product pages", type: "upgrade" },
      { title: "No abandoned cart recovery", type: "upgrade" },
    ],
    completed: [
      { title: "Image compression applied", type: "completed" },
      { title: "Product page CTA improved", type: "completed" },
    ],
  },
  projects: { active: 21, pending: 2, completed: 21 },
  highlightMessage: "Your store sales is increased by 25% in the past 30 days. You have done a great job so far.",
};

const chartData = MOCK_DASHBOARD.revenue.trend.map((v, i) => ({
  day: ["S", "M", "T", "W", "T", "F", "S"][i],
  value: v,
}));

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "01 Jan 2026", end: "31 Jan 2026" });

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
        const sid = sessionStorage.getItem("elursh_onboarding_session");
        if (sid) {
          try {
            const base = apiBase || "";
            const res = await fetch(`${base}/api/onboarding/session/${sid}`);
            if (res.ok) {
              const s = await res.json();
              if (s.store_url) setStore(s.store_url);
            }
          } catch {
            // ignore
          }
        }
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
      {/* Left Sidebar */}
      <aside className="w-16 lg:w-20 flex flex-col items-center py-6 bg-white border-r border-neutral-200">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <img src={logo} alt="Elursh" className="h-6 w-auto" />
        </Link>
        <nav className="flex flex-col items-center gap-1 flex-1">
          <Link
            to="/dashboard"
            className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-700"
          >
            <Home className="w-5 h-5" />
          </Link>
          <button className="w-12 h-12 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-8 border-t border-neutral-200 my-4" />
          <button className="w-12 h-12 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
            <TrendingUp className="w-5 h-5" />
          </button>
          <button className="relative w-12 h-12 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <Link
            to="/improve-store"
            className="w-12 h-12 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
          </Link>
          <button className="w-12 h-12 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
            <FilePlus className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
            <BookOpen className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </nav>
        <button className="w-12 h-12 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-full bg-neutral-100 text-neutral-800 text-sm font-medium">
              Dashboard | Overview
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                <User className="w-4 h-4 text-neutral-600" />
              </div>
              <span className="text-sm font-medium text-neutral-800">{user?.name || "User"}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50"
            >
              <Calendar className="w-4 h-4" />
              <span>{dateRange.start} - {dateRange.end}</span>
            </button>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header with welcome */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-neutral-900" style={{ fontFamily: "Space Grotesk" }}>
                Welcome back {user?.name || "User"}
              </h1>
              <h2 className="text-3xl font-semibold text-neutral-900 mt-1" style={{ fontFamily: "Space Grotesk" }}>
                Dashboard Overview
              </h2>
            </div>

            {/* Highlight message card */}
            <div className="mb-8 p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-2xl">⚡</span>
                <h3 className="text-lg font-semibold text-neutral-900 mt-2">Sales</h3>
                <p className="text-neutral-600 mt-1">{MOCK_DASHBOARD.highlightMessage}</p>
              </div>
            </div>

            {/* Dashboard cards grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Conversion rate */}
              <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-neutral-800">Conversion rate</h3>
                  <ArrowUpRight className="w-5 h-5 text-neutral-400" />
                </div>
                <p className="text-4xl font-bold text-neutral-900 mt-4">{MOCK_DASHBOARD.conversionRate.value}%</p>
                <p className="text-sm text-emerald-600 mt-1">&gt; {MOCK_DASHBOARD.conversionRate.growth}%</p>
              </div>

              {/* Revenue trend */}
              <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-neutral-800">Revenue trend</h3>
                  <Calendar className="w-5 h-5 text-neutral-400" />
                </div>
                <p className="text-4xl font-bold text-neutral-900 mt-4">${MOCK_DASHBOARD.revenue.value.toLocaleString()}</p>
                <p className="text-sm text-emerald-600 mt-1">&gt; {MOCK_DASHBOARD.revenue.growth}%</p>
                <div className="h-24 mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={[0, "auto"]} />
                      <Tooltip
                        content={({ active, payload }) =>
                          active && payload?.[0] ? (
                            <div className="bg-neutral-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
                              ${payload[0].value.toLocaleString()}
                            </div>
                          ) : null
                        }
                      />
                      <Bar dataKey="value" fill="rgb(16 185 129)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Report & Fixes */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-neutral-800">Report & Fixes</h3>
                  <AlertCircle className="w-5 h-5 text-neutral-400" />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium">
                    5 critical Blocking sales
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium">
                    7 Upgrades Revenue potential
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium">
                    3 Completed This week
                  </span>
                </div>
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-medium text-neutral-700">Critical</h4>
                  {MOCK_DASHBOARD.reports.critical.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-neutral-800">{r.title}</span>
                    </div>
                  ))}
                  <h4 className="text-sm font-medium text-neutral-700 mt-4">Upgrades</h4>
                  {MOCK_DASHBOARD.reports.upgrades.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-neutral-800">{r.title}</span>
                    </div>
                  ))}
                  <h4 className="text-sm font-medium text-neutral-700 mt-4">Completed</h4>
                  {MOCK_DASHBOARD.reports.completed.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-neutral-800">{r.title}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <Link
                    to="/store-audit"
                    className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium text-center hover:bg-emerald-700 transition-colors"
                  >
                    Run full audit →
                  </Link>
                  <Link
                    to="/improve-store"
                    className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 text-sm font-medium text-center hover:bg-neutral-50 transition-colors"
                  >
                    Start Fixing
                  </Link>
                </div>
              </div>

              {/* Project Information */}
              <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-neutral-800">Project Information</h3>
                  <ArrowUpRight className="w-5 h-5 text-neutral-400" />
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                    View All Projects
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
                    New Project +
                  </button>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-neutral-700">Active Projects</span>
                    <span className="font-semibold text-neutral-900">{MOCK_DASHBOARD.projects.active}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-neutral-700">Pending projects</span>
                    <span className="font-semibold text-neutral-900">{MOCK_DASHBOARD.projects.pending}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-neutral-700">Completed projects</span>
                    <span className="font-semibold text-neutral-900">{MOCK_DASHBOARD.projects.completed}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Connected store */}
            {store && (
              <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200">
                <p className="text-sm text-neutral-600">
                  Connected store: <span className="font-medium text-neutral-800">{store}</span>
                </p>
                <Link to="/get-started" className="text-sm text-emerald-600 hover:underline mt-1 inline-block">
                  Change store
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
