import { useState, useEffect, useMemo } from "react";
import { getPayments, updatePaymentFulfillmentStatus } from "@/lib/managerApi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, ChevronDown, DollarSign, CreditCard, MoreHorizontal, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

function getPaymentSource(row) {
  const meta = row.metadata_json;
  if (!meta) return "other";
  const obj = typeof meta === "string" ? (() => { try { return JSON.parse(meta || "{}"); } catch { return {}; } })() : (meta || {});
  if (obj.product === "fix_it_manual") return "fix_it_manual";
  if (obj.themeName != null || obj.themeId != null) return "theme";
  if (obj.order_id != null || obj.service_title != null) return "service";
  return "other";
}

export default function Payments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState(undefined);
  const [sourceFilter, setSourceFilter] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const effectiveRange =
    datePopoverOpen
      ? pendingRange ??
        (dateFrom || dateTo
          ? { from: ymdToDate(dateFrom), to: ymdToDate(dateTo) }
          : undefined)
      : undefined;

  const enrichedList = useMemo(() =>
    list.map((row) => ({ ...row, source: getPaymentSource(row) })),
  [list]);

  const filteredList = useMemo(() => {
    const from = dateFrom.trim() || null;
    const to = dateTo.trim() || null;
    let result = enrichedList.filter((r) => r.fulfillment_status !== "deleted");
    if (from || to) result = result.filter((r) => inRange(parseDateOnly(r.created_at), from, to));
    if (sourceFilter) result = result.filter((r) => r.source === sourceFilter);
    return result;
  }, [enrichedList, dateFrom, dateTo, sourceFilter]);

  const getRowKey = (row) => `payment-${row.id}`;
  const toggleSelect = (row) => {
    const key = getRowKey(row);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const selectAll = () => {
    if (selectedIds.size === filteredList.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredList.map((r) => getRowKey(r))));
  };
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    const toDelete = filteredList.filter((r) => selectedIds.has(getRowKey(r)));
    try {
      await Promise.all(toDelete.map((r) => updatePaymentFulfillmentStatus(r.id, "deleted")));
      toast({ title: "Deleted", description: `${toDelete.length} payment(s) removed` });
      setSelectedIds(new Set());
      setSelectMode(false);
      setList((prev) => prev.filter((r) => !toDelete.some((d) => d.id === r.id)));
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const totalNonDeleted = useMemo(
    () => enrichedList.filter((r) => r.fulfillment_status !== "deleted").length,
    [enrichedList]
  );

  const totals = useMemo(() => {
    let totalKobo = 0;
    let totalUsd = 0;
    filteredList.forEach((row) => {
      if (row.amount_kobo != null) totalKobo += Number(row.amount_kobo);
      if (row.amount_usd != null) totalUsd += Number(row.amount_usd);
    });
    return { totalKobo, totalUsd };
  }, [filteredList]);

  useEffect(() => {
    setLoading(true);
    getPayments()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const ngn = (kobo) => (kobo != null ? `₦${(Number(kobo) / 100).toLocaleString()}` : "—");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-black">
          Payments
        </h1>
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

      {!loading && list.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="manager-glass-panel rounded-xl border border-white/20 p-4">
            <div className="flex items-center gap-2 text-black/60 text-sm font-medium">
              <CreditCard className="h-4 w-4" />
              Total revenue (NGN)
            </div>
            <p className="mt-2 text-2xl font-bold text-black">
              {ngn(totals.totalKobo)}
            </p>
            <p className="text-xs text-black/50 mt-1">
              {filteredList.length} payment{filteredList.length !== 1 ? "s" : ""} in selected range
            </p>
          </div>
          <div className="manager-glass-panel rounded-xl border border-white/20 p-4">
            <div className="flex items-center gap-2 text-black/60 text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              Total revenue (USD)
            </div>
            <p className="mt-2 text-2xl font-bold text-black">
              {totals.totalUsd > 0 ? `$${totals.totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
            </p>
            <p className="text-xs text-black/50 mt-1">
              {filteredList.length} payment{filteredList.length !== 1 ? "s" : ""} in selected range
            </p>
          </div>
          <div className="manager-glass-panel rounded-xl border border-white/20 p-4 sm:col-span-2 lg:col-span-1">
            <div className="text-black/60 text-sm font-medium">Filters</div>
            <p className="mt-2 text-sm text-black/80">
              {(dateFrom || dateTo || sourceFilter) ? `Showing ${filteredList.length} of ${totalNonDeleted}` : `All ${totalNonDeleted} payments`}
            </p>
          </div>
        </div>
      )}

      <div className="manager-glass-panel overflow-hidden">
        <div className="p-6 border-b border-white/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-black">All payments made on the website</h2>
            <p className="text-sm text-black/60 mt-1">
              Paystack and other payments — synced from website
              {(dateFrom || dateTo || sourceFilter) ? ` · Showing ${filteredList.length} of ${totalNonDeleted}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectMode && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0 || deleting}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    setSelectMode(false);
                    setSelectedIds(new Set());
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
            <Select value={sourceFilter || "all"} onValueChange={(v) => setSourceFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[180px] manager-pill h-9 rounded-lg text-sm font-medium text-black/80 border-white/30">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="theme">Theme</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="fix_it_manual">Fix-It Manual</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {!selectMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 manager-pill rounded-lg">
                    <MoreHorizontal className="h-5 w-5 text-black/70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="manager-glass-panel border-white/50">
                  <DropdownMenuItem onClick={() => setSelectMode(true)}>
                    Select multiple
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : list.length === 0 ? (
            <p className="text-black/60">No payments yet.</p>
          ) : filteredList.length === 0 ? (
            <p className="text-black/60">No payments match the selected filters.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {selectMode && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.size === filteredList.length && filteredList.length > 0}
                        onCheckedChange={selectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  <TableHead>Reference</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Amount (NGN)</TableHead>
                  <TableHead>Amount (USD)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredList.map((row) => (
                  <TableRow key={row.id}>
                    {selectMode && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(getRowKey(row))}
                          onCheckedChange={() => toggleSelect(row)}
                          aria-label={`Select ${row.email}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-sm">{row.reference || "—"}</TableCell>
                    <TableCell className="font-mono text-sm">{row.email || "—"}</TableCell>
                    <TableCell>
                      {row.source === "theme" ? "Theme" : row.source === "service" ? "Service" : row.source === "fix_it_manual" ? "Fix-It Manual" : "Other"}
                    </TableCell>
                    <TableCell>{ngn(row.amount_kobo)}</TableCell>
                    <TableCell>{row.amount_usd != null ? `$${Number(row.amount_usd).toFixed(2)} USD` : "—"}</TableCell>
                    <TableCell>{row.status || "—"}</TableCell>
                    <TableCell>{row.created_at ? format(new Date(row.created_at), "PPp") : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
