/**
 * Customer auth API client for Get Started flow.
 */
import { apiBase } from "@/lib/apiBase";

const base = apiBase ? `${apiBase}/api/auth` : "/api/auth";
const TOKEN_KEY = "elursh_customer_token";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function sendOtp(email) {
  const res = await fetch(`${base}/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to send code");
  return data;
}

export async function verifyOtp(email, code) {
  const res = await fetch(`${base}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), code: String(code).trim() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Verification failed");
  return data;
}

export function getGoogleAuthUrl() {
  const b = apiBase?.replace(/\/$/, "") || "";
  return b ? `${b}/api/auth/google` : "/api/auth/google";
}

export async function getMe() {
  const token = getStoredToken();
  if (!token) return null;
  const res = await fetch(`${base}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

// Chat API
export async function getChatMessages() {
  const token = getStoredToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${base}/chat/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sendChatMessage(messageText) {
  const token = getStoredToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${base}/chat/messages`, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: messageText }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
