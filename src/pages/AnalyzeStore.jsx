import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { auditStore } from "@/services/storeAudit";
import { generateAuditReportPdf, generateFixItManualPdf } from "@/lib/auditPdf";
import { Crown } from "lucide-react";
import {
  Shield,
  Navigation,
  Package,
  Layers,
  Image as ImageIcon,
  Search,
  TrendingUp,
  Mail,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Zap,
  ArrowRight,
  Loader,
  Download,
  X,
  Star,
  Globe,
  MessageCircle,
} from "react-feather";
import { apiBase } from "@/lib/apiBase";

// Contact – replace with your WhatsApp number (country code, no +)
const WHATSAPP_NUMBER = "13439462565";
const INSTAGRAM_HANDLE = "elurshteam";

// Paystack – public key from env (live for real payments)
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";
const FIX_IT_MANUAL_USD = 50;

// Icon mapping for dynamic icon rendering
const iconMap = {
  Shield,
  Navigation,
  Package,
  Layers,
  Image: ImageIcon,
  Search,
  TrendingUp,
  Mail,
  Settings,
  Zap,
  Globe,
};

// True if store URL is a Shopify subdomain (*.myshopify.com); false for branded/custom domains
function isShopifySubdomain(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    return u.hostname.endsWith(".myshopify.com");
  } catch {
    return false;
  }
}

// Ensure audit data has storeInfo and revenueLoss (custom reports / re-audited deleted stores may have a different shape)
function normalizeAuditData(data, storeUrl) {
  if (!data || typeof data !== "object") return data;
  const url = storeUrl ?? data?.storeInfo?.url ?? "";
  const storeInfo = data.storeInfo && typeof data.storeInfo === "object"
    ? { ...data.storeInfo, url: data.storeInfo.url ?? url }
    : {
        url,
        platform: "Unknown",
        industry: "Unknown",
        country: "Unknown",
        auditDate: new Date().toLocaleDateString(),
      };
  const revenueLoss = data.revenueLoss && typeof data.revenueLoss === "object"
    ? {
        min: typeof data.revenueLoss.min === "number" ? data.revenueLoss.min : 0,
        max: typeof data.revenueLoss.max === "number" ? data.revenueLoss.max : 0,
        breakdown: Array.isArray(data.revenueLoss.breakdown) ? data.revenueLoss.breakdown : [],
      }
    : { min: 0, max: 0, breakdown: [] };
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const actionPlan = Array.isArray(data.actionPlan) ? data.actionPlan : [];
  return { ...data, storeInfo, revenueLoss, categories, actionPlan };
}

