import { useState, useEffect, useMemo } from "react";
import { getOrders, updateOrderStatus, getOtherPurchases, updatePaymentFulfillmentStatus, deleteOrders } from "@/lib/managerApi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, ChevronDown, MoreHorizontal, Trash2 } from "lucide-react";
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

const ORDER_STATUS_OPTIONS = ["pending", "approved", "in_progress", "completed", "cancelled", "deleted"];
const PAYMENT_STATUS_OPTIONS = ["pending", "in_progress", "completed", "cancelled", "deleted"];

/** Normalize orders and other purchases into one list: { type, id, email, store_link, service, package_name, price, status, created_at, ... } */
function buildCombinedList(orders, otherPurchases) {
  const orderRows = (orders || []).map((o) => ({
    type: "order",
    id: o.id,
    email: o.email,
    store_link: o.store_link,
    service: o.service_title || "—",
    package_name: o.package_name,
    price: o.package_price_usd,
    status: o.status || "pending",
    created_at: o.created_at,
    collaborator_code: o.collaborator_code,
  }));
  const paymentRows = (otherPurchases || []).map((p) => ({
    type: "payment",
    id: p.id,
    email: p.email,
    store_link: p.store_url || "",
    service: p.product_label || "—",
    package_name: null,
    price: null,
    status: p.fulfillment_status || "pending",
    created_at: p.created_at,
    product_type: p.product_type,
    store_url: p.store_url,
  }));
  const combined = [...orderRows, ...paymentRows];
  combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  return combined;
}

export default function Orders() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otherList, setOtherList] = useState([]);
  const [otherLoading, setOtherLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState(undefined);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
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

  const combinedList = useMemo(() => buildCombinedList(list, otherList), [list, otherList]);

  const filteredList = useMemo(() => {
    const from = dateFrom.trim() || null;
    const to = dateTo.trim() || null;
    let result = combinedList;
    if (from || to) result = result.filter((r) => inRange(parseDateOnly(r.created_at), from, to));
    if (statusFilter) result = result.filter((r) => (r.status || "") === statusFilter);
    if (typeFilter) {
      if (typeFilter === "theme") result = result.filter((r) => r.type === "payment" && r.product_type === "theme");
      else if (typeFilter === "service") result = result.filter((r) => r.type === "order");
      else if (typeFilter === "fix_it_manual") result = result.filter((r) => r.type === "payment" && r.product_type === "fix_it_manual");
    }
    return result;
  }, [combinedList, dateFrom, dateTo, statusFilter, typeFilter]);

  useEffect(() => {
    setLoading(true);
    setOtherLoading(true);
    getOrders()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
    getOtherPurchases()
      .then(setOtherList)
      .catch(() => setOtherList([]))
      .finally(() => setOtherLoading(false));
  }, []);

  const onOrderStatusChange = (orderId, status) => {
    updateOrderStatus(orderId, status)
      .then(() => {
        toast({ title: "Order updated", description: `Status set to ${status}` });
        setList((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      })
      .catch((e) => toast({ title: "Error", description: e.message, variant: "destructive" }));
  };

  const onPaymentStatusChange = (paymentId, status) => {
    updatePaymentFulfillmentStatus(paymentId, status)
      .then(() => {
        toast({ title: "Status updated", description: `Fulfillment set to ${status}` });
        setOtherList((prev) => prev.map((p) => (p.id === paymentId ? { ...p, fulfillment_status: status } : p)));
      })
      .catch((e) => toast({ title: "Error", description: e.message, variant: "destructive" }));
  };

  const getRowKey = (row) => (row.type === "order" ? `o-${row.id}` : `p-${row.id}`);
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
    const orderIds = toDelete.filter((r) => r.type === "order").map((r) => r.id);
    const paymentIds = toDelete.filter((r) => r.type === "payment").map((r) => r.id);
    try {
      if (orderIds.length > 0) await deleteOrders(orderIds);
      // Soft delete theme/fix-it: hide from Orders but keep in payments table (Payments page)
      await Promise.all(paymentIds.map((id) => updatePaymentFulfillmentStatus(id, "deleted")));
      toast({ title: "Deleted", description: `${toDelete.length} item(s) removed` });
      setSelectedIds(new Set());
      setSelectMode(false);
      setList((prev) => prev.filter((o) => !orderIds.includes(o.id)));
      setOtherList((prev) => prev.filter((p) => !paymentIds.includes(p.id)));
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-black">
          Orders (Bought Services)
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
      <div className="manager-glass-panel overflow-hidden">
        <div className="p-6 border-b border-white/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-black">Review and approve orders</h2>
            <p className="text-sm text-black/60 mt-1">
              Services, Fix-It Manual & theme purchasers
              {(dateFrom || dateTo || statusFilter || typeFilter) ? ` · Showing ${filteredList.length} of ${combinedList.length}` : ""}
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
            <Select value={typeFilter || "all"} onValueChange={(v) => setTypeFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[160px] manager-pill h-9 rounded-lg text-sm font-medium text-black/80 border-white/30">
                <SelectValue placeholder="Product type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="theme">Theme</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="fix_it_manual">Fix-It Manual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[160px] manager-pill h-9 rounded-lg text-sm font-medium text-black/80 border-white/30">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {[...new Set([...ORDER_STATUS_OPTIONS, ...PAYMENT_STATUS_OPTIONS])].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
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
          {loading && otherLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : combinedList.length === 0 ? (
            <p className="text-black/60">No orders or purchases yet.</p>
          ) : filteredList.length === 0 ? (
            <p className="text-black/60">No items match the selected filters.</p>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Price (USD)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredList.map((row) => {
                  const isOrder = row.type === "order";
                  const rowKey = getRowKey(row);
                  const storeHref = row.store_link ? (row.store_link.startsWith("http") ? row.store_link : `https://${row.store_link}`) : null;
                  return (
                    <TableRow key={rowKey}>
                      {selectMode && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(rowKey)}
                            onCheckedChange={() => toggleSelect(row)}
                            aria-label={`Select ${row.email}`}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-mono text-sm">{row.email}</TableCell>
                      <TableCell className="font-mono text-sm max-w-[160px] truncate">
                        {storeHref ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a href={storeHref} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:no-underline truncate block">
                                {row.store_link}
                              </a>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="font-medium text-foreground">Store</p>
                              <p className="text-muted-foreground break-all">{row.store_link || "—"}</p>
                              {row.collaborator_code != null && String(row.collaborator_code).trim() !== "" ? (
                                <>
                                  <p className="font-medium text-foreground mt-2">Collaborator code</p>
                                  <p className="text-muted-foreground font-mono text-xs break-all">{row.collaborator_code}</p>
                                </>
                              ) : null}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {row.type === "payment" && row.product_type === "theme"
                          ? (row.product_label?.replace(/^Theme:\s*/i, "") || "Theme")
                          : row.service}
                      </TableCell>
                      <TableCell>{row.package_name ?? "—"}</TableCell>
                      <TableCell>{row.price != null ? `$${row.price}` : "—"}</TableCell>
                      <TableCell>
                        {isOrder ? (
                          <Select value={row.status || "pending"} onValueChange={(v) => onOrderStatusChange(row.id, v)}>
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s.replace(/_/g, " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Select value={row.status || "pending"} onValueChange={(v) => onPaymentStatusChange(row.id, v)}>
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PAYMENT_STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s.replace(/_/g, " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>{row.created_at ? format(new Date(row.created_at), "MMM d, yy, h:mma") : "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
