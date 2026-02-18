import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createSession, getSession, updateSession } from "@/lib/onboardingApi";
import { getStoredToken } from "@/lib/authApi";
import { getShopifyInstallUrl } from "@/lib/shopifyAuthApi";

const PLATFORMS = [
  { id: "shopify", key: "shopify", logo: "/platforms/shopify.png" },
  { id: "etsy", key: "etsy", logo: "/platforms/etsy.png" },
  { id: "bigcommerce", key: "bigcommerce", logo: "/platforms/bigcommerce.png" },
  { id: "wordpress", key: "wordpress", logo: "/platforms/wordpress.png" },
  { id: "wix", key: "wix", logo: "/platforms/wix.png" },
  { id: "woocommerce", key: "woocommerce", logo: "/platforms/woocommerce.png" },
];

const SESSION_KEY = "elursh_onboarding_session";

function PlatformCard({ label, logo, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className="group relative aspect-[4/3] rounded-xl border-2 border-border bg-card p-6 flex flex-col items-center justify-center gap-3 text-lg font-semibold text-foreground transition-all duration-300 hover:border-foreground/40 hover:bg-muted/50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
    >
      {logo && (
        <img src={logo} alt="" className="h-12 w-auto object-contain max-w-full" aria-hidden />
      )}
      <span className="relative z-10">{label}</span>
      <div className="absolute inset-0 rounded-xl bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300 pointer-events-none" />
    </button>
  );
}

function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="flex flex-col items-center gap-8">
        {/* Vertical line loading animation */}
        <div className="relative h-24 w-1 overflow-hidden rounded-full bg-muted">
          <div
            className="absolute left-0 right-0 h-8 bg-foreground rounded-full"
            style={{ animation: "loadingLine 1.2s ease-in-out infinite" }}
          />
        </div>
        <p className="text-muted-foreground font-medium">{message}</p>
      </div>
    </div>
  );
}

