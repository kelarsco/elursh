import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { sendOtp, verifyOtp, getGoogleAuthUrl, setStoredToken } from "@/lib/authApi";

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "signup"; // signup | login
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email"); // email | code
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeSentAt, setCodeSentAt] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSendCode = async (e) => {
    e?.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await sendOtp(trimmed);
      setEmail(trimmed);
      setStep("code");
      setCode("");
      setCodeSentAt(Date.now());
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
      setError(err.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e?.preventDefault();
    if (!code || code.length !== 4) {
      setError("Enter the 4-digit code");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { user, token } = await verifyOtp(email, code);
      setStoredToken(token);
      const redirect = searchParams.get("redirect") || "/get-started";
      navigate(redirect.startsWith("/") ? redirect : "/get-started", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24 px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-foreground mb-1" style={{ fontFamily: "Space Grotesk" }}>
              {t("auth.title")}
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              {t("auth.subtitle")}
            </p>

            {step === "email" ? (
              <form onSubmit={handleSendCode} className="space-y-6">
                <div>
                  <label htmlFor="auth-email" className="block text-sm font-medium text-foreground mb-2">
                    {t("auth.emailLabel")}
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-foreground/50"
                    autoFocus
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors disabled:opacity-60"
                >
                  {loading ? "Sending..." : t("auth.continueWithEmail")}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <p className="text-sm text-muted-foreground">
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

            {step === "email" && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t("auth.or")}</span>
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
              </>
            )}

            {error && (
              <p className="mt-4 text-sm text-destructive">{error}</p>
            )}

            <p className="mt-8 text-center text-sm text-muted-foreground">
              {t("auth.alreadyHaveAccount")}{" "}
              <Link to={mode === "login" ? "/auth" : "/auth?mode=login"} className="text-primary hover:underline font-medium">
                {t("auth.logIn")} →
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {t("auth.termsPrefix")}{" "}
            <Link to="/" className="text-primary hover:underline">{t("auth.termsLink")}</Link>
            {" "}{t("auth.and")}{" "}
            <Link to="/" className="text-primary hover:underline">{t("auth.privacyLink")}</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
