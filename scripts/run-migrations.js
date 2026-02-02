/**
 * Run pending PostgreSQL migrations from db/migrations/.
 * Uses config so DATABASE_URL or DB_* env vars work. Safe to run multiple times.
 * Usage: node scripts/run-migrations.js
 */
import "dotenv/config";
import pg from "pg";
import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "db", "migrations");

function getDbConfig() {
  const url = (process.env.DATABASE_URL || "").trim();
  const dbPassword = process.env.DB_PASSWORD;
  if (url) {
    if (dbPassword !== undefined && dbPassword !== "" && typeof dbPassword === "string") {
      try {
        const u = new URL(url.split("?")[0]);
        return {
          host: u.hostname,
          port: u.port ? parseInt(u.port, 10) : 5432,
          database: (u.pathname || "").replace(/^\//, "") || "elursh",
          user: u.username || process.env.DB_USER || "postgres",
          password: dbPassword,
          ssl: url.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
        };
      } catch {
        return { connectionString: url };
      }
    }
    return { connectionString: url };
  }
  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "5432", 10);
  const database = process.env.DB_NAME || process.env.DB_DATABASE || "elursh";
  const user = process.env.DB_USER || process.env.DB_USERNAME;
  const password = dbPassword;
  if (!user || !password) {
    console.error("Set DATABASE_URL or DB_USER and DB_PASSWORD in .env");
    process.exit(1);
  }
  return { host, port, database, user, password };
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

async function run() {
  const pool = new pg.Pool(getDbConfig());
  const client = await pool.connect();
  try {
    await client.query("SET search_path = public");
    await ensureMigrationsTable(client);
    const files = await readdir(migrationsDir);
    const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort();
    for (const file of sqlFiles) {
      const version = file.replace(/\.sql$/, "");
      const { rows } = await client.query(
        "SELECT 1 FROM schema_migrations WHERE version = $1",
        [version]
      );
      if (rows.length > 0) {
        console.log("Skip (already applied):", version);
        continue;
      }
      const sql = await readFile(join(migrationsDir, file), "utf-8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (version) VALUES ($1)",
          [version]
        );
        await client.query("COMMIT");
        console.log("Applied:", version);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }
    console.log("Migrations complete.");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
