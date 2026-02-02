import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAnalysedStores, getOrders, getPayments, getContacts } from "@/lib/managerApi";
import { Store, ShoppingCart, CreditCard, MessageSquare, ArrowUpRight, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

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

  // Refetch when user returns to this tab so counts update after running an audit elsewhere
  useEffect(() => {
    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Refetch when navigating back to dashboard so count is fresh
  useEffect(() => {
    if (location.pathname === "/manager" || location.pathname === "/manager/") loadData();
  }, [location.pathname]);

  const counts = useMemo(() => {
    const from = dateFrom.trim() || null;
    const to = dateTo.trim() || null;
    const countStores = from || to
      ? data.stores.filter((s) => inRange(parseDateOnly(s.analysed_at || s.created_at), from, to)).length
      : data.stores.length;
    // Only count non-completed orders
    const pendingOrders = data.orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
    const countOrders = from || to
      ? pendingOrders.filter((o) => inRange(parseDateOnly(o.created_at), from, to)).length
      : pendingOrders.length;
    const countPayments = from || to
      ? data.payments.filter((p) => inRange(parseDateOnly(p.created_at), from, to)).length
      : data.payments.length;
    // Only count non-completed contacts (messages)
    const pendingContacts = data.contacts.filter((c) => c.status !== "completed" && c.status !== "cancelled" && c.status !== "deleted");
    const countMessages = from || to
      ? pendingContacts.filter((c) => inRange(parseDateOnly(c.created_at), from, to)).length
      : pendingContacts.length;
    return { stores: countStores, orders: countOrders, payments: countPayments, messages: countMessages };
  }, [data, dateFrom, dateTo]);

  const cards = [
    { title: "Analysed Stores", subtitle: "Stores audited via website", value: counts.stores, to: "/manager/analysed-stores", icon: Store },
    { title: "Orders", subtitle: "Pending orders", value: counts.orders, to: "/manager/orders", icon: ShoppingCart },
    { title: "Payments", subtitle: "Total payments", value: counts.payments, to: "/manager/payments", icon: CreditCard },
    { title: "Messages", subtitle: "Pending messages", value: counts.messages, to: "/manager/messages", icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-black">
          Manager Overview
        </h1>
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
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 px-4 rounded-lg text-sm font-medium text-black/80 hover:bg-black/5"
                    onClick={() => setDatePopoverOpen(false)}
                  >
                    Cancel
                  </Button>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ title, subtitle, value, to, icon: Icon }) => (
          <Link key={to} to={to} className="block group">
            <div className="manager-glass-panel p-6 h-full flex flex-col transition-all hover:shadow-lg hover:border-white/70">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-medium text-black/70">{title}</span>
                <ArrowUpRight className="h-4 w-4 text-black/40 group-hover:text-[var(--manager-lime)] transition-colors shrink-0" />
              </div>
              <div className="mt-auto">
                {loading ? (
                  <span className="text-3xl font-bold text-black">—</span>
                ) : fetchError ? (
                  <span className="text-lg font-medium text-amber-600" title="Backend unavailable. Check database connection.">Sync unavailable</span>
                ) : (
                  <span className="text-3xl md:text-4xl font-bold text-black tracking-tight">{value}</span>
                )}
                <p className="text-xs text-black/50 mt-1">{subtitle}</p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-black/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--manager-lime)] transition-all duration-500"
                    style={{ width: loading ? "0%" : `${Math.min(100, (value || 0) * 10)}%` }}
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
