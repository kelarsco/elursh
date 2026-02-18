import { useState, useEffect, useMemo } from "react";
import {
  getContacts,
  getEmailsSent,
  deleteEmailsSent,
  sendEmail,
  updateContactStatus,
  getEmailTemplates,
} from "@/lib/managerApi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus, Mail, MoreHorizontal, Trash2, Inbox, Send, Eye, AlertTriangle, Calendar as CalendarIcon, ChevronDown, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["pending", "in_progress", "completed", "cancelled", "deleted"];
const TABS = [
  { id: "messages", label: "Messages" },
  { id: "sent", label: "Sent" },
];

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

const METRIC_CARD_COLORS = {
  inbox: "bg-rose-500",
  sent: "bg-emerald-500",
  opens: "bg-blue-500",
  spam: "bg-amber-500",
};

export default function Messages() {
  const [activeTab, setActiveTab] = useState("messages");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [emailsSentList, setEmailsSentList] = useState([]);
  const [emailsSentLoading, setEmailsSentLoading] = useState(false);
  const [emailsSentSelectMode, setEmailsSentSelectMode] = useState(false);
  const [emailsSentSelectedIds, setEmailsSentSelectedIds] = useState(new Set());
  const [emailsSentDeleting, setEmailsSentDeleting] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState(undefined);
  const { toast } = useToast();

  const displayList = list.filter((c) => c.status !== "deleted");
  const effectiveRange =
    datePopoverOpen
      ? pendingRange ??
        (dateFrom || dateTo
          ? { from: ymdToDate(dateFrom), to: ymdToDate(dateTo) }
          : undefined)
      : undefined;
  const getRowKey = (row) => `contact-${row.id}`;
  const toggleSelect = (row) => {
    const key = getRowKey(row);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const selectAll = (listToUse) => {
    const list = listToUse ?? displayList;
    if (!list.length) return;
    const keys = new Set(list.map((r) => getRowKey(r)));
    if (selectedIds.size === keys.size && [...keys].every((k) => selectedIds.has(k))) setSelectedIds(new Set());
    else setSelectedIds(keys);
  };
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    const toDelete = displayList.filter((r) => selectedIds.has(getRowKey(r)));
    try {
      await Promise.all(toDelete.map((r) => updateContactStatus(r.id, "deleted")));
      toast({ title: "Deleted", description: `${toDelete.length} message(s) removed` });
      setSelectedIds(new Set());
      setSelectMode(false);
      setList((prev) => prev.map((c) => (toDelete.some((d) => d.id === c.id) ? { ...c, status: "deleted" } : c)));
      if (selectedMessage && toDelete.some((d) => d.id === selectedMessage.id)) {
        setSelectedMessage(null);
        setDetailsOpen(false);
      }
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const getEmailsSentRowKey = (row) => `email-${row.id}`;
  const toggleEmailsSentSelect = (row) => {
    const key = getEmailsSentRowKey(row);
    setEmailsSentSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const selectAllEmailsSent = (listToUse) => {
    const list = listToUse ?? emailsSentList;
    if (!list.length) return;
    const keys = new Set(list.map((r) => getEmailsSentRowKey(r)));
    if (emailsSentSelectedIds.size === keys.size && [...keys].every((k) => emailsSentSelectedIds.has(k))) setEmailsSentSelectedIds(new Set());
    else setEmailsSentSelectedIds(keys);
  };
  const handleDeleteEmailsSentSelected = async () => {
    if (emailsSentSelectedIds.size === 0) return;
    setEmailsSentDeleting(true);
    const toDelete = emailsSentList.filter((r) => emailsSentSelectedIds.has(getEmailsSentRowKey(r)));
    try {
      await deleteEmailsSent(toDelete.map((r) => r.id));
      toast({ title: "Deleted", description: `${toDelete.length} email(s) removed` });
      setEmailsSentSelectedIds(new Set());
      setEmailsSentSelectMode(false);
      setEmailsSentList((prev) => prev.filter((r) => !toDelete.some((d) => d.id === r.id)));
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setEmailsSentDeleting(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    const loadEmails = () => {
      setEmailsSentLoading(true);
      getEmailsSent()
        .then(setEmailsSentList)
        .catch(() => setEmailsSentList([]))
        .finally(() => setEmailsSentLoading(false));
    };
    loadEmails();
    // Poll for email opens every 10 seconds
    const interval = setInterval(loadEmails, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === "sent") {
      getEmailsSent()
        .then(setEmailsSentList)
        .catch(() => {});
    }
  }, [activeTab]);

  const loadContacts = () => {
    setLoading(true);
    getContacts()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  const loadTemplates = () => {
    getEmailTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]));
  };

  const handleRowClick = (row, e) => {
    if (e.target.closest('[role="combobox"]') || e.target.closest('[role="listbox"]') || e.target.closest('[role="checkbox"]')) return;
    if (selectMode) {
      toggleSelect(row);
      return;
    }
    setSelectedMessage(row);
    setDetailsOpen(true);
  };

  const handleStatusChange = (id, status) => {
    updateContactStatus(id, status)
      .then(() => {
        toast({ title: "Status updated", description: `Status set to ${status}` });
        setList((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
        // Update selected message if it's open
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) => prev ? { ...prev, status } : prev);
        }
      })
      .catch((e) => toast({ title: "Error", description: e.message, variant: "destructive" }));
  };

  const handleReply = (email) => {
    setTo(email);
    setSubject("");
    setBodyText("");
    setBodyHtml("");
    setSelectedTemplateId("");
    setDetailsOpen(false);
    setComposeOpen(true);
  };

  const handleCompose = () => {
    setTo("");
    setSubject("");
    setBodyText("");
    setBodyHtml("");
    setSelectedTemplateId("");
    setComposeOpen(true);
  };

  const handleTemplateChange = (templateId) => {
    setSelectedTemplateId(templateId);
    const tmpl = templates.find((t) => String(t.id) === String(templateId));
    if (tmpl) {
      setSubject((prev) => prev || tmpl.subject || "");
      setBodyText(tmpl.body_text || "");
      setBodyHtml(tmpl.body_html || "");
    }
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    const toEmail = to.trim();
    if (!toEmail) {
      toast({ title: "Error", description: "To email is required", variant: "destructive" });
      return;
    }
    setSending(true);
    sendEmail({
      to_email: toEmail,
      subject: subject.trim(),
      body_text: bodyText.trim() || undefined,
      body_html: bodyHtml.trim() || undefined,
    })
      .then(() => {
        toast({ title: "Email sent", description: `Sent to ${toEmail}` });
        setComposeOpen(false);
        setTo("");
        setSubject("");
        setBodyText("");
        setBodyHtml("");
        if (activeTab === "sent") {
          getEmailsSent()
            .then(setEmailsSentList)
            .catch(() => {});
        }
      })
      .catch((err) => toast({ title: "Error", description: err.message, variant: "destructive" }))
      .finally(() => setSending(false));
  };

  const pendingCount = displayList.filter((c) => c.status !== "completed" && c.status !== "cancelled").length;

  const metrics = useMemo(() => {
    const from = dateFrom.trim() || null;
    const to = dateTo.trim() || null;

    const inboxFiltered = from || to
      ? displayList.filter((c) => inRange(parseDateOnly(c.created_at), from, to))
      : displayList;
    const inboxTotal = inboxFiltered.length;
    const inboxPending = inboxFiltered.filter((c) => c.status !== "completed" && c.status !== "cancelled").length;

    const sentFiltered = from || to
      ? emailsSentList.filter((e) => inRange(parseDateOnly(e.sent_at || e.created_at), from, to))
      : emailsSentList;
    const sentCount = sentFiltered.length;
    const opensCount = sentFiltered.filter((e) => e.opened_at != null).length;

    return {
      inboxTotal,
      inboxPending,
      sentCount,
      opensCount,
      spamCount: 0,
    };
  }, [displayList, emailsSentList, dateFrom, dateTo]);

  const filteredDisplayList = useMemo(() => {
    const from = dateFrom.trim() || null;
    const to = dateTo.trim() || null;
    if (!from && !to) return displayList;
    return displayList.filter((c) => inRange(parseDateOnly(c.created_at), from, to));
  }, [displayList, dateFrom, dateTo]);

  const filteredEmailsSentList = useMemo(() => {
    const from = dateFrom.trim() || null;
    const to = dateTo.trim() || null;
    if (!from && !to) return emailsSentList;
    return emailsSentList.filter((e) => inRange(parseDateOnly(e.sent_at || e.created_at), from, to));
  }, [emailsSentList, dateFrom, dateTo]);

  const metricCards = [
    { id: "inbox", title: "INBOX", subtitle: "Messages received", value: metrics.inboxTotal, pending: metrics.inboxPending, icon: Inbox, progressPercent: Math.min(100, (metrics.inboxTotal || 0) * 5), color: METRIC_CARD_COLORS.inbox },
    { id: "sent", title: "EMAILS SENT", subtitle: "Campaigns & replies", value: metrics.sentCount, icon: Send, progressPercent: Math.min(100, (metrics.sentCount || 0) * 4), color: METRIC_CARD_COLORS.sent },
    { id: "opens", title: "OPENS", subtitle: "Tracked opens", value: metrics.opensCount, icon: Eye, progressPercent: metrics.sentCount ? Math.min(100, (metrics.opensCount / metrics.sentCount) * 100) : 0, color: METRIC_CARD_COLORS.opens },
    { id: "spam", title: "SPAM REPORTS", subtitle: "User-reported spam", value: metrics.spamCount, icon: AlertTriangle, progressPercent: Math.min(100, (metrics.spamCount || 0) * 20), color: METRIC_CARD_COLORS.spam },
  ];

  // Show full-page compose view when composeOpen is true
  if (composeOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-black">Send Email</h1>
            <p className="text-sm text-black/60 mt-1">Send an email to a customer</p>
          </div>
          <Button variant="outline" onClick={() => setComposeOpen(false)}>
            Back to Messages
          </Button>
        </div>

        <div className="manager-glass-panel p-6">
          <form onSubmit={handleSendEmail} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="to">To email</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="customer@example.com"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="template">Template</Label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={handleTemplateChange}
                  onOpenChange={(open) => {
                    if (open && templates.length === 0) loadTemplates();
                  }}
                >
                  <SelectTrigger id="template" className="mt-1">
                    <SelectValue placeholder="Choose template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Subject line"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1"
              />
            </div>
            {/* Side-by-side plain text + HTML editor with preview */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bodyText">Body (plain text)</Label>
                <Textarea
                  id="bodyText"
                  placeholder="Plain text content..."
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={12}
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bodyHtml">Body (HTML)</Label>
                <Textarea
                  id="bodyHtml"
                  placeholder="<p>HTML content...</p>"
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                  rows={8}
                  className="mt-1 font-mono text-sm"
                />
                <div className="mt-2 border rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Live HTML preview</p>
                  <div className="bg-background border rounded-md p-4 max-h-96 overflow-auto text-sm">
                    {/* eslint-disable-next-line react/no-danger */}
                    <div dangerouslySetInnerHTML={{ __html: bodyHtml || "<p class='text-muted-foreground'>Preview will appear here…</p>" }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setComposeOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sending}
                className="bg-black text-white hover:bg-black/90"
              >
                {sending ? "Sending…" : "Send email"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-black">
            Camages
          </h1>
          <p className="text-sm text-black/60 mt-1">
            {activeTab === "messages"
              ? `${pendingCount} pending · ${displayList.length} total${dateFrom || dateTo ? ` · ${filteredDisplayList.length} in range` : ""}`
              : `${emailsSentList.length} sent${dateFrom || dateTo ? ` · ${filteredEmailsSentList.length} in range` : ""}`}
          </p>
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
          <Button
            onClick={handleCompose}
            className="bg-black text-[var(--manager-lime)] hover:bg-black/90 gap-2"
          >
            <Plus className="h-4 w-4" />
            New Message
          </Button>
        </div>
      </div>

      {/* Overview metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map(({ id, title, subtitle, value, pending, icon: Icon, progressPercent, color }) => (
          <div key={id} className="manager-glass-panel p-6 h-full flex flex-col transition-all hover:shadow-lg hover:border-white/70">
            <span className="text-xs font-semibold tracking-wide text-black/70 uppercase">{title}</span>
            <div className="mt-4 flex-1">
              {loading && (id === "inbox" || id === "sent") ? (
                <span className="text-3xl font-bold text-black">—</span>
              ) : (
                <span className="text-3xl md:text-4xl font-bold text-black tracking-tight">
                  {id === "inbox" && pending != null ? `${pending} / ${value}` : value}
                </span>
              )}
              <p className="text-xs text-black/50 mt-1">{subtitle}</p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-black/5 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", color)}
                  style={{ width: loading && (id === "inbox" || id === "sent") ? "0%" : `${Math.max(5, progressPercent)}%` }}
                />
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-black/40 shrink-0 mt-2" />
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <div
          className="inline-flex max-w-full p-1 rounded-full border border-border bg-muted/30"
          role="tablist"
          aria-label="Messages and Sent"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "messages" && (
      <div className="manager-glass-panel overflow-hidden">
        <div className="p-6 border-b border-white/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-black">Contact form submissions</h2>
            <p className="text-sm text-black/60 mt-1">
              Messages from customers via the contact form
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
          ) : filteredDisplayList.length === 0 ? (
            <p className="text-black/60">{dateFrom || dateTo ? "No messages in this date range." : "No messages yet."}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {selectMode && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={filteredDisplayList.length > 0 && selectedIds.size === filteredDisplayList.length}
                        onCheckedChange={() => selectAll(filteredDisplayList)}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  <TableHead>Email</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisplayList.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={(e) => handleRowClick(row, e)}
                    className="cursor-pointer hover:bg-black/5"
                  >
                    {selectMode && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(getRowKey(row))}
                          onCheckedChange={() => toggleSelect(row)}
                          aria-label={`Select ${row.email}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-sm">{row.email || "—"}</TableCell>
                    <TableCell className="font-mono text-sm max-w-[160px] truncate">
                      {row.store_link || "—"}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {row.message || "—"}
                    </TableCell>
                    <TableCell>{row.source || "—"}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={row.status || "pending"}
                        onValueChange={(v) => handleStatusChange(row.id, v)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {row.created_at ? format(new Date(row.created_at), "PPp") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      )}

      {activeTab === "sent" && (
      <div className="manager-glass-panel overflow-hidden">
        <div className="p-6 border-b border-white/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-black">Log of emails sent from the manager</h2>
          <div className="flex items-center gap-2">
            {emailsSentSelectMode && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={handleDeleteEmailsSentSelected}
                  disabled={emailsSentSelectedIds.size === 0 || emailsSentDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete {emailsSentSelectedIds.size > 0 ? `(${emailsSentSelectedIds.size})` : ""}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    setEmailsSentSelectMode(false);
                    setEmailsSentSelectedIds(new Set());
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
            {!emailsSentSelectMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 manager-pill rounded-lg">
                    <MoreHorizontal className="h-5 w-5 text-black/70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="manager-glass-panel border-white/50">
                  <DropdownMenuItem onClick={() => setEmailsSentSelectMode(true)}>
                    Select multiple
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <div className="p-6">
          {emailsSentLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : filteredEmailsSentList.length === 0 ? (
            <p className="text-black/60">{dateFrom || dateTo ? "No emails sent in this date range." : "No emails sent yet."}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {emailsSentSelectMode && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={filteredEmailsSentList.length > 0 && emailsSentSelectedIds.size === filteredEmailsSentList.length}
                        onCheckedChange={() => selectAllEmailsSent(filteredEmailsSentList)}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  <TableHead>To</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Sent at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmailsSentList.map((row) => (
                  <TableRow key={row.id}>
                    {emailsSentSelectMode && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={emailsSentSelectedIds.has(getEmailsSentRowKey(row))}
                          onCheckedChange={() => toggleEmailsSentSelect(row)}
                          aria-label={`Select ${row.to_email}`}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{row.to_email}</span>
                        {row.opened_at && (
                          <Eye className="h-4 w-4 text-green-600 shrink-0" title={`Opened ${format(new Date(row.opened_at), "PPp")}`} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate" title={row.subject || ""}>
                      {row.subject || "—"}
                    </TableCell>
                    <TableCell>{row.sent_at ? format(new Date(row.sent_at), "PPp") : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      )}

      {/* Message details modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl font-inter [&_h2]:font-sans [&_h3]:font-sans [&_button]:font-sans">
          <DialogHeader>
            <DialogTitle className="font-sans">Message Details</DialogTitle>
            <DialogDescription className="font-inter">
              Contact form submission from {selectedMessage?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4 font-inter">
              {selectedMessage.name && (
                <div>
                  <Label className="text-sm font-medium text-black/70 font-sans">Name</Label>
                  <p className="mt-1 font-mono text-sm">{selectedMessage.name}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-black/70 font-sans">Email</Label>
                <p className="mt-1 font-mono text-sm">{selectedMessage.email}</p>
              </div>
              {selectedMessage.store_link && (
                <div>
                  <Label className="text-sm font-medium text-black/70 font-sans">Store</Label>
                  <p className="mt-1 font-mono text-sm">{selectedMessage.store_link}</p>
                </div>
              )}
              {selectedMessage.primary_goal && (
                <div>
                  <Label className="text-sm font-medium text-black/70 font-sans">Primary goal</Label>
                  <p className="mt-1 text-sm">{selectedMessage.primary_goal.replace(/_/g, " ")}</p>
                </div>
              )}
              {selectedMessage.budget && (
                <div>
                  <Label className="text-sm font-medium text-black/70 font-sans">Price range</Label>
                  <p className="mt-1 text-sm">
                    {selectedMessage.budget === "skip" || selectedMessage.budget === "Prefer not to say"
                      ? "Not specified"
                      : selectedMessage.budget.includes("-")
                        ? `$${selectedMessage.budget.replace("-", " – $")}`
                        : `$${selectedMessage.budget}`}
                  </p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-black/70 font-sans">Message</Label>
                <p className="mt-1 text-sm whitespace-pre-wrap">{selectedMessage.message || "—"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-black/70 font-sans">Source</Label>
                <p className="mt-1 text-sm">{selectedMessage.source || "—"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-black/70 font-sans">Status</Label>
                <div className="mt-1">
                  <Select
                    value={selectedMessage.status || "pending"}
                    onValueChange={(v) => handleStatusChange(selectedMessage.id, v)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-black/70 font-sans">Received</Label>
                <p className="mt-1 text-sm">
                  {selectedMessage.created_at ? format(new Date(selectedMessage.created_at), "PPpp") : "—"}
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => handleReply(selectedMessage.email)}
                  className="bg-black text-[var(--manager-lime)] hover:bg-black/90 gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
