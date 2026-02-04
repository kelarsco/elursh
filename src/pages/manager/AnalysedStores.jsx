import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getAnalysedStores, getStoreReport, upsertStoreReport, deleteAnalysedStores } from "@/lib/managerApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Store, ChevronRight, MoreVertical, Trash2, Download, FileText, Plus, Trash } from "lucide-react";
import { generateAuditReportPdf, generateFixItManualPdf } from "@/lib/auditPdf";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Default category structure (matches audit: Trust, UX and Accessibility, Products, SEO, Email, Ads)
const DEFAULT_CATEGORY_IDS = ["trust", "ux", "products", "seo", "email", "ads"];
const DEFAULT_CATEGORY_TITLES = {
  trust: "Trust Signals & Credibility",
  ux: "UX and Accessibility",
  products: "Product Pages",
  seo: "SEO Audit",
  email: "Email Marketing & Automation",
  ads: "Ads Readiness & Funnel",
};

// Normalize report/result JSON so modal always has storeInfo, revenueLoss, categories, actionPlan (matches public audit page shape)
function normalizeReportData(data, storeUrl) {
  if (!data || typeof data !== "object") data = {};
  const url = storeUrl ?? data?.storeInfo?.url ?? "";
  const storeInfo = data.storeInfo && typeof data.storeInfo === "object"
    ? { ...data.storeInfo, url: data.storeInfo.url ?? url }
    : { url, platform: "Unknown", industry: "Unknown", country: "Unknown", auditDate: new Date().toLocaleDateString() };
  const revenueLoss = data.revenueLoss && typeof data.revenueLoss === "object"
    ? {
        min: typeof data.revenueLoss.min === "number" ? data.revenueLoss.min : 0,
        max: typeof data.revenueLoss.max === "number" ? data.revenueLoss.max : 0,
        breakdown: Array.isArray(data.revenueLoss.breakdown)
          ? data.revenueLoss.breakdown.map((b) => ({
              label: b?.label ?? "",
              percentage: typeof b?.percentage === "number" ? b.percentage : 0,
              description: b?.description ?? "",
            }))
          : [],
      }
    : { min: 0, max: 0, breakdown: [] };
  const rawCategories = Array.isArray(data.categories)
    ? data.categories.map((c) => ({
        id: c?.id ?? crypto.randomUUID?.() ?? Math.random().toString(36),
        icon: c?.icon ?? "Package",
        title: c?.title ?? "",
        score: typeof c?.score === "number" ? c.score : 0,
        status: c?.status ?? "Average",
        impact: c?.impact ?? "",
        recommendation: c?.recommendation ?? "",
        checks: Array.isArray(c?.checks)
          ? c.checks.map((ch) => ({ item: ch?.item ?? "", details: ch?.details ?? "", status: ch?.status ?? "warning" }))
          : [],
      }))
    : [];
  // Ensure all default categories exist (merge missing ones for admin editing)
  const usedIds = new Set();
  const categories = DEFAULT_CATEGORY_IDS.map((id) => {
    const defTitle = DEFAULT_CATEGORY_TITLES[id];
    const existing = rawCategories.find((c) => c.id === id || c.title === defTitle || (c.title || "").toLowerCase().includes(id));
    if (existing && !usedIds.has(existing.id)) {
      usedIds.add(existing.id);
      return existing;
    }
    return {
      id,
      icon: "Package",
      title: defTitle,
      score: 50,
      status: "Average",
      impact: "",
      recommendation: "",
      checks: [],
    };
  });
  // Append any extra categories from the report (e.g. custom)
  rawCategories.filter((c) => !usedIds.has(c.id)).forEach((c) => categories.push(c));
  const actionPlan = Array.isArray(data.actionPlan)
    ? data.actionPlan.map((a) => ({
        icon: a?.icon ?? "TrendingUp",
        action: a?.action ?? "",
        timeEstimate: a?.timeEstimate ?? "",
        revenueImpact: a?.revenueImpact ?? "",
        priority: a?.priority ?? "Medium",
      }))
    : [];
  return {
    ...data,
    storeInfo,
    revenueLoss,
    categories,
    actionPlan,
    overallScore: typeof data.overallScore === "number" ? data.overallScore : (categories.reduce((s, c) => s + (c.score || 0), 0) / (categories.length || 1)) | 0,
    status: data.status ?? "Average",
  };
}

