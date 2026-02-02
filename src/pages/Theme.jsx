import { useMemo, useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check, ArrowRight, ChevronDown, Search, Loader, User, Star } from "react-feather";
import themesData from "@/data/themes";
import { getThemeImageUrl } from "@/lib/themeImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const THEMES_PER_PAGE = 24;

// Deterministic "random" trust badge per theme: users 500–1000, rating 4–5
function getTrustBadge(themeId) {
  const users = 500 + ((themeId * 37) % 501);
  const rating = 4 + ((themeId * 17) % 11) / 10;
  const usersLabel = users >= 1000 ? "1k" : `${users}`;
  return { usersLabel, rating: rating.toFixed(1) };
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

const Theme = () => {
  const [themesList, setThemesList] = useState(themesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([80, 300]);
  const [sortBy, setSortBy] = useState("relevance");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [purchaseEmail, setPurchaseEmail] = useState("");
  const [storeLink, setStoreLink] = useState("");
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || "";
    fetch(`${base}/api/themes`)
      .then((res) => res.ok ? res.json() : [])
      .then((arr) => {
        if (Array.isArray(arr) && arr.length > 0) {
          setThemesList(
            arr.map((t) => ({
              ...t,
              priceLabel: t.priceLabel || `$${t.price ?? 0}`,
              features: Array.isArray(t.features) ? t.features : [],
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const filteredAndSorted = useMemo(() => {
    const featuresArr = (t) => (Array.isArray(t.features) ? t.features : []);
    let list = themesList.filter((t) => (t.price ?? 0) >= priceRange[0] && (t.price ?? 0) <= priceRange[1]);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (t) =>
          (t.name || "").toLowerCase().includes(q) ||
          featuresArr(t).some((f) => String(f).toLowerCase().includes(q))
      );
    }
    if (sortBy === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [themesList, searchQuery, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / THEMES_PER_PAGE);
  const paginated = useMemo(
    () => filteredAndSorted.slice((page - 1) * THEMES_PER_PAGE, page * THEMES_PER_PAGE),
    [filteredAndSorted, page]
  );

  const handlePriceChange = (min, max) => {
    setPriceRange([min, max]);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const openPurchase = (theme) => {
    setSelectedTheme(theme);
    setPurchaseEmail("");
    setStoreLink("");
    setPurchaseError("");
    setPurchaseOpen(true);
  };

  const closePurchase = () => {
    setPurchaseOpen(false);
    setSelectedTheme(null);
    setPurchaseError("");
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTheme) return;
    const email = purchaseEmail.trim();
    let link = storeLink.trim();
    if (link && !/^https?:\/\//i.test(link)) {
      link = `https://${link}`;
    }
    if (!email || !link) {
      setPurchaseError("Please enter your email and store link.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setPurchaseError("Please enter a valid email address.");
      return;
    }
    setPurchaseError("");
    setPurchaseLoading(true);
    try {
      const callbackUrl = `${window.location.origin}/theme/thank-you`;
      const res = await fetch("/api/paystack-initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amountUsd: Number(selectedTheme.price),
          callbackUrl,
          metadata: {
            themeId: selectedTheme.id,
            themeName: selectedTheme.name,
            storeLink: link,
            email,
            amount_usd: Number(selectedTheme.price),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start payment");
      }
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      throw new Error("No payment link received");
    } catch (err) {
      const msg = err.message || "Something went wrong. Please try again.";
      if (msg.includes("Invalid email or amount")) {
        setPurchaseError("Payment server needs a restart. Run npm run dev (so both the app and API are running), then try again. Make sure email and store URL are filled.");
      } else {
        setPurchaseError(msg);
      }
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <section className="pt-32 pb-20 bg-background">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-sans font-semibold mb-6" style={{ fontFamily: "Space Grotesk", fontWeight: 600 }}>
              Beautiful themes built for{" "}
              <span className="italic">conversions</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Hand-crafted Shopify themes designed to maximize your store&apos;s potential.
            </p>
          </div>

          {/* Theme search */}
          <div className="max-w-md mx-auto mb-8">
            <label htmlFor="theme-search" className="sr-only">
              Search themes
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="theme-search"
                type="search"
                placeholder="Search themes by name or feature…"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                aria-label="Search themes"
              />
            </div>
          </div>

          {/* Filters bar – Shopify-inspired, brand style */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Filter by price</span>
              <div className="flex flex-wrap gap-2">
                {[
                  [80, 300, "All"],
                  [80, 149, "$80 – $149"],
                  [150, 229, "$150 – $229"],
                  [230, 300, "$230 – $300"],
                ].map(([min, max, label]) => (
                  <button
                    key={label}
                    onClick={() => handlePriceChange(min, max)}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-sm border ${
                      priceRange[0] === min && priceRange[1] === max
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {filteredAndSorted.length} theme{filteredAndSorted.length !== 1 ? "s" : ""}
              </span>
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border bg-background hover:bg-muted/50 transition-colors"
                  aria-expanded={sortOpen}
                >
                  Sort
                  <ChevronDown className={`w-4 h-4 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-10" aria-hidden onClick={() => setSortOpen(false)} />
                    <ul className="absolute right-0 top-full mt-1 py-1 min-w-[180px] border border-border bg-card shadow-lg z-20">
                      {SORT_OPTIONS.map((opt) => (
                        <li key={opt.value}>
                          <button
                            onClick={() => {
                              setSortBy(opt.value);
                              setSortOpen(false);
                              setPage(1);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${
                              sortBy === opt.value ? "font-medium bg-muted" : ""
                            }`}
                          >
                            {opt.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Theme grid – current card style */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginated.map((theme) => (
              <div
                key={theme.id}
                className="group rounded-lg border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                  <img
                    src={getThemeImageUrl(theme)}
                    alt={theme.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {(() => {
                    const { usersLabel, rating } = getTrustBadge(theme.id);
                    return (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-background border border-border rounded-full pl-2 pr-2.5 py-1.5 text-sm text-foreground shadow-sm">
                        <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
                        <span style={{ fontFamily: "Space Grotesk" }}>{usersLabel}</span>
                        <span className="text-muted-foreground">(</span>
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" strokeWidth={2} />
                        <span style={{ fontFamily: "Space Grotesk" }}>{rating}</span>
                        <span className="text-muted-foreground">)</span>
                      </div>
                    );
                  })()}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-lg" style={{ fontFamily: "Space Grotesk" }}>{theme.name}</h3>
                    <span className="text-lg text-secondary shrink-0" style={{ fontFamily: "Space Grotesk", fontWeight: 500 }}>{theme.priceLabel}</span>
                  </div>
                  <ul className="space-y-1 mb-4">
                    {theme.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-secondary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => openPurchase(theme)}
                    className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm px-4 py-2 font-medium hover:bg-primary/90 transition-colors"
                  >
                    Purchase Theme
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Purchase Theme Dialog */}
      <Dialog open={purchaseOpen} onOpenChange={(open) => !open && closePurchase()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Space Grotesk" }}>
              Purchase {selectedTheme?.name}
            </DialogTitle>
            <DialogDescription style={{ fontFamily: "Space Grotesk" }}>
              Enter your email and Shopify store URL. After payment, we&apos;ll send a confirmation and set up the theme for your store shortly.
            </DialogDescription>
          </DialogHeader>
          {selectedTheme && (
            <form onSubmit={handlePurchaseSubmit} className="space-y-4 py-2">
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <span className="text-muted-foreground">Theme</span>
                <span style={{ fontFamily: "Space Grotesk", fontWeight: 600 }}>{selectedTheme.name}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-secondary font-medium">{selectedTheme.priceLabel}</span>
              </div>
              <div className="space-y-2">
                <label htmlFor="purchase-email" className="text-sm font-medium text-foreground block">
                  Email address
                </label>
                <Input
                  id="purchase-email"
                  type="email"
                  placeholder="you@example.com"
                  value={purchaseEmail}
                  onChange={(e) => setPurchaseEmail(e.target.value)}
                  className="w-full"
                  required
                  disabled={purchaseLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="store-link" className="text-sm font-medium text-foreground block">
                  Shopify store URL
                </label>
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <span className="text-muted-foreground select-none text-base md:text-sm shrink-0">https://</span>
                  <input
                    id="store-link"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    placeholder="store url"
                    value={storeLink}
                    onChange={(e) => {
                      let v = e.target.value.trim();
                      v = v.replace(/^https?:\/\//i, "");
                      setStoreLink(v);
                    }}
                    className="flex-1 min-w-0 bg-transparent border-0 outline-none text-base md:text-sm placeholder:text-muted-foreground px-0 py-0 h-full"
                    required
                    disabled={purchaseLoading}
                  />
                </div>
              </div>
              {purchaseError && (
                <p className="text-sm text-destructive">{purchaseError}</p>
              )}
              <DialogFooter className="gap-2 sm:gap-0">
                <button
                  type="button"
                  onClick={closePurchase}
                  className="px-4 py-2 text-sm font-medium border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purchaseLoading}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm px-4 py-2 font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {purchaseLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Redirecting to payment…
                    </>
                  ) : (
                    <>
                      Purchase now
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Theme;
