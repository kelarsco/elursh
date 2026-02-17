import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setStoredToken } from "@/lib/authApi";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    const redirect = searchParams.get("redirect") || "/get-started";
    const error = searchParams.get("error");
    if (error) {
      setStatus("error");
      setTimeout(() => navigate(`/auth?error=${encodeURIComponent(error)}&redirect=${encodeURIComponent(redirect)}`, { replace: true }), 2000);
      return;
    }
    const hash = window.location.hash;
    const match = hash?.match(/token=([^&]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;
    if (token) {
      setStoredToken(token);
      setStatus("success");
      navigate(redirect.startsWith("/") ? redirect : "/get-started", { replace: true });
    } else {
      setStatus("error");
      setTimeout(() => navigate(`/auth?redirect=${encodeURIComponent(redirect)}`, { replace: true }), 2000);
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Signing you in...</p>
          </div>
        )}
        {status === "success" && (
          <p className="text-foreground">Success! Redirecting...</p>
        )}
        {status === "error" && (
          <p className="text-destructive">Something went wrong. Redirecting...</p>
        )}
      </div>
    </div>
  );
}
