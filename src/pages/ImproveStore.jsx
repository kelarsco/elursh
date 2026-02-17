import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, Search, Star, User, Loader, ChevronDown, Check, Share2, Link2 } from "react-feather";
import SERVICES_STATIC, { SERVICE_TYPES, STORE_STAGES } from "@/data/improveStoreServices";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiBase } from "@/lib/apiBase";

const TRUSTED_BY = "2,400+";

function mapServiceFromApi(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    type: row.type,
    storeStages: Array.isArray(row.store_stages) ? row.store_stages : [],
    description: row.description ?? "",
    painPoints: Array.isArray(row.pain_points) ? row.pain_points : [],
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    deliveryDaysMin: row.delivery_days_min ?? 5,
    deliveryDaysMax: row.delivery_days_max ?? 10,
    rating: Number(row.rating) ?? 4.5,
    users: Number(row.users) ?? 0,
    packages: Array.isArray(row.packages) ? row.packages : [],
  };
}

function getServiceTitle(t, service) {
  return t(`improveStore.services.${service.id}.title`, { defaultValue: service.title });
}
function getServiceDescription(t, service) {
  return t(`improveStore.services.${service.id}.description`, { defaultValue: service.description });
}

export default function ImproveStore() {
  const { t } = useTranslation();
  const [servicesList, setServicesList] = useState(SERVICES_STATIC);

  const HEADLINE_OPTIONS = [t("improveStore.headline1"), t("improveStore.headline2")];
  const CATEGORIES = [
    { value: "salesGrowth", label: t("improveStore.salesGrowth") },
    { value: "storeImprovement", label: t("improveStore.storeImprovement") },
  ];
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [category, setCategory] = useState("salesGrowth");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [orderStep, setOrderStep] = useState(1);
  const [orderEmail, setOrderEmail] = useState("");
  const [orderStoreUrl, setOrderStoreUrl] = useState("");
  const [orderCollaboratorCode, setOrderCollaboratorCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [codeExpiresAt, setCodeExpiresAt] = useState(null);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [shareOpenForId, setShareOpenForId] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Verify Paystack payment when returning from Paystack with reference
  useEffect(() => {
    const reference = searchParams.get("reference");
    if (!reference) return;

    fetch(`${apiBase}/api/paystack-verify?reference=${encodeURIComponent(reference)}`)
      .then((res) => res.json().catch(() => ({ success: false })))
      .then((data) => {
        if (data.success === true) {
          setPaymentVerified(true);
          // Remove reference from URL
          const newParams = new URLSearchParams(searchParams);
          newParams.delete("reference");
          newParams.delete("trxref");
          const newUrl = newParams.toString() ? `${window.location.pathname}?${newParams}` : window.location.pathname;
          window.history.replaceState({}, "", newUrl);
        }
      })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    fetch(`${apiBase}/api/services`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : [];
        if (list.length > 0) setServicesList(list.map(mapServiceFromApi));
      })
      .catch(() => {});
  }, []);

  // Rotate headline every 3s
  useEffect(() => {
    const t = setInterval(() => setHeadlineIndex((i) => (i + 1) % HEADLINE_OPTIONS.length), 3000);
    return () => clearInterval(t);
  }, []);

  // Countdown for verification code
  useEffect(() => {
    if (!codeExpiresAt || codeCountdown <= 0) return;
    const t = setInterval(() => {
      const left = Math.max(0, Math.ceil((codeExpiresAt - Date.now()) / 1000));
      setCodeCountdown(left);
    }, 1000);
    return () => clearInterval(t);
  }, [codeExpiresAt, codeCountdown]);

  // Set category when landing from onboarding with ?focus=design or ?focus=marketing
  useEffect(() => {
    const focus = searchParams.get("focus");
    if (focus === "design") setCategory("storeImprovement");
    if (focus === "marketing") setCategory("salesGrowth");
  }, [searchParams]);

  // Open service modal when landing with ?service=ID
  useEffect(() => {
    const serviceIdParam = searchParams.get("service");
    if (!serviceIdParam || servicesList.length === 0) return;
    const id = Number(serviceIdParam);
    if (!Number.isFinite(id)) return;
    const service = servicesList.find((s) => s.id === id);
    if (service) {
      setSelectedService(service);
      setServiceModalOpen(true);
    }
  }, [searchParams, servicesList]);

  const getServiceShareUrl = (service) => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/improve-store?service=${service.id}`;
  };

  const handleCopyServiceLink = (service, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const url = getServiceShareUrl(service);
    navigator.clipboard?.writeText(url).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const filteredServices = useMemo(() => {
    const hasSearch = searchQuery.trim().length > 0;
    const hasTypeFilter = Boolean(filterType);
    const hasStageFilter = Boolean(filterStage);
    // When type or stage filter is active, search across both categories so filter works
    const searchAllCategories = hasTypeFilter || hasStageFilter || hasSearch;
    let list = searchAllCategories
      ? servicesList
      : servicesList.filter((s) => s.category === category);
    if (hasSearch) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) =>
          (s.title || "").toLowerCase().includes(q) ||
          (s.description || "").toLowerCase().includes(q) ||
          (s.type || "").toLowerCase().includes(q) ||
          (s.painPoints || []).some((p) => String(p).toLowerCase().includes(q))
      );
    }
    if (hasTypeFilter) list = list.filter((s) => (s.type || "") === filterType);
    if (hasStageFilter) list = list.filter((s) => (s.storeStages || []).includes(filterStage));
    return list;
  }, [servicesList, category, searchQuery, filterType, filterStage]);

  const openServiceModal = (service) => {
    setSelectedService(service);
    setServiceModalOpen(true);
  };

  const openOrderModal = (pkg) => {
    setSelectedPackage(pkg);
    setOrderModalOpen(true);
    setOrderStep(1);
    setOrderEmail("");
    setOrderStoreUrl("");
    setOrderCollaboratorCode("");
    setVerificationCode("");
    setCodeSent(false);
    setCodeExpiresAt(null);
    setCodeCountdown(0);
    setOrderError("");
  };

  const handleSendCode = async () => {
    if (!orderEmail.trim()) {
      setOrderError("Enter your email address.");
      return;
    }
    setOrderError("");
    setOrderLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/send-verification-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: orderEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to send code.");
      }
      setCodeSent(true);
      setOrderStep(2);
      const expires = Date.now() + 5 * 60 * 1000;
      setCodeExpiresAt(expires);
      setCodeCountdown(300);
    } catch (e) {
      setOrderError(e.message || "Failed to send code. Try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleVerifyAndSubmit = async () => {
    if (!verificationCode || verificationCode.length !== 4) {
      setOrderError("Enter the 4-digit code from your email.");
      return;
    }
    setOrderError("");
    setOrderLoading(true);
    try {
      const storeLink = orderStoreUrl.trim().replace(/^https?:\/\//i, "").trim();
      const fullStoreLink = storeLink ? `https://${storeLink}` : null;
      const orderPayload = {
        email: orderEmail.trim(),
        verification_code: verificationCode,
        store_link: fullStoreLink,
        collaborator_code: orderCollaboratorCode.trim() || null,
        service_id: selectedService?.id ?? null,
        service_title: selectedService?.title ?? selectedPackage?.serviceTitle ?? null,
        package_name: selectedPackage?.name ?? null,
        package_price_usd: selectedPackage?.price ?? null,
      };
      const orderRes = await fetch(`${apiBase}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to place order");
      }
      const orderData = await orderRes.json().catch(() => ({}));
      const orderId = orderData?.id ?? null;

      const amountUsd = selectedPackage?.price != null ? Number(selectedPackage.price) : 0;
      if (amountUsd <= 0) {
        setOrderModalOpen(false);
        setServiceModalOpen(false);
        setSelectedService(null);
        setSelectedPackage(null);
        setOrderStep(1);
        setVerificationCode("");
        return;
      }

      const callbackUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/improve-store`;
      const paystackRes = await fetch(`${apiBase}/api/paystack-initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: orderEmail.trim(),
          amountUsd,
          callbackUrl,
          metadata: {
            order_id: orderId,
            store_url: fullStoreLink || undefined,
            service_title: orderPayload.service_title || undefined,
            package_name: orderPayload.package_name || undefined,
            amount_usd: amountUsd,
          },
        }),
      });
      if (!paystackRes.ok) {
        const err = await paystackRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to open payment page.");
      }
      const paystackData = await paystackRes.json().catch(() => ({}));
      const paymentUrl = paystackData?.authorization_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }
      throw new Error("Payment link not returned.");
    } catch (e) {
      setOrderError(e.message || "Invalid code or server error. Try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  const scrollToServices = () => {
    document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Improve Store | eCommerce Growth Services | Elursh</title>
        <meta name="description" content="Done-for-you eCommerce services to increase sales and improve your store. SEO, CRO, design, and growth strategies from trusted experts." />
        <link rel="canonical" href="https://elursh.com/improve-store" />
        <meta property="og:url" content="https://elursh.com/improve-store" />
        <meta property="og:title" content="Improve Store | Elursh" />
        <meta property="og:description" content="Done-for-you eCommerce services to increase sales and improve your store." />
      </Helmet>
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-background">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-sans font-semibold mb-6 min-h-[1.2em] flex items-center justify-center"
              style={{ fontFamily: "Space Grotesk", fontWeight: 600 }}
            >
              {HEADLINE_OPTIONS[headlineIndex]}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {t("improveStore.heroDesc")}
            </p>
            <button
              onClick={scrollToServices}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 font-semibold hover:bg-primary/90 transition-colors"
            >
              {t("improveStore.browseServices")}
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-sm text-muted-foreground mt-6">
              {t("improveStore.trustedBy", { count: TRUSTED_BY })}
            </p>
          </div>

          {/* Category switch – pill-style segmented control (scroll target for "Browse Services") */}
          <div id="services-section" className="flex justify-center mb-8 scroll-mt-28">
            <div
              className="inline-flex max-w-full p-1 rounded-full border border-border bg-muted/30"
              role="group"
              aria-label="Service category"
            >
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                aria-pressed={category === c.value}
                className={`px-3 py-2 text-xs font-medium rounded-full transition-colors sm:px-5 sm:py-2.5 sm:text-sm ${
                  category === c.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                style={category === c.value ? { fontFamily: "Space Grotesk" } : {}}
              >
                {c.label}
              </button>
            ))}
            </div>
          </div>

          {/* Payment success – only shows when verified; disappears after reload */}
          {paymentVerified && (
            <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg mb-6 mx-auto w-fit">
              <Check className="w-5 h-5 text-green-600 shrink-0" />
              <span className="font-medium">{t("improveStore.paymentSuccess")}</span>
            </div>
          )}

          {/* Search & filters */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder={t("improveStore.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-center text-sm">
              <span className="text-muted-foreground font-medium">
                {t("improveStore.serviceCount", { count: filteredServices.length })}
              </span>
              <span className="text-muted-foreground/60">·</span>
              <span className="text-muted-foreground font-medium">{t("improveStore.filters")}:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-border bg-background px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{t("improveStore.serviceType")}</option>
                {SERVICE_TYPES.map((typeOption) => (
                  <option key={typeOption} value={typeOption}>{typeOption}</option>
                ))}
              </select>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="border border-border bg-background px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{t("improveStore.storeStage")}</option>
                {STORE_STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
                </div>

          {/* Service cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const shareUrl = getServiceShareUrl(service);
              return (
                <div
                  key={service.id}
                  onClick={() => openServiceModal(service)}
                  className="group relative rounded-lg border border-border bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
                >
                  {/* Share icon: visible on hover, top right */}
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Popover open={shareOpenForId === service.id} onOpenChange={(open) => setShareOpenForId(open ? service.id : null)}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareOpenForId(shareOpenForId === service.id ? null : service.id);
                          }}
                          className="p-2 rounded-md bg-background/90 border border-border shadow-sm hover:bg-muted transition-colors"
                          aria-label="Share service link"
                        >
                          <Share2 className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="end" sideOffset={8} onClick={(e) => e.stopPropagation()}>
                        <div className="p-3 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Link2 className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
                            <span>Share this service</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate rounded bg-muted/50 px-2 py-1.5 font-mono" title={shareUrl}>
                            {shareUrl}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs"
                              onClick={(e) => handleCopyServiceLink(service, e)}
                            >
                              {copyFeedback && shareOpenForId === service.id ? t("improveStore.copied") : t("improveStore.copyLink")}
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchParams({ service: String(service.id) });
                                setSelectedService(service);
                                setServiceModalOpen(true);
                                setShareOpenForId(null);
                              }}
                            >
                              {t("improveStore.openService")}
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="p-6">
                    <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded mb-3">
                      {service.type}
                    </span>
                    <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "Space Grotesk" }}>
                      {getServiceTitle(t, service)}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {getServiceDescription(t, service)}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" strokeWidth={2} />
                      <span>{service.rating}</span>
                      <span className="text-muted-foreground/70">·</span>
                      <User className="w-4 h-4 shrink-0" strokeWidth={2} />
                      <span>{t("improveStore.usersCount", { count: service.users })}</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      {t("improveStore.viewPackages")}
                  <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
              </div>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <p className="text-center text-muted-foreground py-12">{t("improveStore.noServicesMatch")}</p>
          )}

          {/* Custom package CTA */}
          <div className="mt-20 p-12 bg-primary text-primary-foreground text-center rounded-lg max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-semibold mb-4" style={{ fontFamily: "Space Grotesk", fontWeight: 600 }}>
              {t("improveStore.ctaTitle")}
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
              {t("improveStore.combineServices")}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 font-semibold hover:bg-secondary/90 transition-colors rounded-md"
            >
              {t("improveStore.contactUs")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Service detail modal */}
      <Dialog open={serviceModalOpen} onOpenChange={setServiceModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedService && (
            <>
              <DialogHeader>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded w-fit">
                  {selectedService.type}
                </span>
                <DialogTitle className="text-2xl" style={{ fontFamily: "Space Grotesk", fontWeight: 600 }}>
                  {getServiceTitle(t, selectedService)}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {getServiceDescription(t, selectedService)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ fontFamily: "Space Grotesk" }}>{t("improveStore.painPoints")}</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {selectedService.painPoints.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ fontFamily: "Space Grotesk" }}>{t("improveStore.keyBenefits")}</h4>
                  <ul className="flex flex-wrap gap-2">
                    {selectedService.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-sm bg-muted/50 px-2.5 py-1 rounded">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3" style={{ fontFamily: "Space Grotesk" }}>{t("improveStore.packages")}</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {selectedService.packages.map((pkg) => (
                      <div
                        key={pkg.name}
                        className="border border-border rounded-lg p-4 flex flex-col"
                      >
                        <div className="font-semibold text-lg mb-1" style={{ fontFamily: "Space Grotesk" }}>{pkg.name}</div>
                        <div className="text-2xl font-semibold text-primary mb-3">${pkg.price}</div>
                        <ul className="text-sm text-muted-foreground space-y-1 mb-3 flex-1">
                          {pkg.deliverables.map((d, i) => (
                            <li key={i} className="flex gap-1.5">
                              <span className="text-primary shrink-0">•</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                        <div className="text-xs text-muted-foreground mb-2">
                          {pkg.deliveryDays} days · {pkg.support} · {pkg.revisions} revision{pkg.revisions !== 1 ? "s" : ""}
                        </div>
                        <button
                          onClick={() => {
                            setServiceModalOpen(false);
                            openOrderModal({ ...pkg, serviceTitle: selectedService.title });
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm py-2.5 font-medium hover:bg-primary/90 transition-colors rounded-md"
                        >
                          Order Now
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Order modal: email, store URL, collaborator code → verify code */}
      <Dialog open={orderModalOpen} onOpenChange={(open) => !open && setOrderModalOpen(false)}>
        <DialogContent className="sm:max-w-md">
          {selectedPackage && (
            <>
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "Space Grotesk", fontWeight: 600 }}>
                  Complete your order
                </DialogTitle>
                <DialogDescription>
                  {selectedPackage.serviceTitle} — {selectedPackage.name} (${selectedPackage.price})
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {orderStep === 1 ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("improveStore.emailLabel")}</label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={orderEmail}
                        onChange={(e) => setOrderEmail(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("improveStore.storeUrlLabel")}</label>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <span className="text-muted-foreground select-none text-sm shrink-0">https://</span>
                        <input
                          type="text"
                          placeholder={t("improveStore.storeUrlPlaceholder")}
                          value={orderStoreUrl}
                          onChange={(e) => setOrderStoreUrl(e.target.value.replace(/^https?:\/\//i, ""))}
                          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground px-0 py-0 h-full"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Shopify collaborator request code</label>
                      <Input
                        type="text"
                        placeholder="Paste the code from your Shopify admin"
                        value={orderCollaboratorCode}
                        onChange={(e) => setOrderCollaboratorCode(e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        We&apos;ll send you a collaborator request using this code so we can access your store to complete the work.
                      </p>
                    </div>
                    {orderError && <p className="text-sm text-destructive">{orderError}</p>}
                    <button
                      onClick={handleSendCode}
                      disabled={orderLoading || !orderEmail.trim() || !orderStoreUrl.trim()}
                      className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                    >
                      {orderLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Send verification code"}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      We sent a 4-digit code to <strong>{orderEmail}</strong>. Enter it below.
                    </p>
                    {codeCountdown > 0 && (
                      <p className="text-xs text-muted-foreground">Code expires in {Math.floor(codeCountdown / 60)}:{(codeCountdown % 60).toString().padStart(2, "0")}</p>
                    )}
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="0000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full text-center text-lg tracking-[0.5em]"
                    />
                    {orderError && <p className="text-sm text-destructive">{orderError}</p>}
                    <div className="flex gap-2">
                      {codeCountdown <= 0 ? (
                        <button
                          onClick={handleSendCode}
                          disabled={orderLoading}
                          className="flex-1 text-sm font-medium text-primary hover:underline disabled:opacity-50"
                        >
                          Resend code
                        </button>
                      ) : (
                        <span className="flex-1 text-sm text-muted-foreground">Resend when timer ends</span>
                      )}
                      <button
                        onClick={handleVerifyAndSubmit}
                        disabled={orderLoading || verificationCode.length !== 4}
                        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                      >
                        {orderLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Verify & place order"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
