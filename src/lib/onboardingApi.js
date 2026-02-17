/**
 * Onboarding API client for get-started flow.
 */
import { apiBase } from "@/lib/apiBase";

const base = apiBase ? `${apiBase}/api/onboarding` : "/api/onboarding";

export async function createSession() {
  const res = await fetch(`${base}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json.sessionId;
}

export async function getSession(sessionId) {
  const res = await fetch(`${base}/session/${sessionId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateSession(sessionId, data) {
  const res = await fetch(`${base}/session/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
