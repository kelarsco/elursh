/**
 * Seed services and themes from static data into the database.
 * Run after migrations. Safe to run multiple times (skips if tables already have rows).
 * Usage: node scripts/seed-services-and-themes.js
 * Env: DATABASE_URL (or DB_*).
 */
import "dotenv/config";
import pg from "pg";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

function getDbConfig() {
  const url = process.env.DATABASE_URL;
  const dbPassword = process.env.DB_PASSWORD;
  if (url) {
    if (dbPassword !== undefined && dbPassword !== "" && typeof dbPassword === "string") {
      try {
        const u = new URL(url);
        return {
          host: u.hostname,
          port: u.port ? parseInt(u.port, 10) : 5432,
          database: (u.pathname || "").replace(/^\//, "") || "elursh",
          user: u.username || process.env.DB_USER || "postgres",
          password: dbPassword,
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

// Theme data inlined (themes.js uses Vite image imports, not runnable in Node)
const THEME_NAMES = [
  "Zeal", "Force", "Zenith", "Focal", "Broadcast", "Ignite", "Shapes", "Xclusive", "Enterprise", "Sleek",
  "Release", "Pipeline", "Concept", "Xtra", "Impulse", "Prestige", "Symmetry", "Wonder", "Local", "Motion",
  "Craft", "Frost", "Blaze", "Stride", "Grove", "Clarity", "Aura", "Ember", "Haven", "Forge",
  "Catalyst", "Prism", "Vertex", "Pulse", "Drift", "Flux", "Nova", "Vogue", "Minimal", "Bold", "Horizon",
];
const FEATURE_POOL = [
  "Premium Design", "Mobile Optimized", "Speed Focused", "SEO Ready", "Lookbook Layouts", "Quick View",
  "Mega Menu", "Product Filters", "Sticky Header", "Color Swatches", "Countdown Timer", "Infinite Scroll",
  "Quick Order List", "EU Translations", "Right-to-Left", "Stock Counter", "Age Verifier", "Breadcrumbs",
  "Back-to-top", "Before/After Slider",
];
const PRICES = [80, 89, 99, 100, 109, 119, 129, 139, 149, 159, 169, 179, 189, 199, 209, 219, 229, 239, 249, 259, 269, 279, 289, 299, 300];

function pickFeatures(themeId, n = 4) {
  const pool = [...FEATURE_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = (themeId + i) % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

function buildThemesForSeed() {
  return THEME_NAMES.map((name, i) => ({
    name,
    price: PRICES[i % PRICES.length],
    features: pickFeatures(i + 1, 4),
    image: `https://picsum.photos/seed/theme-${i + 1}/400/300`,
    sort_order: i,
  }));
}

async function run() {
  const pool = new pg.Pool(getDbConfig());
  const client = await pool.connect();

  try {
    // Import services (ESM; file URL for Node)
    const servicesPath = pathToFileURL(join(projectRoot, "src", "data", "improveStoreServices.js")).href;
    const servicesModule = await import(servicesPath);
    const ALL_SERVICES = servicesModule.default || [];

    // Services: insert only if table is empty
    const servicesCount = await client.query("SELECT COUNT(*) AS n FROM services");
    if (Number(servicesCount.rows[0]?.n || 0) === 0 && ALL_SERVICES.length > 0) {
      for (let i = 0; i < ALL_SERVICES.length; i++) {
        const s = ALL_SERVICES[i];
        await client.query(
          `INSERT INTO services (title, category, type, store_stages, description, pain_points, benefits, delivery_days_min, delivery_days_max, rating, users, packages, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [
            s.title ?? "",
            s.category ?? "salesGrowth",
            s.type ?? "SEO",
            JSON.stringify(Array.isArray(s.storeStages) ? s.storeStages : []),
            s.description ?? null,
            JSON.stringify(Array.isArray(s.painPoints) ? s.painPoints : []),
            JSON.stringify(Array.isArray(s.benefits) ? s.benefits : []),
            Number(s.deliveryDaysMin) ?? 5,
            Number(s.deliveryDaysMax) ?? 10,
            Number(s.rating) ?? 4.5,
            Number(s.users) ?? 0,
            JSON.stringify(Array.isArray(s.packages) ? s.packages : []),
            i,
          ]
        );
      }
      console.log("Seeded", ALL_SERVICES.length, "services.");
    } else {
      console.log("Services table already has data or no static services; skipping.");
    }

    // Themes: insert only if table is empty
    const themesCount = await client.query("SELECT COUNT(*) AS n FROM themes");
    const themesForSeed = buildThemesForSeed();
    if (Number(themesCount.rows[0]?.n || 0) === 0 && themesForSeed.length > 0) {
      for (const t of themesForSeed) {
        await client.query(
          `INSERT INTO themes (name, price, features, image, sort_order) VALUES ($1,$2,$3,$4,$5)`,
          [t.name, t.price, JSON.stringify(t.features), t.image, t.sort_order]
        );
      }
      console.log("Seeded", themesForSeed.length, "themes.");
    } else {
      console.log("Themes table already has data; skipping.");
    }
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
