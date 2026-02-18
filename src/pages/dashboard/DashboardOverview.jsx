import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Calendar,
  AlertCircle,
  Zap,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { apiBase } from "@/lib/apiBase";
import { getConnectedStores, getShopifyDashboard } from "@/lib/shopifyAuthApi";

// Dashboard data - will be replaced with Shopify API when integrated
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

export default function DashboardOverview() {
  const { user } = useOutletContext() || {};
  const [store, setStore] = useState(null);
  const [reports, setReports] = useState(null);
  const [shopifyData, setShopifyData] = useState(null);
  const [shopifyStore, setShopifyStore] = useState(null);

  useEffect(() => {
    const sid = sessionStorage.getItem("elursh_onboarding_session");
    if (sid) {
      const base = apiBase || "";
      fetch(`${base}/api/onboarding/session/${sid}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((s) => s?.store_url && setStore(s.store_url))
        .catch(() => {});
    }
    getConnectedStores().then((stores) => {
      const shop = stores[0]?.shop;
      if (shop) {
        setShopifyStore(shop);
        getShopifyDashboard(shop).then(setShopifyData);
      }
    }).catch(() => {});
  }, []);

  // Fetch store report if store is connected (store-audit-result returns report_json directly)
  useEffect(() => {
    if (!store) return;
    const base = apiBase || "";
    fetch(`${base}/api/store-audit-result?storeUrl=${encodeURIComponent(store)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setReports(typeof data === "object" ? data : null))
      .catch(() => {});
  }, [store]);

  const displayReports = reports && typeof reports === "object" ? reports : null;
  const criticalCount = displayReports?.critical?.length ?? MOCK_DASHBOARD.reports.critical.length;
  const upgradeCount = displayReports?.upgrades?.length ?? MOCK_DASHBOARD.reports.upgrades.length;
  const completedCount = displayReports?.completed?.length ?? MOCK_DASHBOARD.reports.completed.length;
  const critical = displayReports?.critical ?? MOCK_DASHBOARD.reports.critical;
  const upgrades = displayReports?.upgrades ?? MOCK_DASHBOARD.reports.upgrades;
  const completed = displayReports?.completed ?? MOCK_DASHBOARD.reports.completed;

  const revenueValue = shopifyData?.totalRevenue ?? MOCK_DASHBOARD.revenue.value;
  const revenueGrowth = MOCK_DASHBOARD.revenue.growth;
  const chartData = (shopifyData?.trend?.length ? shopifyData.trend : MOCK_DASHBOARD.revenue.trend.map((v, i) => ({
    day: ["S", "M", "T", "W", "T", "F", "S"][i],
    value: v,
  })));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900" style={{ fontFamily: "Space Grotesk" }}>
          Welcome back {user?.name || "User"}
        </h1>
        <h2 className="text-3xl font-semibold text-neutral-900 mt-1" style={{ fontFamily: "Space Grotesk" }}>
          Dashboard Overview
        </h2>
      </div>

      <div className="mb-8 p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
        <span className="text-2xl">⚡</span>
        <h3 className="text-lg font-semibold text-neutral-900 mt-2">Sales</h3>
        <p className="text-neutral-600 mt-1">
          {shopifyData ? (
            <>Your store has {shopifyData.ordersCount || 0} orders in the last 30 days. Total revenue: ${Number(revenueValue).toLocaleString()}.</>
          ) : (
            MOCK_DASHBOARD.highlightMessage
          )}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-neutral-800">Conversion rate</h3>
            <ArrowUpRight className="w-5 h-5 text-neutral-400" />
          </div>
          <p className="text-4xl font-bold text-neutral-900 mt-4">{(shopifyData?.conversionRate ?? MOCK_DASHBOARD.conversionRate.value)}%</p>
          <p className="text-sm text-emerald-600 mt-1">&gt; {MOCK_DASHBOARD.conversionRate.growth}%</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-neutral-800">Revenue trend</h3>
            <Calendar className="w-5 h-5 text-neutral-400" />
          </div>
                <p className="text-4xl font-bold text-neutral-900 mt-4">${Number(revenueValue).toLocaleString()}</p>
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

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-neutral-800">Report & Fixes</h3>
            <AlertCircle className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium">
              {criticalCount} critical Blocking sales
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium">
              {upgradeCount} Upgrades Revenue potential
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium">
              {completedCount} Completed This week
            </span>
          </div>
          <div className="mt-6 space-y-3">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Critical</h4>
            {critical.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-neutral-800">{r.title ?? r}</span>
              </div>
            ))}
            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mt-4">Upgrades</h4>
            {upgrades.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-neutral-800">{r.title ?? r}</span>
              </div>
            ))}
            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mt-4">Completed</h4>
            {completed.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-neutral-800">{r.title ?? r}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <Link
              to="/dashboard/audit"
              className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium text-center hover:bg-emerald-700 transition-colors"
            >
              Run full audit →
            </Link>
            <Link
              to="/dashboard/services/custom-project"
              className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 text-sm font-medium text-center hover:bg-neutral-50 transition-colors"
            >
              Start Fixing
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-neutral-800">Project Information</h3>
            <ArrowUpRight className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="flex gap-2 mt-4">
            <Link
              to="/dashboard/services/projects"
              className="px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              View All Projects
            </Link>
            <Link
              to="/dashboard/services/custom-project?custom=1"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
            >
              New Project +
            </Link>
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
  );
}