const AnalyzeStore = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const storeUrl = searchParams.get("url");
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [downloadDismissed, setDownloadDismissed] = useState(false);
  const [manualPurchased, setManualPurchased] = useState(false);
  const [paystackLoading, setPaystackLoading] = useState(false);
  const [paystackError, setPaystackError] = useState(null);
  const [purchaseEmail, setPurchaseEmail] = useState("");
  const detailedAuditRef = useRef(null);
  const [showWhatsAppPrompt, setShowWhatsAppPrompt] = useState(false);
  const [isWhatsAppDismissed, setIsWhatsAppDismissed] = useState(false);

  // Reset dismissed and purchase state when user re-runs audit (new URL)
  useEffect(() => {
    setDownloadDismissed(false);
    setManualPurchased(false);
  }, [storeUrl]);

  // After redirect from Paystack: verify transaction by reference before unlocking (per Paystack docs)
  useEffect(() => {
    const reference = searchParams.get("reference");
    const urlParam = searchParams.get("url");
    if (!reference) return;

    const base = apiBase;
    fetch(`${base}/api/paystack-verify?reference=${encodeURIComponent(reference)}`)
      .then((res) => res.text().then((t) => ({ ok: res.ok, text: t })))
      .then(({ ok, text }) => {
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = { success: false };
        }
        setPaystackLoading(false);
        if (data.success === true) {
          setManualPurchased(true);
          if (urlParam) window.history.replaceState({}, "", `${window.location.pathname}?url=${encodeURIComponent(urlParam)}`);
        }
      })
      .catch(() => setPaystackLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (!storeUrl) setError(t("auditReport.noStoreUrl"));
  }, [storeUrl, i18n.language, t]);

  useEffect(() => {
    if (!storeUrl) return;

    const base = apiBase;
    const normalizedUrl = storeUrl.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase() || storeUrl;

    const performAudit = async () => {
      setLoading(true);
      setError(null);

      try {
        const customRes = await fetch(`${base}/api/store-audit-result?storeUrl=${encodeURIComponent(normalizedUrl)}`);
        if (customRes.ok) {
          const customReport = await customRes.json();
          setAuditData(normalizeAuditData(customReport, normalizedUrl));
          setLoading(false);
          // Record in analysed_stores so deleted stores count again when user re-analyses
          try {
            const payload = { store_url: normalizedUrl, result_json: customReport };
            await fetch(`${base}/api/analysed-stores`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          } catch (e) {
            console.warn("Save analysed store failed:", e);
          }
          return;
        }
        const auditResult = await auditStore(storeUrl);
        setAuditData(normalizeAuditData(auditResult, normalizedUrl));
        try {
          await fetch(`${base}/api/analysed-stores`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ store_url: normalizedUrl, result_json: auditResult }),
          });
        } catch (e) {
          console.warn("Save analysed store failed:", e);
        }
      } catch (err) {
        console.error("Audit error:", err);
        setError(err.message || t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    performAudit();
  }, [storeUrl]);

  // If this store already paid for the Fix-It Manual (e.g. after 48h or new session), show download option
  useEffect(() => {
    if (!auditData || !storeUrl) return;
    const normalizedUrl = storeUrl.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase() || storeUrl;
    const base = apiBase;
    fetch(`${base}/api/manual-purchase-status?storeUrl=${encodeURIComponent(normalizedUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.purchased === true) setManualPurchased(true);
      })
      .catch(() => {});
  }, [auditData, storeUrl]);

  // Show download button when user scrolls to Detailed Audit Results
  useEffect(() => {
    if (!auditData || !detailedAuditRef.current) return;
    const el = detailedAuditRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setShowDownloadButton(entry.isIntersecting),
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [auditData]);

  // WhatsApp/contact slide-in (same as home page)
  useEffect(() => {
    if (!auditData) return;
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight || 0;
      const totalHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const maxScrollable = Math.max(totalHeight - viewportHeight, 1);
      setShowWhatsAppPrompt(scrollY / maxScrollable >= 0.2);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [auditData]);

  // PDF report: re-fetch latest from API then generate using shared lib.
  const downloadReportAsPdf = async () => {
    if (!auditData) return;
    const normalizedUrl = storeUrl?.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase() || storeUrl || "";
    let dataForPdf = auditData;
    try {
      const base = apiBase;
      const res = await fetch(`${base}/api/store-audit-result?storeUrl=${encodeURIComponent(normalizedUrl)}`);
      if (res.ok) {
        const customReport = await res.json();
        dataForPdf = normalizeAuditData(customReport, normalizedUrl);
        setAuditData(dataForPdf);
      }
    } catch (e) {
      console.warn("Could not fetch latest report for PDF, using current data:", e);
    }
    try {
      await generateAuditReportPdf(dataForPdf, normalizedUrl);
    } catch (err) {
      console.error("PDF download failed:", err);
    }
  };

  // Fix-It Manual PDF: re-fetch latest from API then generate using shared lib.
  const onGenerateFixItManualPdf = async () => {
    if (!auditData) return;
    const normalizedUrl = storeUrl?.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase() || storeUrl || "";
    let dataForPdf = auditData;
    try {
      const base = apiBase;
      const res = await fetch(`${base}/api/store-audit-result?storeUrl=${encodeURIComponent(normalizedUrl)}`);
      if (res.ok) {
        const customReport = await res.json();
        dataForPdf = normalizeAuditData(customReport, normalizedUrl);
        setAuditData(dataForPdf);
      }
    } catch (e) {
      console.warn("Could not fetch latest report for Fix-It Manual PDF, using current data:", e);
    }
    try {
      await generateFixItManualPdf(dataForPdf, normalizedUrl);
    } catch (err) {
      console.error("Fix-It Manual PDF failed:", err);
    }
  };

  const handlePurchaseManual = async () => {
    const email = purchaseEmail.trim();
    if (!email) return;
    setPaystackError(null);
    const callbackUrl = typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?url=${encodeURIComponent(storeUrl || "")}&manual_paid=1`
      : undefined;
    const normalizedStoreUrl = (storeUrl || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase() || storeUrl || "";
    const metadata = { store_url: normalizedStoreUrl, product: "fix_it_manual", amount_usd: FIX_IT_MANUAL_USD };
    setPaystackLoading(true);
    try {
      const base = apiBase;
      const res = await fetch(`${base}/api/paystack-initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amountUsd: FIX_IT_MANUAL_USD, callbackUrl, metadata }),
      });
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        const msg = res.status === 404 ? "Payment API not running. Run: npm run dev" : "Payment link failed";
        setPaystackError(msg);
        setPaystackLoading(false);
        return;
      }
      if (!res.ok) {
        setPaystackError(data.error || "Payment link failed");
        setPaystackLoading(false);
        return;
      }
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      setPaystackError("No payment URL returned");
      setPaystackLoading(false);
    } catch (err) {
      console.error("Paystack error:", err);
      setPaystackError(err.message || "Payment link failed");
      setPaystackLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-[#222222] mb-2" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
              {t("auditReport.analyzing")}
            </h2>
            <p className="text-muted-foreground">
              {t("auditReport.analyzingDesc")}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-[#222222] mb-2" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
              {t("auditReport.analysisFailed")}
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <a
              href="/store-audit"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-semibold hover:bg-primary/90 transition-colors rounded-md"
            >
              {t("auditReport.tryAgain")}
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // No URL provided
  if (!storeUrl) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-muted-foreground mb-4">
              {t("auditReport.noStoreUrl")}
            </p>
            <a
              href="/store-audit"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-semibold hover:bg-primary/90 transition-colors rounded-md"
            >
              {t("auditReport.goToStoreAudit")}
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Helper functions for rendering below

  const getStatusColor = (status) => {
    switch (status) {
      case "Excellent":
      case "Good":
        return "bg-green-500";
      case "Average":
        return "bg-yellow-500";
      case "Needs Work":
      case "Needs improvement":
        return "bg-orange-500";
      case "Not Ready":
      case "Critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Excellent":
      case "Good":
        return "bg-green-100 text-green-800 border-green-200";
      case "Average":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Needs Work":
      case "Needs improvement":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Not Ready":
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getIssueIcon = (status) => {
    switch (status) {
      case "good":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "critical":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (!auditData) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">{t("auditReport.loadingResults")}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Report Header – PDF-style professional layout */}
      <section className="pt-28 pb-16 bg-neutral-50">
        <div className="container-custom max-w-4xl">
          {/* Title block */}
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase mb-1" style={{ fontFamily: 'Space Grotesk' }}>
              {t("auditReport.auditByElursh")}
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-1" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
              {(auditData?.storeInfo?.url ?? storeUrl ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "")}: {t("auditReport.performanceAudit")}
            </h1>
            <p className="text-sm text-neutral-500" style={{ fontFamily: 'Space Grotesk' }}>
              {t("auditReport.reportSubtitle")}
            </p>
          </div>

          {/* Overall score + status */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-12">
            <div className="flex flex-col items-center md:items-start">
              <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase mb-2" style={{ fontFamily: 'Space Grotesk' }}>
                {t("auditReport.overallScore")}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-bold text-neutral-900" style={{ fontFamily: 'Space Grotesk' }}>
                  {auditData.overallScore ?? 0}/100
                </span>
                <Badge className={`${getStatusBadgeColor(auditData.status)} border font-semibold text-sm`}>
                  {t(`auditReport.status.${auditData.status}`) || auditData.status}
                </Badge>
              </div>
            </div>
            {/* Metadata grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">{t("auditReport.domain")}</p>
                <p className="text-sm font-medium text-neutral-800 truncate" title={auditData?.storeInfo?.url ?? storeUrl}>
                  {(auditData?.storeInfo?.url ?? storeUrl ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">{t("auditReport.platform")}</p>
                <p className="text-sm font-medium text-neutral-800">{auditData?.storeInfo?.platform ?? t("auditReport.unknown")}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">{t("auditReport.date")}</p>
                <p className="text-sm font-medium text-neutral-800">{auditData?.storeInfo?.auditDate ?? new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">{t("auditReport.analyst")}</p>
                <p className="text-sm font-medium text-neutral-800">{t("auditReport.elurshStrategy")}</p>
              </div>
            </div>
          </div>

          {/* 01. Executive Summary – Severity cards */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
              {t("auditReport.execSummary")}
            </h2>
            {(() => {
              const criticalCount = (auditData.categories ?? []).reduce((acc, c) => acc + (c.checks?.filter((ch) => ch.status === "critical").length || 0), 0);
              const escalatedCount = 0;
              const quickWinCount = Math.min((auditData.actionPlan ?? []).length, 6);
              return (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-red-50 border border-red-100 rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold text-red-700" style={{ fontFamily: 'Space Grotesk' }}>{criticalCount}</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mt-1">{t("auditReport.critical")}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold text-amber-700" style={{ fontFamily: 'Space Grotesk' }}>{escalatedCount}</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mt-1">{t("auditReport.escalated")}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold text-emerald-700" style={{ fontFamily: 'Space Grotesk' }}>{quickWinCount}</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mt-1">{t("auditReport.quickWins")}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Contact icon slide-in (WhatsApp + Instagram) - same as home page */}
      {!isWhatsAppDismissed && showWhatsAppPrompt && (
        <div className="fixed bottom-[20%] right-4 md:right-6 z-40 w-[64px] h-[64px] group">
          <div className="relative bg-[#111111] text-white rounded-full shadow-lg flex items-center justify-center my-[84px] mx-0 overflow-visible w-[64px] h-[64px]">
            <button type="button" className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black/60 border border-white/40 flex items-center justify-center text-white transition-opacity duration-200 z-10" onClick={() => setIsWhatsAppDismissed(true)}>
              <X className="w-3 h-3" />
            </button>
            <span className="flex items-center justify-center w-[64px] h-[64px]"><MessageCircle className="w-7 h-7" /></span>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full -mr-2 w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg hover:scale-110">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.375a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </a>
            <a href={`https://instagram.com/${INSTAGRAM_HANDLE}`} target="_blank" rel="noopener noreferrer" className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full -ml-12 w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 delay-75 shadow-lg hover:scale-110">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>
      )}

      {/* Revenue Leakage Section – PDF-style prominent callout */}
      <section className="py-12 bg-background">
        <div className="container-custom max-w-4xl">
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-800" style={{ fontFamily: 'Space Grotesk' }}>
                {t("auditReport.monthlyLoss")}
              </h2>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-neutral-900 mb-1" style={{ fontFamily: 'Space Grotesk' }}>
              ${(auditData.revenueLoss?.min ?? 0).toLocaleString()} – ${(auditData.revenueLoss?.max ?? 0).toLocaleString()}
            </p>
            <p className="text-sm text-neutral-600 mb-6">{t("auditReport.revenueSubtitle")}</p>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-600 mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              {t("auditReport.revenueLeakCauses")}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">{t("auditReport.revenueWhatMeansDesc")}</p>
            <div className="space-y-4 mb-4 max-h-[600px] overflow-y-auto pr-2">
              {(auditData.revenueLoss?.breakdown ?? []).map((item, index) => (
                <div key={index} className="bg-white/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-semibold text-[#222222]" style={{ fontFamily: 'Space Grotesk' }}>
                          {item.label}
                        </span>
                        <span className="text-base font-bold text-red-600">{item.percentage}%</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
            <div className="bg-white/70 rounded-lg p-4 mt-4">
              <p className="text-sm text-neutral-700 leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>
                <strong>{t("auditReport.revenueWhatMeans")}</strong> {t("auditReport.revenueWhatMeansDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Name Audit – only when store uses Shopify subdomain (*.myshopify.com), not a branded domain */}
      {isShopifySubdomain(auditData?.storeInfo?.url ?? "") && (
        <section className="py-12 bg-background">
          <div className="container-custom max-w-4xl">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-[#222222] mb-1" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
                      {t("auditReport.domainAudit")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("auditReport.domainSubdomain")}
                    </p>
                  </div>
                </div>
                <Badge className="bg-amber-200 text-amber-900 border-amber-300 font-semibold w-fit">
                  {t("auditReport.recommendation")}
                </Badge>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-[#222222] leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>
                  {t("auditReport.domainSubdomainDesc", { url: auditData?.storeInfo?.url ?? storeUrl ?? "" })}
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-[#222222] leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>
                  <li>{t("auditReport.domainSubdomainList1")}</li>
                  <li>{t("auditReport.domainSubdomainList2")}</li>
                  <li>{t("auditReport.domainSubdomainList3")}</li>
                </ul>
                <div className="bg-white/70 rounded-lg p-4 mt-4">
                  <p className="text-sm text-[#222222] leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>
                    <strong>{t("auditReport.recommendation")}:</strong> {t("auditReport.domainRecommendation")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category-Based Audit Sections – Puntuaciones por Área */}
      <section ref={detailedAuditRef} className="py-12 bg-muted/30">
        <div className="container-custom max-w-4xl">
          <h2 className="text-lg font-semibold uppercase tracking-wider text-neutral-600 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            {t("auditReport.scoresByArea")}
          </h2>
          <h3 className="text-2xl font-semibold text-[#222222] mb-8" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
            {t("auditReport.detailedResults")}
          </h3>
          <div className="space-y-6">
            {(auditData.categories ?? []).map((category) => {
              const IconComponent = iconMap[category.icon] || Package;
              return (
                <div key={category.id} className="bg-white rounded-lg shadow-sm border border-border p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-[#222222]" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#222222]" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
                        {(category.id && t(`auditReport.category.${category.id}`)) || category.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-3xl font-bold text-[#222222]" style={{ fontFamily: 'Space Grotesk' }}>
                          {category.score}
                        </div>
                        <div className="text-xs text-muted-foreground">/100</div>
                      </div>
                      <Badge className={`${getStatusBadgeColor(category.status)} border font-semibold`}>
                        {t(`auditReport.status.${category.status}`) || category.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-[#222222] mb-3" style={{ fontFamily: 'Space Grotesk' }}>
                        {t("auditReport.issuesFound")}
                      </h4>
                      <div className="space-y-2">
                        {category.checks?.map((check, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            {getIssueIcon(check.status)}
                            <div>
                              <span className={check.status === 'critical' ? 'text-red-600 font-medium' : check.status === 'warning' ? 'text-yellow-600 font-medium' : 'text-green-600 font-medium'}>
                                {check.item}
                              </span>
                              {check.details && (
                                <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#222222] mb-3" style={{ fontFamily: 'Space Grotesk' }}>
                        {t("auditReport.impact")}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{category.impact}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#222222] mb-3" style={{ fontFamily: 'Space Grotesk' }}>
                        {t("auditReport.recommendationLabel")}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{category.recommendation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="button"
              onClick={downloadReportAsPdf}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              style={{ fontFamily: 'Space Grotesk' }}
              aria-label={t("auditReport.downloadReport")}
            >
              <Download className="w-5 h-5" />
              {t("auditReport.downloadReport")}
            </button>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 bg-background text-foreground px-6 py-3 font-semibold hover:bg-muted transition-colors rounded-lg border border-border"
                  style={{ fontFamily: 'Space Grotesk' }}
                >
                  <Crown className="w-5 h-5 text-amber-500" />
                  {t("auditReport.fixingGuide")}
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px] bg-background border-border rounded-lg p-8" allowClickThrough={paystackLoading}>
                <DialogHeader className="text-left space-y-2">
                  <DialogTitle className="text-2xl font-semibold text-[#222222]" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
                    {t("auditReport.fixItManual")}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground" style={{ fontFamily: 'Space Grotesk' }}>
                    {t("auditReport.fixItManualDesc")}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div className="flex items-baseline justify-between rounded-lg bg-muted px-4 py-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground" style={{ fontFamily: 'Space Grotesk' }}>{t("auditReport.oneTimeInvestment")}</p>
                      <p className="text-2xl font-semibold text-[#222222]" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>$50</p>
                    </div>
                    <p className="text-xs text-red-500 font-medium" style={{ fontFamily: 'Space Grotesk' }}>{t("auditReport.bestUsed")}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-[#222222]" style={{ fontFamily: 'Space Grotesk' }}>
                    <li>• {t("auditReport.fixItList1")}</li>
                    <li>• {t("auditReport.fixItList2")}</li>
                    <li>• {t("auditReport.fixItList3")}</li>
                  </ul>
                  <p className="text-xs text-red-500" style={{ fontFamily: 'Space Grotesk' }}>{t("auditReport.fixItUrgent")}</p>
                  {!manualPurchased ? (
                    <>
                      <div className="space-y-2 pt-2">
                        <label htmlFor="manual-email-section" className="text-sm font-medium text-[#222222]" style={{ fontFamily: 'Space Grotesk' }}>{t("auditReport.emailForReceipt")}</label>
                        <Input id="manual-email-section" type="email" placeholder={t("auditReport.emailPlaceholder")} value={purchaseEmail} onChange={(e) => setPurchaseEmail(e.target.value)} className="w-full border-border focus:border-primary focus:ring-2 focus:ring-primary/20" style={{ fontFamily: 'Space Grotesk' }} />
                      </div>
                      {paystackError && <p className="mt-2 text-sm text-red-600" style={{ fontFamily: 'Space Grotesk' }}>{paystackError}</p>}
                      <button type="button" onClick={handlePurchaseManual} disabled={!purchaseEmail.trim() || paystackLoading} className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ fontFamily: 'Space Grotesk' }}>
                        {paystackLoading ? <><Loader className="w-4 h-4 animate-spin" />{t("auditReport.processing")}</> : <>{t("auditReport.purchaseManual")}</>}
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={onGenerateFixItManualPdf} className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-semibold rounded-md hover:bg-primary/90 transition-colors" style={{ fontFamily: 'Space Grotesk' }}>
                      <Download className="w-4 h-4" />{t("auditReport.downloadManual")}
                    </button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Floating Download + Fixing Guide box - slides in when Detailed Audit Results is in view */}
      {!downloadDismissed && (
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out flex flex-col sm:flex-row gap-2 ${
            showDownloadButton ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none"
          }`}
        >
          <div className="relative flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setDownloadDismissed(true)}
              className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-muted border border-border text-muted-foreground hover:bg-background hover:text-foreground shadow-sm transition-colors"
              aria-label={t("auditReport.dismissDownload")}
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={downloadReportAsPdf}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-lg shadow-lg hover:bg-primary/90 transition-colors font-semibold"
              style={{ fontFamily: 'Space Grotesk' }}
              aria-label={t("auditReport.downloadReport")}
            >
              <Download className="w-5 h-5" />
              {t("auditReport.downloadReport")}
            </button>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 bg-background text-foreground px-5 py-3 rounded-lg shadow-lg border border-border hover:bg-muted transition-colors font-semibold"
                  style={{ fontFamily: 'Space Grotesk' }}
                >
                  <Crown className="w-5 h-5 text-amber-500" />
                  {t("auditReport.fixingGuide")}
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px] bg-background border-border rounded-lg p-8" allowClickThrough={paystackLoading}>
                <DialogHeader className="text-left space-y-2">
                  <DialogTitle className="text-2xl font-semibold text-[#222222]" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>{t("auditReport.fixItManual")}</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground" style={{ fontFamily: 'Space Grotesk' }}>{t("auditReport.fixItManualDesc")}</DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1" style={{ fontFamily: 'Space Grotesk' }}>{t("auditReport.oneTimeInvestment")}</p>
                    <p className="text-2xl font-semibold text-foreground" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>$50</p>
                    <p className="text-xs text-muted-foreground mt-2" style={{ fontFamily: 'Space Grotesk' }}>{t("auditReport.bestUsed")}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-foreground" style={{ fontFamily: 'Space Grotesk' }}><li>• {t("auditReport.fixItList1")}</li><li>• {t("auditReport.fixItList2")}</li><li>• {t("auditReport.fixItList3")}</li></ul>
                  <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>{t("auditReport.fixItUrgent")}</p>
                  {!manualPurchased ? (
                    <> <div className="space-y-2 pt-2"><label htmlFor="manual-email-float" className="text-sm font-medium text-[#222222]" style={{ fontFamily: 'Space Grotesk' }}>{t("auditReport.emailForReceipt")}</label><Input id="manual-email-float" type="email" placeholder={t("auditReport.emailPlaceholder")} value={purchaseEmail} onChange={(e) => setPurchaseEmail(e.target.value)} className="w-full border-border focus:border-primary focus:ring-2 focus:ring-primary/20" style={{ fontFamily: 'Space Grotesk' }} /></div>
                    {paystackError && <p className="mt-2 text-sm text-red-600" style={{ fontFamily: 'Space Grotesk' }}>{paystackError}</p>}
                    <button type="button" onClick={handlePurchaseManual} disabled={!purchaseEmail.trim() || paystackLoading} className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ fontFamily: 'Space Grotesk' }}>{paystackLoading ? <><Loader className="w-4 h-4 animate-spin" />{t("auditReport.processing")}</> : <>{t("auditReport.purchaseManual")}</>}</button> </>
                  ) : (
                    <button type="button" onClick={onGenerateFixItManualPdf} className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-semibold rounded-md hover:bg-primary/90 transition-colors" style={{ fontFamily: 'Space Grotesk' }}><Download className="w-4 h-4" />{t("auditReport.downloadManual")}</button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* Action Plan – Hoja de Ruta de Recuperación de Ingresos */}
      <section className="py-12 bg-background">
        <div className="container-custom max-w-4xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            {t("auditReport.recoveryRoadmap")}
          </h2>
          <h3 className="text-2xl font-semibold text-[#222222] mb-8" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
            {t("auditReport.recommendedActions")}
          </h3>
          <div className="space-y-5">
            {(auditData.actionPlan ?? []).map((action, index) => {
              const ActionIcon = iconMap[action.icon] || TrendingUp;
              return (
                <div key={index} className="bg-white rounded-lg border border-neutral-200 p-6 hover:border-neutral-300 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <span className="flex-shrink-0 w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center text-sm font-bold" style={{ fontFamily: 'Space Grotesk' }}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-[#222222] mb-2" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
                          {action.action}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            {action.timeEstimate}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 flex-shrink-0" />
                            {action.salesIncreasePercent != null
                              ? `${t("auditReport.increaseSalesBy", { percent: action.salesIncreasePercent })} — ${action.revenueImpact}`
                              : action.revenueImpact}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{t("auditReport.estimatedImpact")}</p>
                      <Badge className={`${getStatusBadgeColor(action.priority)} border font-semibold`}>
                        {t(`auditReport.status.${action.priority}`) || action.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Strategic Conclusion */}
          <div className="mt-12 p-6 bg-neutral-50 border border-neutral-200 rounded-lg">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
              {t("auditReport.strategicConclusion")}
            </p>
            <p className="text-base text-neutral-800 leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>
              {t("auditReport.recommendedAction")}: {auditData.status === "Needs improvement" || auditData.status === "Needs Work" || auditData.status === "Critical" || auditData.status === "Not Ready"
                ? t("auditReport.strategicConclusionPhrase")
                : t("auditReport.strategicConclusionContinue")}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
              {t("auditReport.ctaTitle")}
            </h2>
            <p className="text-lg mb-6 opacity-90">
              {t("auditReport.ctaSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="https://instagram.com/elurshteam"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 font-semibold hover:bg-white/90 transition-colors rounded-md"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                {t("auditReport.getOptimization")}
                <ArrowRight className="w-4 h-4" />
              </a>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 bg-background text-foreground px-8 py-4 font-semibold hover:bg-background/90 transition-colors rounded-md border border-white/20"
                    style={{ fontFamily: 'Space Grotesk' }}
                  >
                    {t("auditReport.fixingGuide")}
                    <Crown className="w-5 h-5 text-amber-400" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px] bg-background border-border rounded-lg p-8" allowClickThrough={paystackLoading}>
                  <DialogHeader className="text-left space-y-2">
                    <DialogTitle
                      className="text-2xl font-semibold text-[#222222]"
                      style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}
                    >
                      {t("auditReport.fixItManual")}
                    </DialogTitle>
                    <DialogDescription
                      className="text-sm text-muted-foreground"
                      style={{ fontFamily: 'Space Grotesk' }}
                    >
                      {t("auditReport.fixItManualDesc")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1" style={{ fontFamily: 'Space Grotesk' }}>{t("auditReport.oneTimeInvestment")}</p>
                      <p className="text-2xl font-semibold text-foreground" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>$50</p>
                      <p className="text-xs text-muted-foreground mt-2" style={{ fontFamily: 'Space Grotesk' }}>{t("auditReport.bestUsed")}</p>
                    </div>
                    <ul className="space-y-2 text-sm text-foreground" style={{ fontFamily: 'Space Grotesk' }}>
                      <li>• {t("auditReport.fixItList1")}</li>
                      <li>• {t("auditReport.fixItList2")}</li>
                      <li>• {t("auditReport.fixItList3")}</li>
                    </ul>
                    <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>{t("auditReport.fixItUrgent")}</p>
                    {!manualPurchased ? (
                      <>
                        <div className="space-y-2 pt-2">
                          <label htmlFor="manual-email" className="text-sm font-medium text-[#222222]" style={{ fontFamily: 'Space Grotesk' }}>
                            {t("auditReport.emailForReceipt")}
                          </label>
                          <Input
                            id="manual-email"
                            type="email"
                            placeholder={t("auditReport.emailPlaceholder")}
                            value={purchaseEmail}
                            onChange={(e) => setPurchaseEmail(e.target.value)}
                            className="w-full border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                            style={{ fontFamily: 'Space Grotesk' }}
                          />
                        </div>
                        {paystackError && (
                          <p className="mt-2 text-sm text-red-600" style={{ fontFamily: 'Space Grotesk' }}>
                            {paystackError}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handlePurchaseManual}
                          disabled={!purchaseEmail.trim() || paystackLoading}
                          className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ fontFamily: 'Space Grotesk' }}
                        >
                          {paystackLoading ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              {t("auditReport.processing")}
                            </>
                          ) : (
                            <>{t("auditReport.purchaseManual")}</>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={onGenerateFixItManualPdf}
                        className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-semibold rounded-md hover:bg-primary/90 transition-colors"
                        style={{ fontFamily: 'Space Grotesk' }}
                      >
                        <Download className="w-4 h-4" />
                        {t("auditReport.downloadManual")}
                      </button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AnalyzeStore;
