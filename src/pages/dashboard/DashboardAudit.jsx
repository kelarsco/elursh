import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { auditStore } from "@/services/storeAudit";
import { apiBase } from "@/lib/apiBase";

export default function DashboardAudit() {
  const { user } = useOutletContext() || {};
  const navigate = useNavigate();
  const [storeUrl, setStoreUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const sid = sessionStorage.getItem("elursh_onboarding_session");
    if (!sid) return;
    fetch(`${apiBase || ""}/api/onboarding/session/${sid}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => s?.store_url && setStoreUrl(s.store_url))
      .catch(() => {});
  }, []);

  const runAudit = async () => {
    const url = storeUrl?.trim();
    if (!url) {
      setError("Enter your store URL first");
      return;
    }
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const data = await auditStore(url);
      setReport(data);
      // Save to backend for future dashboard display
      await fetch(`${apiBase || ""}/api/analysed-stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeUrl: url, result: data }),
      }).catch(() => {});
    } catch (e) {
      setError(e?.message || "Audit failed");
    } finally {
      setLoading(false);
    }
  };

  const openFullAudit = () => {
    if (storeUrl) {
      window.open(`/analyze-store?url=${encodeURIComponent(storeUrl)}`, "_blank");
    } else {
      navigate("/get-started");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900" style={{ fontFamily: "Space Grotesk" }}>
          Store Audit
        </h1>
        <p className="text-neutral-600 mt-1">
          Run a full audit on your store to identify critical issues and growth opportunities.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
        <label className="block text-sm font-medium text-neutral-700 mb-2">Store URL</label>
        <input
          type="text"
          value={storeUrl}
          onChange={(e) => setStoreUrl(e.target.value)}
          placeholder="mystore.myshopify.com or mystore.com"
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <button
            onClick={runAudit}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-70 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Run audit now
          </button>
          <button
            onClick={openFullAudit}
            className="px-6 py-3 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50"
          >
            Open detailed report →
          </button>
        </div>
      </div>

      {report && (
        <div className="mt-8 p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Audit summary</h2>
          <pre className="text-sm text-neutral-600 overflow-auto max-h-96 bg-neutral-50 p-4 rounded-lg">
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      )}

      {!storeUrl && (
        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-800">
            Connect your store in the onboarding flow to run audits.{" "}
            <button
              onClick={() => navigate("/get-started")}
              className="font-medium underline hover:no-underline"
            >
              Go to Get Started
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
