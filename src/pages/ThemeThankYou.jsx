import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check, X, Loader, ArrowLeft } from "react-feather";

const ThemeThankYou = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("missing");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/paystack-verify?reference=${encodeURIComponent(reference)}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          setStatus("success");
        } else {
          setStatus("failed");
          setError(data.error || "Payment verification failed.");
        }
      } catch (err) {
        if (cancelled) return;
        setStatus("failed");
        setError(err.message || "Something went wrong. Please try again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-28 pb-16 bg-background">
        <div className="container-custom max-w-lg mx-auto text-center px-4">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-6 py-12">
              <Loader className="w-12 h-12 text-primary animate-spin" aria-hidden />
              <p className="text-muted-foreground" style={{ fontFamily: "Space Grotesk" }}>
                Verifying your payment…
              </p>
            </div>
          )}
          {status === "missing" && (
            <div className="flex flex-col items-center gap-6 py-12">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <X className="w-7 h-7 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-semibold" style={{ fontFamily: "Space Grotesk" }}>
                No payment reference
              </h1>
              <p className="text-muted-foreground">
                You didn’t complete a payment from this flow. If you just paid, use the link from your email or try again from the theme page.
              </p>
              <Link
                to="/theme"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to themes
              </Link>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center gap-6 py-12">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-7 h-7 text-primary" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-semibold" style={{ fontFamily: "Space Grotesk" }}>
                Payment successful
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                We’ve sent a confirmation to your email. Your theme will be set up for your store shortly. We’ll email you again once it’s ready.
              </p>
              <Link
                to="/theme"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-medium hover:bg-primary/90 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to themes
              </Link>
            </div>
          )}
          {status === "failed" && (
            <div className="flex flex-col items-center gap-6 py-12">
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="w-7 h-7 text-destructive" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-semibold" style={{ fontFamily: "Space Grotesk" }}>
                Verification failed
              </h1>
              <p className="text-muted-foreground">
                {error}
              </p>
              <Link
                to="/theme"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to themes
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThemeThankYou;
