/**
 * API base URL for backend requests.
 * - When VITE_USE_API_PROXY=true: use relative URLs so Vercel proxies /api/* to Railway (same-origin, fixes session cookies).
 * - Otherwise: use VITE_API_URL for direct requests to Railway.
 * - Local dev: relative /api works via Vite proxy to localhost:3001.
 */
const useProxy = import.meta.env.VITE_USE_API_PROXY === "true";
const directUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export const apiBase = useProxy ? "" : directUrl;
