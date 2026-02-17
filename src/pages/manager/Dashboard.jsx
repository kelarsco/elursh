import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAnalysedStores, getOrders, getPayments, getContacts } from "@/lib/managerApi";
import { ShoppingBag, ShoppingCart, CreditCard, MessageSquare, ArrowUpRight, Calendar as CalendarIcon, ChevronDown, User } from "react-feather";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

function parseDateOnly(isoOrStr) {
  if (!isoOrStr) return null;
  const s = typeof isoOrStr === "string" ? isoOrStr : isoOrStr;
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return match[0];
  try {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

function inRange(dateStr, from, to) {
  if (!dateStr) return false;
  if (from && dateStr < from) return false;
  if (to && dateStr > to) return false;
  return true;
}

function formatDateLabel(ymd) {
  if (!ymd || ymd.length < 10) return "";
  const [y, m, d] = [ymd.slice(0, 4), ymd.slice(5, 7), ymd.slice(8, 10)];
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(date.getTime())) return ymd;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function getDateRangeButtonLabel(from, to) {
  if (!from && !to) return "All time";
  if (from && to) return `${formatDateLabel(from)} – ${formatDateLabel(to)}`;
  if (from) return `From ${formatDateLabel(from)}`;
  return `Until ${formatDateLabel(to)}`;
}

function ymdToDate(ymd) {
  if (!ymd || ymd.length < 10) return undefined;
  const d = new Date(ymd.slice(0, 4), Number(ymd.slice(5, 7)) - 1, ymd.slice(8, 10));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function dateToYmd(d) {
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const PROGRESS_COLORS = {
  stores: "bg-emerald-500",
  orders: "bg-blue-500",
  payments: "bg-violet-500",
  messages: "bg-rose-500",
};

export default function Dashboard() {
  const location = useLocation();
  const [data, setData] = useState({ stores: [], orders: [], payments: [], contacts: [] });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState(undefined);
  const effectiveRange =
    datePopoverOpen
      ? pendingRange ??
        (dateFrom || dateTo
          ? { from: ymdToDate(dateFrom), to: ymdToDate(dateTo) }
          : undefined)
      : undefined;

  const loadData = () => {
    setFetchError(false);
    setLoading(true);
    Promise.allSettled([getAnalysedStores(), getOrders(), getPayments(), getContacts()])
      .then(([storesRes, ordersRes, paymentsRes, contactsRes]) => {
        const stores = storesRes.status === "fulfilled" && Array.isArray(storesRes.value) ? storesRes.value : [];
        const orders = ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value) ? ordersRes.value : [];
        const payments = paymentsRes.status === "fulfilled" && Array.isArray(paymentsRes.value) ? paymentsRes.value : [];
        const contacts = contactsRes.status === "fulfilled" && Array.isArray(contactsRes.value) ? contactsRes.value : [];
        setData({ stores, orders, payments, contacts });
        const allFailed =
          storesRes.status === "rejected" &&
          ordersRes.status === "rejected" &&
          paymentsRes.status === "rejected" &&
          contactsRes.status === "rejected";
        setFetchError(allFailed);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    if (location.pathname === "/manager" || location.pathname === "/manager/") loadData();
  }, [location.pathname]);

  const counts = useMemo(() => {
    const from = dateFrom.trim() || null;
    const to = dateTo.trim() || null;

    const countStores = from || to
      ? data.stores.filter((s) => inRange(parseDateOnly(s.analysed_at || s.created_at), from, to)).length
      : data.stores.length;

    const pendingOrders = data.orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
    const countOrders = from || to
      ? pendingOrders.filter((o) => inRange(parseDateOnly(o.created_at), from, to)).length
      : pendingOrders.length;

    const filteredPayments = from || to
      ? data.payments.filter((p) => inRange(parseDateOnly(p.created_at), from, to))
      : data.payments;
    const countPayments = filteredPayments.length;
    const totalRevenue = filteredPayments.reduce((sum, p) => {
      const usd = p.amount_usd != null ? Number(p.amount_usd) : null;
      return sum + (Number.isFinite(usd) ? usd : 0);
    }, 0);
    // Current month revenue (for Total Payments card subtitle)
    const now = new Date();
    const currMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const currMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    const currentMonthPayments = data.payments.filter((p) => inRange(parseDateOnly(p.created_at), currMonthStart, currMonthEnd));
    const currentMonthRevenue = currentMonthPayments.reduce((sum, p) => {
      const usd = p.amount_usd != null ? Number(p.amount_usd) : null;
      return sum + (Number.isFinite(usd) ? usd : 0);
    }, 0);

    const pendingContacts = data.contacts.filter((c) => c.status !== "completed" && c.status !== "cancelled" && c.status !== "deleted");
    const countMessages = from || to
      ? pendingContacts.filter((c) => inRange(parseDateOnly(c.created_at), from, to)).length
      : pendingContacts.length;

    return { stores: countStores, orders: countOrders, payments: countPayments, revenue: totalRevenue, currentMonthRevenue, messages: countMessages };
  }, [data, dateFrom, dateTo]);

  const cards = [
    { id: "stores", title: "ANALYSED STORES", subtitle: "Stores audited via website", value: counts.stores, to: "/manager/analysed-stores", icon: ShoppingBag, progressPercent: Math.min(100, (counts.stores || 0) * 3.7) },
    { id: "orders", title: "PENDING ORDERS", subtitle: "Awaiting fulfillment", value: counts.orders, to: "/manager/orders", icon: ShoppingCart, progressPercent: Math.min(100, (counts.orders || 0) * 7) },
    { id: "payments", title: "TOTAL PAYMENTS", subtitle: "Current month revenue", value: counts.payments, revenue: counts.currentMonthRevenue ?? counts.revenue, to: "/manager/payments", icon: CreditCard, progressPercent: Math.min(100, ((counts.currentMonthRevenue ?? counts.revenue) || 0) / 200) },
    { id: "messages", title: "PENDING MESSAGES", subtitle: "Customer inquiries", value: counts.messages, to: "/manager/messages", icon: MessageSquare, progressPercent: Math.min(100, (counts.messages || 0) * 12.5) },
  ];

  const recentActivity = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const items = [];
    (data.stores || []).forEach((row) => {
      const at = (row.analysed_at || row.created_at) ? new Date(row.analysed_at || row.created_at).getTime() : 0;
      if (at > cutoff)
        items.push({
          id: `store-${row.id}`,
          title: "New store audit completed",
          subtitle: (row.store_url || "").replace(/^https?:\/\//i, "").slice(0, 50) || "Store audit",
          at,
          link: "/manager/analysed-stores",
        });
    });
    (data.orders || []).forEach((row) => {
      const at = row.created_at ? new Date(row.created_at).getTime() : 0;
      if (at > cutoff)
        items.push({
          id: `order-${row.id}`,
          title: "New order",
          subtitle: row.email || row.service_title || "Order received",
          at,
          link: "/manager/orders",
        });
    });
    (data.payments || []).forEach((row) => {
      const at = row.created_at ? new Date(row.created_at).getTime() : 0;
      if (at > cutoff)
        items.push({
          id: `payment-${row.id}`,
          title: "Payment received",
          subtitle: row.amount_usd != null ? `$${row.amount_usd}` : row.email || "Payment",
          at,
          link: "/manager/payments",
        });
    });
    (data.contacts || []).forEach((row) => {
      if (["completed", "cancelled", "deleted"].includes((row.status || "").toLowerCase())) return;
      const at = row.created_at ? new Date(row.created_at).getTime() : 0;
      if (at > cutoff)
        items.push({
          id: `contact-${row.id}`,
          title: "New message",
          subtitle: row.email || row.name || "Contact form",
          at,
          link: "/manager/messages",
        });
    });
    return items.sort((a, b) => b.at - a.at).slice(0, 4);
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-black">Manager Overview</h1>
          <p className="text-black/70 mt-1">Welcome back, Elursh Administrator</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="manager-pill h-9 px-4 py-2 rounded-lg text-sm font-medium text-black/80 hover:bg-white/50 hover:text-black gap-2"
              >
                <CalendarIcon className="h-4 w-4 shrink-0 text-black/60" />
                <span>{getDateRangeButtonLabel(dateFrom, dateTo)}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-black/50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 manager-glass-panel border-white/50 shadow-lg rounded-xl overflow-hidden"
              align="end"
              sideOffset={8}
            >
              <div className="p-4 space-y-4">
                <Calendar
                  mode="range"
                  defaultMonth={pendingRange?.from ?? ymdToDate(dateFrom) ?? new Date()}
                  selected={pendingRange}
                  onSelect={setPendingRange}
                  numberOfMonths={1}
                  className="rounded-lg border-0 [&_.rdp-day_range_start]:!bg-black [&_.rdp-day_range_start]:!text-white [&_.rdp-day_range_end]:!bg-black [&_.rdp-day_range_end]:!text-white [&_.rdp-day_range_middle]:!bg-black/15 [&_.rdp-day_range_middle]:!text-black [&_.rdp-caption]:flex [&_.rdp-caption_label]:text-sm [&_.rdp-head_cell]:text-black/70 [&_.rdp-day]:text-black [&_.rdp-day]:rounded-full [&_.rdp-cell]:rounded-full [&_.rdp-nav_button]:rounded-lg"
                />
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
                  <Button variant="ghost" className="h-9 px-4 rounded-lg text-sm font-medium text-black/80 hover:bg-black/5" onClick={() => setDatePopoverOpen(false)}>Cancel</Button>
                  <Button
                    type="button"
                    className="h-9 px-4 rounded-[49px] bg-black text-white hover:bg-black/90 font-medium text-sm"
                    onClick={() => {
                      if (effectiveRange?.from) setDateFrom(dateToYmd(effectiveRange.from));
                      else setDateFrom("");
                      if (effectiveRange?.to) setDateTo(dateToYmd(effectiveRange.to));
                      else setDateTo("");
                      setDatePopoverOpen(false);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ id, title, subtitle, value, revenue, to, icon: Icon, progressPercent }) => (
          <Link key={to} to={to} className="block group">
            <div className="manager-glass-panel p-6 h-full flex flex-col transition-all hover:shadow-lg hover:border-white/70">
              <span className="text-xs font-semibold tracking-wide text-black/70 uppercase">{title}</span>
              <div className="mt-4 flex-1">
                {loading ? (
                  <span className="text-3xl font-bold text-black">—</span>
                ) : fetchError ? (
                  <span className="text-lg font-medium text-amber-600" title="Backend unavailable">Sync unavailable</span>
                ) : (
                  <span className="text-3xl md:text-4xl font-bold text-black tracking-tight">
                    {id === "payments" && revenue != null && revenue > 0 ? `$${revenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : value}
                  </span>
                )}
                <p className="text-xs text-black/50 mt-1">{subtitle}</p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-black/5 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", PROGRESS_COLORS[id])}
                    style={{ width: loading ? "0%" : `${Math.max(5, progressPercent)}%` }}
                  />
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-black/40 group-hover:text-[var(--manager-lime)] transition-colors shrink-0 mt-2" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <div className="manager-glass-panel p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-black/60">No recent activity. Stores audited, orders, payments, and messages will appear here.</p>
            ) : (
              recentActivity.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-black/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black">{item.title}</p>
                    <p className="text-xs text-black/60 mt-0.5 truncate">{item.subtitle}</p>
                    <p className="text-xs text-black/50 mt-1">{formatDistanceToNow(new Date(item.at), { addSuffix: true })}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
          <Link to="/manager/analysed-stores">
            <Button variant="ghost" className="w-full mt-4 manager-pill text-sm font-medium text-black/80 hover:bg-white/50 hover:text-black">
              View All Activity
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
