import "dotenv/config";
import { healthCheck } from "../lib/db.js";

const r = await healthCheck();
console.log("DB health:", r);
process.exit(r.ok ? 0 : 1);
