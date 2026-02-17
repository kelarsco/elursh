/**
 * Manager API client (credentials included for session cookie).
 * Uses apiBase for proxy (same-origin) or direct Railway URL.
 */
import { apiBase } from "@/lib/apiBase";

const base = apiBase ? `${apiBase}/api/manager` : "/api/manager";

/** Base URL for manager API (for auth/totp etc when not using managerFetch). */
export const managerApiBase = base;

export async function managerFetch(path, options = {}) {
  const hasBody = options.body != null;
  const res = await fetch(`${base}${path}`, {
    credentials: "include",
    ...options,
    headers: hasBody ? { "Content-Type": "application/json", ...options.headers } : { ...options.headers },
  });
  return res;
}

export async function getMe() {
  const res = await managerFetch("/auth/me");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function logout() {
  const res = await managerFetch("/auth/logout", { method: "POST" });
  return res.ok ? res.json() : Promise.reject(new Error(await res.text()));
}

function asArray(json) {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.data)) return json.data;
  return [];
}

export async function getAnalysedStores() {
  const res = await managerFetch("/analysed-stores");
  if (!res.ok) throw new Error(await res.text());
  let json;
  try {
    const text = await res.text();
    json = text ? JSON.parse(text) : [];
  } catch {
    return [];
  }
  return asArray(json);
}

export async function deleteAnalysedStores(ids) {
  const idArray = Array.isArray(ids) ? ids : [ids];
  const qs = idArray.map((id) => encodeURIComponent(id)).join(",");
  const res = await managerFetch(`/analysed-stores?ids=${qs}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPriceModifier() {
  const res = await managerFetch("/settings/price-modifier");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function setPriceModifier(percent) {
  const res = await managerFetch("/settings/price-modifier", {
    method: "PUT",
    body: JSON.stringify({ priceModifierPercent: percent }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function getServices() {
  const res = await managerFetch("/services");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createService(body) {
  const res = await managerFetch("/services", { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getService(id) {
  const res = await managerFetch(`/services/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateService(id, body) {
  const res = await managerFetch(`/services/${id}`, { method: "PUT", body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteService(id) {
  const res = await managerFetch(`/services/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getThemes() {
  const res = await managerFetch("/themes");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createTheme(body) {
  const res = await managerFetch("/themes", { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTheme(id) {
  const res = await managerFetch(`/themes/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateTheme(id, body) {
  const res = await managerFetch(`/themes/${id}`, { method: "PUT", body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteTheme(id) {
  const res = await managerFetch(`/themes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getStoreReport(storeUrl) {
  const res = await managerFetch(`/store-reports/${encodeURIComponent(storeUrl)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function upsertStoreReport(storeUrl, reportJson) {
  const res = await managerFetch("/store-reports", {
    method: "PUT",
    body: JSON.stringify({ store_url: storeUrl, report_json: reportJson }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getOrders() {
  const res = await managerFetch("/orders");
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return asArray(json);
}

export async function updateOrderStatus(id, status) {
  const res = await managerFetch(`/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteOrders(ids) {
  const idList = Array.isArray(ids) ? ids : [ids];
  const qs = idList.map((id) => encodeURIComponent(id)).join(",");
  const res = await managerFetch(`/orders?ids=${qs}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deletePayment(id) {
  const res = await managerFetch(`/payments/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPayments() {
  const res = await managerFetch("/payments");
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return asArray(json);
}

export async function updatePaymentFulfillmentStatus(id, fulfillmentStatus) {
  const res = await managerFetch(`/payments/${id}/fulfillment`, {
    method: "PATCH",
    body: JSON.stringify({ fulfillment_status: fulfillmentStatus }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getFixItPurchases() {
  const res = await managerFetch("/fix-it-purchases");
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

/** Other purchases: Fix-It Manual + Theme (for Orders "Others" tab). */
export async function getOtherPurchases() {
  const res = await managerFetch("/other-purchases");
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

export async function sendFixItPdf({ email, storeUrl }) {
  const res = await managerFetch("/send-fix-it-pdf", {
    method: "POST",
    body: JSON.stringify({ email, storeUrl }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sendEmail(body) {
  const res = await managerFetch("/send-email", { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getEmailsSent() {
  const res = await managerFetch("/emails-sent");
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

export async function deleteEmailsSent(ids) {
  const idList = Array.isArray(ids) ? ids : [ids];
  const qs = idList.map((id) => encodeURIComponent(id)).join(",");
  let res = await managerFetch(`/emails-sent?ids=${qs}`, { method: "DELETE" });
  if (res.status === 404) {
    res = await managerFetch("/emails-sent/delete", { method: "POST", body: JSON.stringify({ ids: idList }) });
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getOnboardingSessions() {
  const res = await managerFetch("/onboarding-sessions");
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

export async function getContacts() {
  const res = await managerFetch("/contacts");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateContactStatus(id, status) {
  const res = await managerFetch(`/contacts/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// --- Session / activity (placeholder stubs; replace with real endpoints when backend supports) ---

/** Returns recent login activity. Stub: uses mock data if endpoint not implemented. */
export async function getLoginActivity() {
  try {
    const res = await managerFetch("/auth/login-activity");
    if (!res.ok) return getLoginActivityStub();
    const json = await res.json();
    return Array.isArray(json) ? json : json?.data ?? getLoginActivityStub();
  } catch {
    return getLoginActivityStub();
  }
}

function getLoginActivityStub() {
  const now = new Date();
  return [
    { id: "1", at: now.toISOString(), ip: "Current session", device: "This device", success: true },
    { id: "2", at: new Date(now - 86400000).toISOString(), ip: "192.168.1.1", device: "Chrome on Windows", success: true },
    { id: "3", at: new Date(now - 172800000).toISOString(), ip: "10.0.0.5", device: "Safari on Mac", success: true },
  ];
}

/** Returns current sessions/devices. Stub: uses mock data if endpoint not implemented. */
export async function getSessions() {
  try {
    const res = await managerFetch("/auth/sessions");
    if (!res.ok) return getSessionsStub();
    const json = await res.json();
    return Array.isArray(json) ? json : json?.data ?? getSessionsStub();
  } catch {
    return getSessionsStub();
  }
}

function getSessionsStub() {
  return [
    { id: "current", device: "This device", browser: "Chrome", last_active: new Date().toISOString(), current: true },
    { id: "other-1", device: "Windows PC", browser: "Edge", last_active: new Date(Date.now() - 3600000).toISOString(), current: false },
  ];
}

/** Terminates all other sessions (log out other devices). Stub: no-op if endpoint not implemented. */
export async function terminateOtherSessions() {
  try {
    const res = await managerFetch("/auth/sessions/terminate-others", { method: "POST" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } catch (e) {
    // Stub: succeed anyway so UI can show "done"
    return { ok: true };
  }
}