export default function GetStarted() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [storeError, setStoreError] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      navigate("/auth?redirect=/get-started", { replace: true });
      return;
    }
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = getStoredToken();
      if (!token) return;
      let sid = sessionStorage.getItem(SESSION_KEY);
      if (sid) {
        try {
          const s = await getSession(sid);
          if (s && mounted) {
            if (s.first_choice) {
              redirectAfterChoice(s.first_choice);
              return;
            }
            if (s.store_connected) {
              navigate("/dashboard", { replace: true });
              return;
            }
            if (s.platform) {
              setStep(2);
              setStoreUrl(s.store_url || "");
              setSelectedPlatform(s.platform || "");
              setSessionId(sid);
              return;
            }
          }
        } catch {
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
      if (!sid && mounted) {
        try {
          sid = await createSession();
          if (mounted) {
            sessionStorage.setItem(SESSION_KEY, sid);
            setSessionId(sid);
          }
        } catch (e) {
          console.error("Failed to create session:", e);
          sessionStorage.setItem(SESSION_KEY, "local");
          setSessionId("local");
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  function redirectAfterChoice(choice) {
    if (choice === "design") {
      navigate("/improve-store?focus=design");
    } else {
      navigate("/improve-store?focus=marketing");
    }
  }

  const handlePlatformSelect = async (platformId) => {
    setSelectedPlatform(platformId);
    setLoading(true);
    setLoadingMessage(t("onboarding.connecting"));
    try {
      if (sessionId && sessionId !== "local") {
        await updateSession(sessionId, { platform: platformId });
      }
      await new Promise((r) => setTimeout(r, 1200));
      setStep(2);
    } catch (e) {
      console.error(e);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStore = async (e) => {
    e.preventDefault();
    const url = storeUrl.trim();
    if (!url) {
      setStoreError("Please enter your store URL");
      return;
    }
    const normalized = url.toLowerCase().replace(/^https?:\/\//, "");
    if (!normalized.includes(".") && !normalized.includes("myshopify")) {
      setStoreError("Please enter a valid store URL (e.g. mystore.myshopify.com)");
      return;
    }
    setStoreError("");
    setLoading(true);
    setLoadingMessage(t("onboarding.connecting"));

    try {
      if (selectedPlatform === "shopify") {
        const installUrl = await getShopifyInstallUrl(url, sessionId && sessionId !== "local" ? sessionId : null);
        if (installUrl) {
          window.location.href = installUrl;
          return;
        }
      }
      if (sessionId && sessionId !== "local") {
        await updateSession(sessionId, { store_url: url, store_connected: true });
      }
      await new Promise((r) => setTimeout(r, 1500));
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setStoreError(e.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFirstChoice = async (choice) => {
    setLoading(true);
    setLoadingMessage(t("common.loading"));
    try {
      if (sessionId && sessionId !== "local") {
        await updateSession(sessionId, { first_choice: choice });
      }
      await new Promise((r) => setTimeout(r, 600));
      redirectAfterChoice(choice);
    } catch (e) {
      console.error(e);
      redirectAfterChoice(choice);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <style>{`
        @keyframes loadingLine {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(96px); }
        }
      `}</style>

      {loading && <LoadingOverlay message={loadingMessage} />}

      <main className="pt-32 pb-24 px-4">
        <div className="container-custom max-w-4xl mx-auto">
          {step === 1 && (
            <div className="animate-in fade-in duration-500">
              <h1 className="text-4xl md:text-5xl font-sans font-semibold text-center mb-4">
                {t("onboarding.step1Title")}
              </h1>
              <p className="text-muted-foreground text-center mb-16">
                {t("onboarding.step1Subtitle")}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {PLATFORMS.map((p) => (
                  <PlatformCard
                    key={p.id}
                    label={t(`onboarding.${p.key}`)}
                    logo={p.logo}
                    onSelect={() => handlePlatformSelect(p.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in duration-500">
              <h1 className="text-4xl md:text-5xl font-sans font-semibold text-center mb-4">
                {t("onboarding.step2Title")}
              </h1>
              <p className="text-muted-foreground text-center mb-12">
                {t("onboarding.step2Subtitle")}
              </p>
              <form onSubmit={handleConnectStore} className="max-w-xl mx-auto">
                <input
                  type="url"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder={t("onboarding.storeUrlPlaceholder")}
                  className="w-full px-6 py-4 text-lg border-2 border-border rounded-xl bg-background focus:outline-none focus:border-foreground/50 focus:ring-2 focus:ring-foreground/20 transition-all"
                  autoFocus
                />
                {storeError && (
                  <p className="mt-2 text-sm text-destructive">{storeError}</p>
                )}
                <button
                  type="submit"
                  className="mt-6 w-full py-4 bg-foreground text-background font-semibold rounded-xl hover:bg-foreground/90 transition-colors"
                >
                  {t("onboarding.connectStore")}
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in duration-500">
              <h1 className="text-4xl md:text-5xl font-sans font-semibold text-center mb-4">
                {t("onboarding.step3Title")}
              </h1>
              <p className="text-muted-foreground text-center mb-16">
                {t("onboarding.step3Subtitle")}
              </p>
              <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <button
                  onClick={() => handleFirstChoice("design")}
                  className="group aspect-[4/3] rounded-xl border-2 border-border bg-card p-8 flex flex-col items-start justify-center text-left transition-all duration-300 hover:border-foreground/40 hover:bg-muted/50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="text-xl font-semibold text-foreground">
                    {t("onboarding.designOption")}
                  </span>
                </button>
                <button
                  onClick={() => handleFirstChoice("marketing")}
                  className="group aspect-[4/3] rounded-xl border-2 border-border bg-card p-8 flex flex-col items-start justify-center text-left transition-all duration-300 hover:border-foreground/40 hover:bg-muted/50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="text-xl font-semibold text-foreground">
                    {t("onboarding.marketingOption")}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
