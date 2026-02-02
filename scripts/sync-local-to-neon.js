/**
 * Copy all data from local PostgreSQL to Neon.
 * Run once when you want Neon to have the same data as your local DB.
 *
 * Prereqs:
 * - Local Postgres running with your data.
 * - Set LOCAL_DATABASE_URL in .env to your local DB (e.g. postgresql://postgres:YOUR_PASSWORD@localhost:5432/elursh).
 * - DATABASE_URL in .env must point to Neon (already set).
 * - pg_dump and psql on PATH (from Postgres install).
 *
 * Usage: node scripts/sync-local-to-neon.js
 */
import "dotenv/config";
import { spawnSync } from "child_process";
import { unlinkSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const dumpPath = join(projectRoot, "sync_local_to_neon_dump.sql");

function buildLocalUrl() {
  const h = process.env.LOCAL_DB_HOST || process.env.DB_HOST || "localhost";
  const p = process.env.LOCAL_DB_PORT || process.env.DB_PORT || "5432";
  const d = process.env.LOCAL_DB_NAME || process.env.DB_NAME || process.env.DB_DATABASE || "elursh";
  const u = process.env.LOCAL_DB_USER || process.env.DB_USER || process.env.DB_USERNAME;
  const pw = process.env.LOCAL_DB_PASSWORD ?? process.env.DB_PASSWORD;
  if (!u || pw === undefined || pw === "") return null;
  const pass = encodeURIComponent(String(pw));
  return `postgresql://${u}:${pass}@${h}:${p}/${d}`;
}

const LOCAL_URL = process.env.LOCAL_DATABASE_URL?.trim() || buildLocalUrl();

const NEON_URL = process.env.DATABASE_URL;

if (!LOCAL_URL) {
  console.error("Set local DB connection in .env using one of:");
  console.error("  LOCAL_DATABASE_URL=postgresql://user:PASSWORD@localhost:5432/elursh  (encode @ in password as %40)");
  console.error("  Or LOCAL_DB_HOST, LOCAL_DB_USER, LOCAL_DB_PASSWORD, LOCAL_DB_NAME (password can contain @)");
  process.exit(1);
}

if (!NEON_URL || !NEON_URL.includes("neon.tech")) {
  console.error("Set DATABASE_URL in .env to your Neon connection string.");
  process.exit(1);
}

const TABLES = [
  "schema_migrations",
  "users",
  "analysed_stores",
  "contacts",
  "services",
  "store_reports",
  "orders",
  "payments",
  "emails_sent",
  "content_pages",
  "products",
  "themes",
];

async function main() {
  console.log("1. Dumping data from local DB...");
  try {
    const r = spawnSync(
      "pg_dump",
      ["-d", LOCAL_URL, "--data-only", "--no-owner", "--no-privileges", "-f", dumpPath],
      { stdio: "inherit", shell: false }
    );
    if (r.status !== 0) throw new Error("pg_dump exited with " + r.status);
  } catch (e) {
    console.error("pg_dump failed. Is local Postgres running and LOCAL_DATABASE_URL correct?");
    process.exit(1);
  }

  if (!existsSync(dumpPath)) {
    console.error("Dump file was not created.");
    process.exit(1);
  }

  console.log("2. Truncating tables on Neon (so restore has no conflicts)...");
  const pool = new pg.Pool({ connectionString: NEON_URL, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    const list = TABLES.join(", ");
    await client.query(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
  } catch (err) {
    console.error("Truncate failed:", err.message);
    client.release();
    await pool.end();
    if (existsSync(dumpPath)) unlinkSync(dumpPath);
    process.exit(1);
  }
  client.release();
  await pool.end();

  console.log("3. Restoring dump into Neon...");
  try {
    const r = spawnSync("psql", ["-d", NEON_URL, "-f", dumpPath], { stdio: "inherit", shell: false });
    if (r.status !== 0) throw new Error("psql exited with " + r.status);
  } catch (e) {
    console.error("psql restore failed. Check Neon DATABASE_URL and network.");
    if (existsSync(dumpPath)) unlinkSync(dumpPath);
    process.exit(1);
  }

  if (existsSync(dumpPath)) {
    unlinkSync(dumpPath);
    console.log("Removed temporary dump file.");
  }

  console.log("Done. Neon now has the same data as your local DB.");
}

main();
