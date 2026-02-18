/**
 * Shopify connection API - OAuth install flow.
 * User must be logged in (Bearer token). Backend returns install URL to redirect to Shopify.
 */
import { apiBase } from "@/lib/apiBase";
import { getStoredToken } from "@/lib/authApi";

const base = apiBase?.replace(/\/$/, "") || "";

export async function getShopifyInstallUrl(shop, sessionId = null) {
  const token = getStoredToken();
  if (!token) throw new Error("Login required");
  const res = await fetch(`${base}/api/shopify/install`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shop: String(shop || "").trim(), sessionId: sessionId || undefined }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to get install URL");
  return data.installUrl;
}

export async function getConnectedStores() {
  const token = getStoredToken();
  if (!token) return [];
  const res = await fetch(`${base}/api/shopify/stores`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getShopifyDashboard(shop) {
  const token = getStoredToken();
  if (!token) return null;
  const res = await fetch(`${base}/api/shopify/dashboard?shop=${encodeURIComponent(shop)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}
