/**
 * Print which DB connection is being used (no secrets). Run: node scripts/check-db-config.js
 */
import "dotenv/config";
import { config } from "../config/index.js";

const db = config.db;
if (!db) {
  console.log("No DB config: DATABASE_URL or DB_USER+DB_PASSWORD not set or invalid.");
  process.exit(1);
}
console.log("DB connection (from .env):");
console.log("  host:", db.host);
console.log("  port:", db.port);
console.log("  database:", db.database);
console.log("  user:", db.user);
console.log("  password:", db.password ? "[SET]" : "[MISSING]");
console.log("\nIf these match pgAdmin but connection fails, the PASSWORD is wrong.");
console.log("Fix: use the exact password you use in pgAdmin (no quotes/spaces).");
console.log("Special chars in password? Use URL encoding in DATABASE_URL (e.g. @ -> %40).");
