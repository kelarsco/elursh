/**
 * PostgreSQL connection pool. Environment-based config; no credentials hardcoded.
 * Set DATABASE_URL in .env to use any Postgres (local, Neon, Supabase, etc.).
 * Auto-reconnect: pg Pool reconnects on next query after connection loss.
 */
import "dotenv/config";
import { Pool } from "pg";

const connectionString =
  typeof process.env.DATABASE_URL === "string"
    ? process.env.DATABASE_URL.trim()
    : "";

const isNeon = connectionString.includes("neon.tech");

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: isNeon || process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
    })
  : null;

if (pool) {
  pool.on("error", (err) => {
    console.error("DB pool error (connections will be recreated on next use):", err.message);
  });
  // Neon (and some cloud Postgres) may not have public in search_path; set it on each new connection
  if (isNeon) {
    pool.on("connect", (client) => {
      client.query("SET search_path = public").catch(() => {});
    });
  }
}

export function getPool() {
  return pool;
}

export async function query(text, params) {
  const p = getPool();
  if (!p) throw new Error("Database not configured. Set DATABASE_URL in .env.");
  return p.query(text, params);
}

/**
 * Health check: run a simple query to verify connectivity.
 * Use for deployment readiness checks.
 */
export async function healthCheck() {
  const p = getPool();
  if (!p) return { ok: false, error: "no_pool" };
  try {
    const r = await p.query("SELECT 1 AS ok");
    return r.rows[0]?.ok === 1 ? { ok: true } : { ok: false };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export default pool;
