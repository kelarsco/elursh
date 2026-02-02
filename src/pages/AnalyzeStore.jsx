import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
} from "react-feather";

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

    const base = import.meta.env.VITE_API_URL || "";
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
    if (!storeUrl) {
      setError("No store URL provided");
      return;
    }

    const base = import.meta.env.VITE_API_URL || "";
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
        setError(err.message || "Failed to analyze store. Please check the URL and try again.");
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
    const base = import.meta.env.VITE_API_URL || "";
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

  // PDF report: re-fetch latest from API then generate using shared lib.
  const downloadReportAsPdf = async () => {
    if (!auditData) return;
    const normalizedUrl = storeUrl?.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase() || storeUrl || "";
    let dataForPdf = auditData;
    try {
      const base = import.meta.env.VITE_API_URL || "";
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
      const base = import.meta.env.VITE_API_URL || "";
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
      const base = import.meta.env.VITE_API_URL || "";
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
              Analyzing Your Store...
            </h2>
            <p className="text-muted-foreground">
              This may take a few moments
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
              Analysis Failed
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <a
              href="/store-audit"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-semibold hover:bg-primary/90 transition-colors rounded-md"
            >
              Try Again
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
              No store URL provided
            </p>
            <a
              href="/store-audit"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-semibold hover:bg-primary/90 transition-colors rounded-md"
            >
              Go to Store Audit
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

  const CircularScore = ({ score, size = 120 }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk', color }}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
    );
  };

  if (!auditData) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">Loading audit results...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Header / Store Overview */}
      <section className="pt-32 pb-12 bg-background border-b border-border">
        <div className="container-custom">
          <div className="bg-white rounded-lg shadow-sm border border-border p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 overflow-hidden md:overflow-visible">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-semibold text-[#222222] mb-1 truncate" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
                    {auditData?.storeInfo?.url ?? storeUrl ?? ""}
                  </h1>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>Platform: {auditData?.storeInfo?.platform ?? "Unknown"}</span>
                    {(auditData?.storeInfo?.industry ?? "Unknown") !== "Unknown" && (
                      <>
                        <span>•</span>
                        <span>{auditData?.storeInfo?.industry}</span>
                      </>
                    )}
                    {(auditData?.storeInfo?.country ?? "Unknown") !== "Unknown" && (
                      <>
                        <span>•</span>
                        <span>{auditData?.storeInfo?.country}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Audited: {auditData?.storeInfo?.auditDate ?? ""}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-3">
                <CircularScore score={auditData.overallScore} />
                <Badge className={`${getStatusBadgeColor(auditData.status)} border font-semibold`}>
                  {auditData.status}
                </Badge>
                <p className="text-xs text-muted-foreground text-center md:text-right max-w-[200px]">
                  Based on UX, CRO, SEO, trust, and marketing setup
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Leakage Section */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-[#222222] mb-2" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
              Estimated Monthly Revenue Loss
            </h2>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl md:text-5xl font-bold text-red-600" style={{ fontFamily: 'Space Grotesk' }}>
                ${(auditData.revenueLoss?.min ?? 0).toLocaleString()} – ${(auditData.revenueLoss?.max ?? 0).toLocaleString()}
              </span>
              <span className="text-muted-foreground">/ month</span>
            </div>
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
              <p className="text-sm text-[#222222] leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>
                <strong>What this means:</strong> These percentages show how much of your monthly revenue loss comes from each issue. We compared your store to similar successful stores in your industry to calculate these numbers. The higher the percentage, the more money you're losing from that specific problem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Name Audit – only when store uses Shopify subdomain (*.myshopify.com), not a branded domain */}
      {isShopifySubdomain(auditData?.storeInfo?.url ?? "") && (
        <section className="py-12 bg-background">
          <div className="container-custom">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-[#222222] mb-1" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
                      Domain Name Audit
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Your store is using a Shopify subdomain
                    </p>
                  </div>
                </div>
                <Badge className="bg-amber-200 text-amber-900 border-amber-300 font-semibold w-fit">
                  Recommendation
                </Badge>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-[#222222] leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>
                  Your store URL (<strong>{auditData?.storeInfo?.url ?? storeUrl ?? ""}</strong>) is a <strong>Shopify subdomain</strong> (*.myshopify.com). This can hurt trust, SEO, and branding compared to a custom domain (e.g. www.yourbrand.com).
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-[#222222] leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>
                  <li>Customers may perceive myshopify.com URLs as less professional or less trustworthy.</li>
                  <li>Search engines and backlinks benefit more from a consistent branded domain.</li>
                  <li>Email and ads look more credible when they point to your own domain.</li>
                </ul>
                <div className="bg-white/70 rounded-lg p-4 mt-4">
                  <p className="text-sm text-[#222222] leading-relaxed" style={{ fontFamily: 'Space Grotesk' }}>
                    <strong>Recommendation:</strong> Connect a custom (branded) domain in Shopify: <strong>Settings → Domains</strong>. Add your domain, then point your DNS to Shopify. Once connected, set it as the primary domain so your store uses your branded URL instead of the .myshopify.com subdomain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category-Based Audit Sections */}
      <section ref={detailedAuditRef} className="py-12 bg-muted/30">
        <div className="container-custom">
          <h2 className="text-3xl font-semibold text-[#222222] mb-8 text-center" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
            Detailed Audit Results
          </h2>
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
                        {category.title}
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
                        {category.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-[#222222] mb-3" style={{ fontFamily: 'Space Grotesk' }}>
                        Issues Found
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
                        Impact
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{category.impact}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#222222] mb-3" style={{ fontFamily: 'Space Grotesk' }}>
                        Recommendation
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{category.recommendation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={downloadReportAsPdf}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              style={{ fontFamily: 'Space Grotesk' }}
              aria-label="Download audit report as PDF"
            >
              <Download className="w-5 h-5" />
              Download Report (PDF)
            </button>
          </div>
        </div>
      </section>

      {/* Floating Download Report box - slides in when Detailed Audit Results is in view; cancel hides until audit re-run */}
      {!downloadDismissed && (
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
            showDownloadButton ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none"
          }`}
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => setDownloadDismissed(true)}
              className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-muted border border-border text-muted-foreground hover:bg-background hover:text-foreground shadow-sm transition-colors"
              aria-label="Dismiss download"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={downloadReportAsPdf}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-lg shadow-lg hover:bg-primary/90 transition-colors font-semibold"
              style={{ fontFamily: 'Space Grotesk' }}
              aria-label="Download audit report as PDF"
            >
              <Download className="w-5 h-5" />
              Download Report (PDF)
            </button>
          </div>
        </div>
      )}

      {/* Action Plan */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <h2 className="text-3xl font-semibold text-[#222222] mb-8 text-center" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
            Recommended Actions (Prioritized)
          </h2>
          <div className="space-y-4">
            {(auditData.actionPlan ?? []).map((action, index) => {
              const ActionIcon = iconMap[action.icon] || TrendingUp;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ActionIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#222222] mb-1" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
                          {action.action}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {action.timeEstimate}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {action.revenueImpact}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getStatusBadgeColor(action.priority)} border font-semibold`}>
                      {action.priority}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4" style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>
              Want us to fix these issues and recover lost revenue?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Limited audit fixes available per month
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 font-semibold hover:bg-white/90 transition-colors rounded-md"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Get Full Store Optimization
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 bg-background text-foreground px-8 py-4 font-semibold hover:bg-background/90 transition-colors rounded-md border border-white/20"
                    style={{ fontFamily: 'Space Grotesk' }}
                  >
                    Fix-It Checklist
                    <Star className="w-4 h-4 text-[#FBBF24]" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px] bg-background border-border rounded-lg p-8" allowClickThrough={paystackLoading}>
                  <DialogHeader className="text-left space-y-2">
                    <DialogTitle
                      className="text-2xl font-semibold text-[#222222]"
                      style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}
                    >
                      Fix-It Manual (Premium Checklist)
                    </DialogTitle>
                    <DialogDescription
                      className="text-sm text-muted-foreground"
                      style={{ fontFamily: 'Space Grotesk' }}
                    >
                      A step-by-step implementation guide for tech-savvy store owners who want to fix
                      every issue from this audit themselves and recover lost revenue.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-baseline justify-between rounded-lg bg-muted px-4 py-3">
                      <div>
                        <p
                          className="text-xs uppercase tracking-wide text-muted-foreground"
                          style={{ fontFamily: 'Space Grotesk' }}
                        >
                          One-time investment
                        </p>
                        <p
                          className="text-2xl font-semibold text-[#222222]"
                          style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}
                        >
                          $50
                        </p>
                      </div>
                      <p className="text-xs text-red-500 font-medium" style={{ fontFamily: 'Space Grotesk' }}>
                        Best used while your audit results are fresh.
                      </p>
                    </div>
                    <ul className="space-y-2 text-sm text-[#222222]" style={{ fontFamily: 'Space Grotesk' }}>
                      <li>• Clear checklist of what to fix first to stop revenue leaks.</li>
                      <li>• Actionable steps for UX, trust, SEO, product pages and tracking.</li>
                      <li>• Ideal for tech-savvy founders who prefer to implement everything in-house.</li>
                    </ul>
                    <p className="text-xs text-red-500" style={{ fontFamily: 'Space Grotesk' }}>
                      Every week you wait with these issues live means more lost sales. Use this manual
                      to fix them fast before you scale ads or traffic.
                    </p>
                    {!manualPurchased ? (
                      <>
                        <div className="space-y-2 pt-2">
                          <label htmlFor="manual-email" className="text-sm font-medium text-[#222222]" style={{ fontFamily: 'Space Grotesk' }}>
                            Email (for payment receipt)
                          </label>
                          <Input
                            id="manual-email"
                            type="email"
                            placeholder="you@example.com"
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
                              Processing…
                            </>
                          ) : (
                            <>Purchase Manual — $50</>
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
                        Download Manual (PDF)
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
