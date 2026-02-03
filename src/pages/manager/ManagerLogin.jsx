import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { managerApiBase } from "@/lib/managerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import logo from "@/assets/logo.png";

export default function ManagerLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const errorParam = searchParams.get("error");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorParam ? decodeURIComponent(errorParam) : "");

  useEffect(() => {
    document.title = "Manager Login | Elursh";
  }, []);

  useEffect(() => {
    if (errorParam) setError(decodeURIComponent(errorParam));
  }, [errorParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = code.replace(/\s/g, "").trim();
    if (!trimmed || !/^\d{6}$/.test(trimmed)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${managerApiBase}/auth/totp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      navigate("/manager", { replace: true });
      window.location.reload();
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-dashboard min-h-screen flex items-center justify-center p-4 bg-[var(--manager-bg)]">
      <div className="w-full max-w-md rounded-none border border-white/50 bg-white/90 shadow-lg shadow-black/5 backdrop-blur-sm">
        <div className="p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Elursh" className="h-9 object-contain" />
          </div>
          <h1 className="text-center text-2xl font-semibold text-black mb-1">Sign in</h1>
          <p className="text-center text-sm text-black/60 mb-8">
            Enter the 6-digit code from your authenticator app.
          </p>

          {(error || errorParam) && (
            <Alert variant="destructive" className="mb-6 rounded-none">
              <AlertDescription>
                {error || (errorParam === "login_failed" ? "Login was denied or failed." : decodeURIComponent(errorParam))}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="totp-code" className="text-sm font-medium text-black/80">
                Authenticator code
              </Label>
              <Input
                id="totp-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="h-12 rounded-none border border-black/10 bg-[#f7f7f5] px-4 text-center text-lg tracking-[0.4em] font-mono placeholder:text-black/30 focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:border-black/20"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-none bg-black font-medium text-base transition-colors disabled:opacity-70"
              style={{ color: "var(--manager-lime, #A8FF00)" }}
              disabled={loading || code.length !== 6}
            >
              {loading ? "Verifying…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
