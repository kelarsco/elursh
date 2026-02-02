/**
 * Create first admin user for JWT login. Run after migrations.
 * Usage: node scripts/seed-admin-user.js
 * Env: DATABASE_URL (or DB_*), ADMIN_EMAIL, ADMIN_PASSWORD (required).
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";

const email = process.env.ADMIN_EMAIL?.trim()?.toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
  process.exit(1);
}

function getDbConfig() {
  const url = process.env.DATABASE_URL;
  if (url) return { connectionString: url };
  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "5432", 10);
  const database = process.env.DB_NAME || process.env.DB_DATABASE || "elursh";
  const user = process.env.DB_USER || process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  if (!user || !password) {
    console.error("Set DATABASE_URL or DB_USER and DB_PASSWORD in .env");
    process.exit(1);
  }
  return { host, port, database, user, password };
}

async function run() {
  const pool = new pg.Pool(getDbConfig());
  const client = await pool.connect();
  try {
    const existing = await client.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      console.log("Admin user already exists for", email);
      return;
    }
    const hash = await bcrypt.hash(password, 12);
    await client.query(
      "INSERT INTO users (email, password_hash, role, display_name) VALUES ($1,$2,'admin',$3)",
      [email, hash, process.env.ADMIN_DISPLAY_NAME || "Admin"]
    );
    console.log("Admin user created for", email);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
