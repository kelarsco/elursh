import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createSession, getSession, updateSession } from "@/lib/onboardingApi";
import { getStoredToken, sendOtp, verifyOtp, setStoredToken, getGoogleAuthUrl } from "@/lib/authApi";
import { getShopifyInstallUrl } from "@/lib/shopifyAuthApi";

const PLATFORMS = [
  { id: "shopify", key: "shopify", logo: "/platforms/shopify.png", comingSoon: false },
  { id: "etsy", key: "etsy", logo: "/platforms/etsy.png", comingSoon: true },
  { id: "bigcommerce", key: "bigcommerce", logo: "/platforms/bigcommerce.png", comingSoon: true },
  { id: "wordpress", key: "wordpress", logo: "/platforms/wordpress.png", comingSoon: true },
  { id: "wix", key: "wix", logo: "/platforms/wix.png", comingSoon: true },
  { id: "woocommerce", key: "woocommerce", logo: "/platforms/woocommerce.png", comingSoon: true },
];

const SESSION_KEY = "elursh_onboarding_session";

function PlatformCard({ label, logo, onSelect, comingSoon }) {
  return (
    <button
      type="button"
      onClick={comingSoon ? undefined : onSelect}
      disabled={comingSoon}
      className={`group relative aspect-[4/3] rounded-xl border-2 border-border bg-card p-6 flex flex-col items-center justify-center gap-3 text-lg font-semibold text-foreground transition-all duration-300 ${
        comingSoon
          ? "opacity-60 cursor-not-allowed"
          : "hover:border-foreground/40 hover:bg-muted/50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
      }`}
    >
      {comingSoon && (
        <span className="absolute top-3 right-3 rounded-full bg-muted/90 px-2 py-0.5 text-xs font-medium text-muted-foreground">
          Coming soon
        </span>
      )}
      {logo && (
        <img src={logo} alt="" className="h-12 w-auto object-contain max-w-full" aria-hidden />
      )}
      <span className="relative z-10">{label}</span>
      {!comingSoon && (
        <div className="absolute inset-0 rounded-xl bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300 pointer-events-none" />
      )}
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
  // Auth state for step 3
  const [email, setEmail] = useState("");
  const [authStep, setAuthStep] = useState("email"); // email | code
  const [code, setCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check if user is already logged in - if so, go to dashboard
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      // User is logged in, check if they have completed onboarding
      navigate("/dashboard", { replace: true });
      return;
    }
  }, [navigate]);

  // Initialize onboarding session
  useEffect(() => {
    let mounted = true;
    (async () => {
      let sid = sessionStorage.getItem(SESSION_KEY);
      if (sid) {
        try {
          const s = await getSession(sid);
          if (s && mounted) {
            // Restore progress
            if (s.platform) {
              setSelectedPlatform(s.platform);
              if (s.store_url) {
                setStoreUrl(s.store_url);
                setStep(2);
              } else {
                setStep(2);
              }
            }
            setSessionId(sid);
            return;
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
    // Save store URL and move to auth step
    try {
      if (sessionId && sessionId !== "local") {
        await updateSession(sessionId, { store_url: url });
      }
      setStep(3);
    } catch (e) {
      setStoreError(e.message || "Failed to save store URL");
    }
  };

  // Auth handlers for step 3
  const handleSendCode = async (e) => {
    e?.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setAuthError("Please enter a valid email address");
      return;
    }
    setAuthError("");
    setLoading(true);
    setLoadingMessage("Sending verification code...");
    try {
      await sendOtp(trimmed);
      setEmail(trimmed);
      setAuthStep("code");
      setCode("");
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      setAuthError(err.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e?.preventDefault();
    if (!code || code.length !== 4) {
      setAuthError("Enter the 4-digit code");
      return;
    }
    setAuthError("");
    setLoading(true);
    setLoadingMessage("Verifying...");
    try {
      const { token } = await verifyOtp(email, code);
      setStoredToken(token);
      
      // Save platform and store URL to session, then redirect to dashboard
      if (sessionId && sessionId !== "local") {
        await updateSession(sessionId, { 
          platform: selectedPlatform,
          store_url: storeUrl,
          store_connected: true 
        });
      }
      
      // Handle Shopify OAuth if needed
      if (selectedPlatform === "shopify" && storeUrl) {
        try {
          const installUrl = await getShopifyInstallUrl(storeUrl, sessionId && sessionId !== "local" ? sessionId : null);
          if (installUrl) {
            window.location.href = installUrl;
            return;
          }
        } catch (e) {
          console.warn("Shopify install URL failed, continuing to dashboard:", e);
        }
      }
      
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setAuthError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Store onboarding data in sessionStorage for after Google auth
    if (sessionId && sessionId !== "local") {
      sessionStorage.setItem("pending_onboarding", JSON.stringify({
        sessionId,
        platform: selectedPlatform,
        storeUrl
      }));
    }
    window.location.href = getGoogleAuthUrl();
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
                    comingSoon={p.comingSoon}
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
            <div className="animate-in fade-in duration-500 max-w-md mx-auto">
              <h1 className="text-4xl md:text-5xl font-sans font-semibold text-center mb-4">
                {t("onboarding.step3Title")}
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                {t("onboarding.step3Subtitle")}
              </p>
              
              {authStep === "email" ? (
                <form onSubmit={handleSendCode} className="space-y-6">
                  <div>
                    <label htmlFor="getstarted-email" className="block text-sm font-medium text-foreground mb-2">
                      {t("auth.emailLabel")}
                    </label>
                    <input
                      id="getstarted-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground/50"
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                  {authError && (
                    <p className="text-sm text-destructive">{authError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60"
                  >
                    {loading ? "Sending..." : t("auth.continueWithEmail")}
                  </button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">{t("auth.or")}</span>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {t("auth.signUpWithGoogle")}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <p className="text-sm text-muted-foreground text-center">
                    {t("auth.enterCode", { email })}
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="0000"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground/50"
                    autoFocus
                    autoComplete="one-time-code"
                  />
                  {authError && (
                    <p className="text-sm text-destructive">{authError}</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || code.length !== 4}
                      className="flex-1 py-3 rounded-lg bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60"
                    >
                      {loading ? "Verifying..." : t("auth.verify")}
                    </button>
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={resendCooldown > 0 || loading}
                      className="py-3 px-4 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
                    >
                      {resendCooldown > 0 ? `${resendCooldown}s` : t("auth.resendCode")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