export default function AnalysedStores() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(null);
  const { toast } = useToast();

  const loadList = () => {
    setLoading(true);
    getAnalysedStores()
      .then((arr) => setList(Array.isArray(arr) ? arr : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadList();
  }, []);

  // Refetch when user returns to this tab so list updates after running an audit elsewhere
  useEffect(() => {
    const onFocus = () => loadList();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const location = useLocation();
  // Refetch when navigating to this page so list is fresh
  useEffect(() => {
    if (location.pathname === "/manager/analysed-stores") loadList();
  }, [location.pathname]);

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((row) => {
      const url = (row.store_url || "").toLowerCase();
      const analysedAt = row.analysed_at ? format(new Date(row.analysed_at), "PPp").toLowerCase() : "";
      const createdAt = row.created_at ? format(new Date(row.created_at), "PP").toLowerCase() : "";
      return url.includes(q) || analysedAt.includes(q) || createdAt.includes(q);
    });
  }, [list, searchQuery]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setDeleting(true);
    deleteAnalysedStores(ids)
      .then(() => {
        setList((prev) => prev.filter((row) => !selectedIds.has(row.id)));
        setSelectedIds(new Set());
        setSelectionMode(false);
        setDeleteConfirmOpen(false);
        toast({ title: "Deleted", description: `${ids.length} store(s) removed.` });
      })
      .catch((e) => toast({ title: "Error", description: e.message, variant: "destructive" }))
      .finally(() => setDeleting(false));
  };

  const openStoreModal = (row) => {
    if (selectionMode) return;
    setSelectedStore(row);
    setReportData(null);
    setReportLoading(true);
    const normalizedUrl = (row.store_url || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase() || row.store_url;
    getStoreReport(row.store_url)
      .then((report) => {
        let raw = null;
        if (report?.report_json && typeof report.report_json === "object") raw = report.report_json;
        else if (report?.report_json && typeof report.report_json === "string") {
          try { raw = JSON.parse(report.report_json); } catch { raw = {}; }
        }
        if (!raw && row.result_json) {
          raw = typeof row.result_json === "object" ? row.result_json : (() => { try { return JSON.parse(row.result_json); } catch { return {}; } })();
        }
        setReportData(normalizeReportData(raw || {}, normalizedUrl));
      })
      .catch(() => {
        let raw = null;
        if (row.result_json && typeof row.result_json === "object") raw = row.result_json;
        else if (row.result_json && typeof row.result_json === "string") {
          try { raw = JSON.parse(row.result_json); } catch { raw = {}; }
        }
        setReportData(normalizeReportData(raw || {}, normalizedUrl));
      })
      .finally(() => setReportLoading(false));
  };

  const handleSaveReport = () => {
    if (!selectedStore?.store_url || !reportData) return;
    setSaving(true);
    upsertStoreReport(selectedStore.store_url, reportData)
      .then(() => {
        toast({ title: "Saved", description: "What the store owner sees has been updated." });
      })
      .catch((e) => toast({ title: "Error", description: e.message, variant: "destructive" }))
      .finally(() => setSaving(false));
  };

  const updateStoreInfo = (key, value) => {
    setReportData((prev) => prev ? { ...prev, storeInfo: { ...prev.storeInfo, [key]: value } } : prev);
  };
  const updateRevenueLoss = (key, value) => {
    setReportData((prev) => prev ? { ...prev, revenueLoss: { ...prev.revenueLoss, [key]: value } } : prev);
  };
  const updateBreakdown = (index, key, value) => {
    setReportData((prev) => {
      if (!prev?.revenueLoss?.breakdown) return prev;
      const breakdown = [...prev.revenueLoss.breakdown];
      breakdown[index] = { ...breakdown[index], [key]: value };
      return { ...prev, revenueLoss: { ...prev.revenueLoss, breakdown } };
    });
  };
  const updateCategory = (catIndex, key, value) => {
    setReportData((prev) => {
      if (!prev?.categories) return prev;
      const categories = [...prev.categories];
      categories[catIndex] = { ...categories[catIndex], [key]: value };
      return { ...prev, categories };
    });
  };
  const updateCheck = (catIndex, checkIndex, key, value) => {
    setReportData((prev) => {
      if (!prev?.categories?.[catIndex]?.checks) return prev;
      const categories = prev.categories.map((c, i) =>
        i !== catIndex ? c : { ...c, checks: c.checks.map((ch, j) => (j !== checkIndex ? ch : { ...ch, [key]: value })) }
      );
      return { ...prev, categories };
    });
  };
  const updateAction = (index, key, value) => {
    setReportData((prev) => {
      if (!prev?.actionPlan) return prev;
      const actionPlan = prev.actionPlan.map((a, i) => (i !== index ? a : { ...a, [key]: value }));
      return { ...prev, actionPlan };
    });
  };
  const addCategory = () => {
    setReportData((prev) => {
      if (!prev) return prev;
      const categories = [...(prev.categories ?? []), {
        id: crypto.randomUUID?.() ?? `cat-${Date.now()}`,
        icon: "Package",
        title: "New category",
        score: 50,
        status: "Average",
        impact: "",
        recommendation: "",
        checks: [],
      }];
      return { ...prev, categories };
    });
  };
  const addCheck = (catIndex) => {
    setReportData((prev) => {
      if (!prev?.categories?.[catIndex]) return prev;
      const categories = prev.categories.map((c, i) =>
        i !== catIndex ? c : { ...c, checks: [...(c.checks ?? []), { item: "", details: "", status: "warning" }] }
      );
      return { ...prev, categories };
    });
  };
  const removeCategory = (catIndex) => {
    setReportData((prev) => {
      if (!prev?.categories) return prev;
      const categories = prev.categories.filter((_, i) => i !== catIndex);
      return { ...prev, categories };
    });
  };
  const removeCheck = (catIndex, checkIndex) => {
    setReportData((prev) => {
      if (!prev?.categories?.[catIndex]?.checks) return prev;
      const categories = prev.categories.map((c, i) =>
        i !== catIndex ? c : { ...c, checks: c.checks.filter((_, j) => j !== checkIndex) }
      );
      return { ...prev, categories };
    });
  };
  const addAction = () => {
    setReportData((prev) => {
      if (!prev) return prev;
      const actionPlan = [...(prev.actionPlan ?? []), { icon: "TrendingUp", action: "", timeEstimate: "", revenueImpact: "", priority: "Medium" }];
      return { ...prev, actionPlan };
    });
  };
  const removeAction = (index) => {
    setReportData((prev) => {
      if (!prev?.actionPlan) return prev;
      const actionPlan = prev.actionPlan.filter((_, i) => i !== index);
      return { ...prev, actionPlan };
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-black">
        Analysed Stores
      </h1>
      <div className="manager-glass-panel overflow-hidden">
        <div className="p-6 border-b border-white/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-black">All stores that have run an audit</h2>
              <p className="text-sm text-black/60 mt-1">
                {selectionMode
                  ? "Click stores to select, then delete selected below."
                  : "Click a store to view and edit what the store owner sees"}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-end">
              <div className="relative flex-1 sm:flex-initial sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/50" />
                <Input
                  type="search"
                  placeholder="Search stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/50 border-black/10 text-black placeholder:text-black/50"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 text-black/70 hover:bg-black/10">
                    <MoreVertical className="h-5 w-5" />
                    <span className="sr-only">Options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-black/10">
                  <DropdownMenuItem onClick={() => setSelectionMode(true)}>
                    Select multiple
                  </DropdownMenuItem>
                  {selectionMode && (
                    <DropdownMenuItem onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); }}>
                      Cancel selection
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        {selectionMode && selectedIds.size > 0 && (
          <div className="px-6 py-3 border-b border-white/20 flex items-center justify-between gap-4 bg-black/5">
            <span className="text-sm text-black/70">{selectedIds.size} selected</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete selected
            </Button>
          </div>
        )}
        <div className="p-6">
          {loading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : list.length === 0 ? (
            <p className="text-black/60">No analysed stores yet.</p>
          ) : filteredList.length === 0 ? (
            <p className="text-black/60">No stores match your search.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredList.map((row) => (
                <div
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectionMode ? toggleSelect(row.id) : openStoreModal(row)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectionMode ? toggleSelect(row.id) : openStoreModal(row);
                    }
                  }}
                  className={`manager-glass-panel flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-black/20 ${
                    selectionMode && selectedIds.has(row.id)
                      ? "border-[var(--manager-lime)] bg-[var(--manager-lime)]/10"
                      : "border-white/20 hover:border-white/40 hover:shadow-md"
                  }`}
                >
                  {selectionMode && (
                    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(row.id)}
                        onCheckedChange={() => toggleSelect(row.id)}
                        className="shrink-0 border-black/30 data-[state=checked]:bg-black data-[state=checked]:border-black"
                      />
                    </div>
                  )}
                  {!selectionMode && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/10">
                      <Store className="h-5 w-5 text-black/70" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-medium text-black truncate" title={row.store_url}>
                      {row.store_url}
                    </p>
                    <p className="text-xs text-black/50 mt-0.5">
                      {row.analysed_at ? format(new Date(row.analysed_at), "PPp") : "—"}
                    </p>
                  </div>
                  {!selectionMode && <ChevronRight className="h-5 w-5 shrink-0 text-black/40" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedStore} onOpenChange={(open) => !open && setSelectedStore(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col gap-0 border-2 border-gray-200 bg-white p-0 overflow-hidden shadow-xl font-inter">
          <DialogHeader className="p-6 pb-4 border-b-2 border-gray-200 bg-gray-50 shrink-0 font-inter">
            <DialogTitle className="text-xl text-gray-900 font-space font-semibold">
              Store audit: {selectedStore?.store_url ?? ""}
            </DialogTitle>
            <DialogDescription className="text-gray-600 font-inter">
              Edit every field below. This is what the store owner sees when they run an audit. Save to update.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white font-inter">
            {reportLoading ? (
              <Skeleton className="h-64 w-full rounded-lg border border-gray-200" />
            ) : reportData ? (
              <>
                {/* Store info + overall score */}
                <section className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 space-y-4 font-inter">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide font-space">Store info & overall score</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="font-inter"
                        disabled={pdfLoading !== null}
                        onClick={async () => {
                          if (!reportData || !selectedStore?.store_url) return;
                          setPdfLoading("audit");
                          try {
                            await generateAuditReportPdf(reportData, selectedStore.store_url);
                            toast({ title: "Audit report downloaded", description: "PDF saved to your device." });
                          } catch (e) {
                            toast({ variant: "destructive", title: "Download failed", description: e?.message || "Could not generate PDF." });
                          } finally {
                            setPdfLoading(null);
                          }
                        }}
                      >
                        {pdfLoading === "audit" ? (
                          <span className="animate-pulse">Generating…</span>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-1.5" />
                            Download audit report (PDF)
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="font-inter"
                        disabled={pdfLoading !== null}
                        onClick={async () => {
                          if (!reportData || !selectedStore?.store_url) return;
                          setPdfLoading("fixit");
                          try {
                            await generateFixItManualPdf(reportData, selectedStore.store_url);
                            toast({ title: "Fix-It Manual downloaded", description: "PDF saved to your device." });
                          } catch (e) {
                            toast({ variant: "destructive", title: "Download failed", description: e?.message || "Could not generate PDF." });
                          } finally {
                            setPdfLoading(null);
                          }
                        }}
                      >
                        {pdfLoading === "fixit" ? (
                          <span className="animate-pulse">Generating…</span>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-1.5" />
                            Download Fix-It Manual (PDF)
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-gray-700 font-inter">Store URL</Label>
                      <Input
                        value={reportData.storeInfo?.url ?? ""}
                        onChange={(e) => updateStoreInfo("url", e.target.value)}
                        className="mt-1 border-gray-300 bg-white text-gray-900 font-inter"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-inter">Platform</Label>
                      <Input
                        value={reportData.storeInfo?.platform ?? ""}
                        onChange={(e) => updateStoreInfo("platform", e.target.value)}
                        className="mt-1 border-gray-300 bg-white text-gray-900 font-inter"
                        placeholder="e.g. Shopify"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-inter">Industry</Label>
                      <Input
                        value={reportData.storeInfo?.industry ?? ""}
                        onChange={(e) => updateStoreInfo("industry", e.target.value)}
                        className="mt-1 border-gray-300 bg-white text-gray-900 font-inter"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-inter">Country</Label>
                      <Input
                        value={reportData.storeInfo?.country ?? ""}
                        onChange={(e) => updateStoreInfo("country", e.target.value)}
                        className="mt-1 border-gray-300 bg-white text-gray-900 font-inter"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-inter">Audit date (display)</Label>
                      <Input
                        value={reportData.storeInfo?.auditDate ?? ""}
                        onChange={(e) => updateStoreInfo("auditDate", e.target.value)}
                        className="mt-1 border-gray-300 bg-white text-gray-900 font-inter"
                        placeholder="e.g. Jan 31, 2026"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-inter">Overall score (0–100)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={reportData.overallScore ?? 0}
                        onChange={(e) => setReportData((p) => (p ? { ...p, overallScore: Number(e.target.value) || 0 } : p))}
                        className="mt-1 border-gray-300 bg-white text-gray-900 font-inter"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-inter">Status (e.g. Medium, Good)</Label>
                      <Input
                        value={reportData.status ?? ""}
                        onChange={(e) => setReportData((p) => (p ? { ...p, status: e.target.value } : p))}
                        className="mt-1 border-gray-300 bg-white text-gray-900 font-inter"
                        placeholder="Medium"
                      />
                    </div>
                  </div>
                  {selectedStore && (
                    <p className="text-xs text-gray-500 font-inter">
                      Last analysed: {selectedStore.analysed_at ? format(new Date(selectedStore.analysed_at), "PPpp") : "—"} · First seen: {selectedStore.created_at ? format(new Date(selectedStore.created_at), "PP") : "—"}
                    </p>
                  )}
                </section>

                {/* Estimated monthly revenue loss */}
                <section className="rounded-xl border-2 border-red-200 bg-red-50 p-4 space-y-4 font-inter">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide font-space">Estimated monthly revenue loss</h3>
                  <div className="flex flex-wrap gap-4 items-end">
                    <div>
                      <Label className="text-gray-700 font-inter">Min ($)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={reportData.revenueLoss?.min ?? 0}
                        onChange={(e) => updateRevenueLoss("min", Number(e.target.value) || 0)}
                        className="mt-1 w-32 border-gray-300 bg-white text-gray-900 font-inter"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-inter">Max ($)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={reportData.revenueLoss?.max ?? 0}
                        onChange={(e) => updateRevenueLoss("max", Number(e.target.value) || 0)}
                        className="mt-1 w-32 border-gray-300 bg-white text-gray-900 font-inter"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-inter">Breakdown (label, %, description)</Label>
                    <div className="mt-2 space-y-3">
                      {(reportData.revenueLoss?.breakdown ?? []).map((item, index) => (
                        <div key={index} className="flex flex-wrap gap-2 items-start rounded-lg border border-gray-200 bg-white p-3 font-inter">
                          <Input
                            value={item.label}
                            onChange={(e) => updateBreakdown(index, "label", e.target.value)}
                            placeholder="Label"
                            className="flex-1 min-w-[120px] border-gray-300 text-gray-900 font-inter"
                          />
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={item.percentage}
                            onChange={(e) => updateBreakdown(index, "percentage", Number(e.target.value) || 0)}
                            placeholder="%"
                            className="w-20 border-gray-300 text-gray-900 font-inter"
                          />
                          <Textarea
                            value={item.description}
                            onChange={(e) => updateBreakdown(index, "description", e.target.value)}
                            placeholder="Description"
                            rows={1}
                            className="flex-1 min-w-[200px] border-gray-300 text-gray-900 font-inter"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Detailed audit results – categories */}
                <section className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 space-y-4 font-inter">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide font-space">Detailed audit results (categories)</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addCategory} className="gap-1.5 font-inter">
                      <Plus className="w-4 h-4" />
                      Add category
                    </Button>
                  </div>
                  <div className="space-y-6">
                    {(reportData.categories ?? []).map((category, catIndex) => (
                      <div key={category.id ?? catIndex} className="rounded-lg border-2 border-gray-200 bg-white p-4 space-y-4 font-inter">
                        <div className="flex items-start justify-between gap-2">
                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 flex-1">
                          <div>
                            <Label className="text-gray-700 font-inter">Category title</Label>
                            <Input
                              value={category.title}
                              onChange={(e) => updateCategory(catIndex, "title", e.target.value)}
                              className="mt-1 border-gray-300 bg-white text-gray-900 font-inter"
                              placeholder="e.g. SEO Optimization"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-inter">Score (0–100)</Label>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={category.score}
                              onChange={(e) => updateCategory(catIndex, "score", Number(e.target.value) || 0)}
                              className="mt-1 border-gray-300 bg-white text-gray-900 font-inter"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-inter">Status</Label>
                            <Input
                              value={category.status}
                              onChange={(e) => updateCategory(catIndex, "status", e.target.value)}
                              className="mt-1 border-gray-300 bg-white text-gray-900 font-inter"
                              placeholder="Good / Average / Needs improvement"
                            />
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeCategory(catIndex)} className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash className="w-4 h-4" />
                          <span className="sr-only">Remove category</span>
                        </Button>
                        </div>
                        <div>
                          <Label className="text-gray-700 font-inter">Impact</Label>
                          <Textarea
                            value={category.impact}
                            onChange={(e) => updateCategory(catIndex, "impact", e.target.value)}
                            rows={2}
                            className="mt-1 border-gray-300 bg-white text-gray-900 font-inter"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-inter">Recommendation</Label>
                          <Textarea
                            value={category.recommendation}
                            onChange={(e) => updateCategory(catIndex, "recommendation", e.target.value)}
                            rows={2}
                            className="mt-1 border-gray-300 bg-white text-gray-900 font-inter"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <Label className="text-gray-700 font-inter">Issues (checks)</Label>
                            <Button type="button" variant="outline" size="sm" onClick={() => addCheck(catIndex)} className="gap-1 font-inter">
                              <Plus className="w-3.5 h-3.5" />
                              Add check
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {(category.checks ?? []).map((check, checkIndex) => (
                              <div key={checkIndex} className="flex flex-wrap gap-2 rounded border border-gray-100 bg-gray-50 p-2 font-inter items-start">
                                <Input
                                  value={check.item}
                                  onChange={(e) => updateCheck(catIndex, checkIndex, "item", e.target.value)}
                                  placeholder="Issue"
                                  className="flex-1 min-w-[140px] border-gray-300 bg-white text-gray-900 font-inter"
                                />
                                <Input
                                  value={check.status}
                                  onChange={(e) => updateCheck(catIndex, checkIndex, "status", e.target.value)}
                                  placeholder="good / warning / critical"
                                  className="w-28 border-gray-300 bg-white text-gray-900 font-inter"
                                />
                                <Textarea
                                  value={check.details}
                                  onChange={(e) => updateCheck(catIndex, checkIndex, "details", e.target.value)}
                                  placeholder="Details"
                                  rows={1}
                                  className="flex-1 min-w-[180px] border-gray-300 bg-white text-gray-900 font-inter"
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeCheck(catIndex, checkIndex)} className="shrink-0 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                  <Trash className="w-4 h-4" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Recommended actions */}
                <section className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 space-y-4 font-inter">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide font-space">Recommended actions (prioritized)</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addAction} className="gap-1.5 font-inter">
                      <Plus className="w-4 h-4" />
                      Add action
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {(reportData.actionPlan ?? []).map((action, index) => (
                      <div key={index} className="rounded-lg border-2 border-gray-200 bg-white p-4 flex flex-wrap gap-3 font-inter items-end">
                        <div className="flex-1 min-w-[200px]">
                          <Label className="text-gray-700 font-inter">Action</Label>
                          <Input
                            value={action.action}
                            onChange={(e) => updateAction(index, "action", e.target.value)}
                            className="mt-1 border-gray-300 bg-white text-gray-900 font-inter"
                            placeholder="e.g. Improve UX navigation"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-inter">Priority</Label>
                          <Input
                            value={action.priority}
                            onChange={(e) => updateAction(index, "priority", e.target.value)}
                            className="mt-1 w-28 border-gray-300 bg-white text-gray-900 font-inter"
                            placeholder="High / Medium"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-inter">Time estimate</Label>
                          <Input
                            value={action.timeEstimate}
                            onChange={(e) => updateAction(index, "timeEstimate", e.target.value)}
                            className="mt-1 w-36 border-gray-300 bg-white text-gray-900 font-inter"
                            placeholder="e.g. 2–4 hours"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-inter">Revenue impact</Label>
                          <Input
                            value={action.revenueImpact}
                            onChange={(e) => updateAction(index, "revenueImpact", e.target.value)}
                            className="mt-1 w-36 border-gray-300 bg-white text-gray-900 font-inter"
                            placeholder="e.g. +5–10%"
                          />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeAction(index)} className="shrink-0 h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash className="w-4 h-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : selectedStore ? (
              <p className="text-gray-500 font-inter">No report data for this store.</p>
            ) : null}
          </div>

          <DialogFooter className="p-6 pt-4 border-t-2 border-gray-200 bg-gray-50 shrink-0 font-inter">
            <Button variant="outline" onClick={() => setSelectedStore(null)} className="border-gray-300 text-gray-700 font-inter">
              Close
            </Button>
            <Button
              onClick={handleSaveReport}
              disabled={saving || reportLoading || !reportData}
              className="bg-gray-900 text-white hover:bg-gray-800 font-inter"
            >
              {saving ? "Saving…" : "Save (update what store owner sees)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="border-black/10 bg-[var(--manager-bg)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">Delete selected stores?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedIds.size} store(s) will be removed from the list and from the database. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-black/20">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDeleteSelected(); }}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
