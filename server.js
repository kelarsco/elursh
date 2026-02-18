/**
 * Local dev server for /api routes (Paystack + theme purchase email + manager dashboard).
 * Run: node server.js (or npm run dev:api). After changing this file, restart the API (Ctrl+C then npm run dev) so the new code runs.
 * Set PAYSTACK_SECRET_KEY in .env. For confirmation emails set SMTP vars (see .env.example).
 * Manager: DATABASE_URL, SESSION_SECRET, MANAGER_TOTP_SECRET (authenticator app login).
 *
 * Backend ↔ Website UI sync:
 * - Store Audit: GET /api/store-audit-result (manager-set report); POST /api/analysed-stores (save audit).
 * - Contacts: POST /api/contacts (website form → DB).
 * - Services: manager CRUD /api/manager/services; website GET /api/services (Improve Store).
 * - Themes: manager CRUD /api/manager/themes; website GET /api/themes (Theme page).
 * - Orders: website POST /api/orders (Improve Store); manager GET/PATCH /api/manager/orders.
 * - Payments: Paystack verify inserts into payments; manager GET /api/manager/payments.
 * - Store reports: manager PUT /api/manager/store-reports; website GET /api/store-audit-result.
 * Vite proxies /api to this server when using npm run dev.
 */
import "dotenv/config";
import crypto from "crypto";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import nodemailer from "nodemailer";
import speakeasy from "speakeasy";
import jwt from "jsonwebtoken";
import { getPool, query } from "./lib/db.js";
import { config } from "./config/index.js";
import v1Router from "./routes/v1/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = config.api.port;
const MANAGER_ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
const USD_TO_NGN_CACHE_MS = 60 * 60 * 1000; // 1 hour
let usdToNgnCache = { rate: null, at: 0 };

async function getUsdToNgnRate() {
  const envRate = process.env.PAYSTACK_USD_TO_NGN_RATE;
  if (envRate != null && envRate !== "") {
    const n = Number(envRate);
    if (Number.isFinite(n) && n > 0) return n;
  }
  if (usdToNgnCache.rate != null && Date.now() - usdToNgnCache.at < USD_TO_NGN_CACHE_MS) {
    return usdToNgnCache.rate;
  }
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    const ngn = data?.conversion_rates?.NGN;
    if (typeof ngn === "number" && ngn > 0) {
      usdToNgnCache = { rate: ngn, at: Date.now() };
      return ngn;
    }
  } catch (err) {
    console.warn("USD→NGN rate fetch failed:", err.message);
  }
  const fallback = 1600;
  if (usdToNgnCache.rate == null) usdToNgnCache = { rate: fallback, at: Date.now() };
  return usdToNgnCache.rate;
}

/** Convert USD amount to Paystack amount in kobo (NGN * 100). */
async function usdToPaystackKobo(amountUsd) {
  const rate = await getUsdToNgnRate();
  const amountNgn = Number(amountUsd) * rate;
  return Math.round(amountNgn * 100);
}

function normStoreUrl(url) {
  if (typeof url !== "string") return "";
  return url.replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase().trim() || "";
}

/** Log DB errors briefly; hint if it's password auth failure. */
function logDbErr(label, e) {
  const msg = e?.message || String(e);
  console.error(`${label}:`, msg);
  if (e?.code === "28P01") {
    console.error("  → Fix: set correct Postgres password in .env (see docs/DATABASE.md)");
  }
}

// Default themes for auto-seed when themes table is empty (same as scripts/seed-services-and-themes.js)
const DEFAULT_THEME_NAMES = [
  "Zeal", "Force", "Zenith", "Focal", "Broadcast", "Ignite", "Shapes", "Xclusive", "Enterprise", "Sleek",
  "Release", "Pipeline", "Concept", "Xtra", "Impulse", "Prestige", "Symmetry", "Wonder", "Local", "Motion",
  "Craft", "Frost", "Blaze", "Stride", "Grove", "Clarity", "Aura", "Ember", "Haven", "Forge",
  "Catalyst", "Prism", "Vertex", "Pulse", "Drift", "Flux", "Nova", "Vogue", "Minimal", "Bold", "Horizon",
];
const DEFAULT_THEME_FEATURES = [
  "Premium Design", "Mobile Optimized", "Speed Focused", "SEO Ready", "Lookbook Layouts", "Quick View",
  "Mega Menu", "Product Filters", "Sticky Header", "Color Swatches", "Countdown Timer", "Infinite Scroll",
  "Quick Order List", "EU Translations", "Right-to-Left", "Stock Counter", "Age Verifier", "Breadcrumbs",
  "Back-to-top", "Before/After Slider",
];
const DEFAULT_THEME_PRICES = [80, 89, 99, 100, 109, 119, 129, 139, 149, 159, 169, 179, 189, 199, 209, 219, 229, 239, 249, 259, 269, 279, 289, 299, 300];

function pickDefaultFeatures(themeId, n = 4) {
  const pool = [...DEFAULT_THEME_FEATURES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = (themeId + i) % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

async function seedThemesIfEmpty() {
  const pool = getPool();
  if (!pool) return;
  try {
    const r = await query("SELECT COUNT(*) AS n FROM themes");
    const n = parseInt(r.rows[0]?.n || "0", 10);
    if (n > 0) return;
    for (let i = 0; i < DEFAULT_THEME_NAMES.length; i++) {
      const name = DEFAULT_THEME_NAMES[i];
      const price = DEFAULT_THEME_PRICES[i % DEFAULT_THEME_PRICES.length];
      const features = pickDefaultFeatures(i + 1, 4);
      const image = `https://picsum.photos/seed/theme-${i + 1}/400/300`;
      await query(
        "INSERT INTO themes (name, price, features, image, sort_order) VALUES ($1,$2,$3,$4,$5)",
        [name, price, JSON.stringify(features), image, i]
      );
    }
    console.log("Auto-seeded", DEFAULT_THEME_NAMES.length, "themes (themes table was empty).");
  } catch (e) {
    logDbErr("seed themes", e);
  }
}

/** Auto-seed services from static data when services table is empty (Improve Store + manager Data). */
async function seedServicesIfEmpty() {
  const pool = getPool();
  if (!pool) return;
  try {
    const r = await query("SELECT COUNT(*) AS n FROM services");
    const n = parseInt(r.rows[0]?.n || "0", 10);
    if (n > 0) return;
    const servicesPath = pathToFileURL(path.join(__dirname, "src", "data", "improveStoreServices.js")).href;
    const servicesModule = await import(servicesPath);
    const ALL_SERVICES = servicesModule.default || [];
    if (ALL_SERVICES.length === 0) return;
    for (let i = 0; i < ALL_SERVICES.length; i++) {
      const s = ALL_SERVICES[i];
      await query(
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
    console.log("Auto-seeded", ALL_SERVICES.length, "services (services table was empty).");
  } catch (e) {
    logDbErr("seed services", e);
  }
}

/** Lazy seed: run once when services table is empty so first request can trigger seed. */
let servicesSeedPromise = null;
async function ensureServicesSeeded() {
  const pool = getPool();
  if (!pool) return;
  try {
    const r = await query("SELECT COUNT(*) AS n FROM services");
    if (parseInt(r.rows[0]?.n || "0", 10) > 0) return;
    if (!servicesSeedPromise) servicesSeedPromise = seedServicesIfEmpty();
    await servicesSeedPromise;
  } catch {
    // ignore
  }
}

/** Lazy seed: run once when themes table is empty so first request can trigger seed. */
let themesSeedPromise = null;
async function ensureThemesSeeded() {
  const pool = getPool();
  if (!pool) return;
  try {
    const r = await query("SELECT COUNT(*) AS n FROM themes");
    if (parseInt(r.rows[0]?.n || "0", 10) > 0) return;
    if (!themesSeedPromise) themesSeedPromise = seedThemesIfEmpty();
    await themesSeedPromise;
  } catch {
    // ignore
  }
}

// Required behind Railway/reverse proxy so req.secure is true and Secure cookies are set
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  })
);
app.use(express.json());

// Versioned REST API (JWT-based)
app.use("/api/v1", v1Router);

const sessionSecret = process.env.SESSION_SECRET || "elursh-manager-secret-change-in-production";
const isProduction = process.env.NODE_ENV === "production";
// When frontend proxies /api through Vercel (same-origin), use Lax. When direct cross-origin, use None.
const useProxy = !!process.env.COOKIE_DOMAIN;
const cookieSameSite = useProxy ? "lax" : (isProduction && config.cors.origin && config.cors.origin !== true ? "none" : "lax");
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: cookieSameSite,
      ...(cookieDomain && { domain: cookieDomain }),
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.API_BASE_URL || "http://localhost:3001"}/api/manager/auth/google/callback`,
      },
      (_accessToken, _refreshToken, profile, done) => {
        const email = profile?.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error("No email from Google"));
        if (MANAGER_ADMIN_EMAILS.length && !MANAGER_ADMIN_EMAILS.includes(email)) {
          return done(new Error("Not authorized to access manager"));
        }
        return done(null, { id: profile.id, email, name: profile?.displayName });
      }
    )
  );
  // Customer Google OAuth (anyone can sign up)
  const customerCallback =
    process.env.CUSTOMER_GOOGLE_CALLBACK_URL ||
    `${process.env.API_BASE_URL || "http://localhost:3001"}/api/auth/google/callback`;
  passport.use(
    "google-customer",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: customerCallback,
      },
      (_accessToken, _refreshToken, profile, done) => {
        const email = profile?.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error("No email from Google"));
        return done(null, {
          googleId: profile.id,
          email,
          name: profile?.displayName || profile?.name?.givenName,
          avatarUrl: profile?.photos?.[0]?.value,
        });
      }
    )
  );
}

function requireManager(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Login required" });
  }
  next();
}

function getEmailTransporter() {
  const service = (process.env.EMAIL_SERVICE || process.env.SMTP_HOST || "").toLowerCase();
  const host = process.env.SMTP_HOST || (service === "gmail" ? "smtp.gmail.com" : "");
  const isGmail = service === "gmail" || (host && host.toLowerCase().includes("gmail"));
  const port = process.env.SMTP_PORT || process.env.EMAIL_PORT || (isGmail ? "587" : "587");
  const user = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.SENDER_EMAIL || "";
  const pass = process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || "";
  if (!host || !user || !pass) return null;
  const portNum = port ? Number(port) : 587;
  return nodemailer.createTransport({
    host,
    port: portNum,
    secure: portNum === 465,
    requireTLS: portNum === 587,
    auth: { user, pass },
  });
}

function getEmailFrom() {
  const from =
    process.env.EMAIL_FROM ||
    process.env.SENDER_EMAIL ||
    process.env.SMTP_FROM ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USER ||
    "";
  const name = process.env.EMAIL_FROM_NAME || "Elursh";
  if (!from) return null;
  return name ? `"${name}" <${from}>` : from;
}

// In-memory store for order verification codes: email (lowercase) -> { code, expiresAt }
const verificationCodes = new Map();
const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function generateFourDigitCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function sendVerificationCodeEmail(email, code) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || !resendKey.trim()) {
    throw new Error("Verification emails require Resend. Set RESEND_API_KEY and RESEND_FROM on Railway.");
  }
  const from = process.env.RESEND_FROM || "onboarding@resend.dev";
  const html = `<p>Your verification code is: <strong>${code}</strong></p><p>It expires in 5 minutes. Enter it on the order form to verify and place your order.</p><p>If you didn't request this, you can ignore this email.</p><p>— Elursh</p>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: from.includes("<") ? from : `Elursh <${from}>`,
      to: [email],
      subject: "Your verification code – Elursh",
      html,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `Resend failed: ${res.status}`);
}

async function sendThemeConfirmationEmail({ email, themeName, storeLink }) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    console.warn("Theme confirmation: Email not configured. Set EMAIL_USER + EMAIL_APP_PASSWORD (or SMTP_*) in .env.");
    return;
  }
  const from = getEmailFrom() || process.env.EMAIL_USER || process.env.SMTP_USER;
  await transporter.sendMail({
    from: from || process.env.EMAIL_USER || process.env.SMTP_USER,
    to: email,
    subject: `Your ${themeName} theme – we're setting it up shortly`,
    text: `Thank you for your purchase.\n\nWe've received your payment for the ${themeName} theme. We'll set up the theme for your store (${storeLink}) shortly. You'll receive another email once the setup is complete.\n\nIf you have any questions, reply to this email.\n\nBest regards,\nThe Team`,
    html: `
      <p>Thank you for your purchase.</p>
      <p>We've received your payment for the <strong>${themeName}</strong> theme. We'll set up the theme for your store (<a href="${storeLink}">${storeLink}</a>) shortly. You'll receive another email once the setup is complete.</p>
      <p>If you have any questions, reply to this email.</p>
      <p>Best regards,<br>The Team</p>
    `,
  });
}

/** Base URL for the frontend (analyze-store, improve-store). Used in Fix-It Manual email links. */
function getSiteBaseUrl() {
  return (process.env.FRONTEND_ORIGIN || process.env.SITE_URL || "https://elursh.com").replace(/\/$/, "");
}

/** After Fix-It Manual purchase: email customer with download link and message about purchasing a fix service. */
async function sendFixItManualEmail(email, storeUrl) {
  if (!email || !storeUrl) return;
  const baseUrl = getSiteBaseUrl();
  const downloadUrl = `${baseUrl}/analyze-store?url=${encodeURIComponent(storeUrl)}`;
  const improveStoreUrl = `${baseUrl}/improve-store`;
  const subject = "Your Fix-It Manual is ready – Elursh";
  const text = `Thank you for purchasing the Fix-It Manual.\n\nDownload your PDF here: ${downloadUrl}\n\nOn that page, click "Download Manual (PDF)" to get your file.\n\nWant us to fix these issues for you? You can purchase a service that fixes the issues on our website: ${improveStoreUrl}\n\n— Elursh`;
  const html = `
    <p>Thank you for purchasing the Fix-It Manual.</p>
    <p><a href="${downloadUrl}" style="display:inline-block;background:#2d6c5f;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;">Download Fix-It Manual (PDF)</a></p>
    <p>Click the button above to open the page, then click "Download Manual (PDF)" to save your file.</p>
    <p>Want us to fix these issues for you? You can <a href="${improveStoreUrl}">purchase a service that fixes the issues on our website</a>: <a href="${improveStoreUrl}">${improveStoreUrl}</a></p>
    <p>— Elursh</p>
  `;
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const from = process.env.RESEND_FROM || process.env.SMTP_FROM || "onboarding@resend.dev";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: from.includes("<") ? from : `Elursh <${from}>`,
        to: [email],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `Resend failed: ${res.status}`);
    }
    return;
  }
  const transporter = getEmailTransporter();
  if (!transporter) {
    console.warn("Fix-It Manual email: Email not configured. Set EMAIL_USER + EMAIL_APP_PASSWORD (or RESEND_API_KEY) in .env.");
    return;
  }
  const from = getEmailFrom() || process.env.EMAIL_USER || process.env.SMTP_USER;
  await transporter.sendMail({
    from: from || process.env.EMAIL_USER || process.env.SMTP_USER,
    to: email,
    subject,
    text,
    html,
  });
}

// Paystack Initialize – accepts amountUsd (converted to NGN kobo at current rate) or amountKobo; metadata for theme email
app.post("/api/paystack-initialize", async (req, res) => {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return res.status(500).json({ error: "Paystack secret key not configured. Add PAYSTACK_SECRET_KEY to your .env file." });
    }
    const body = req.body || {};
    const email = (body.email != null && typeof body.email === "string") ? body.email.trim() : "";
    const amountUsdRaw = body.amountUsd ?? body.amount_usd;
    const amountKoboRaw = body.amountKobo ?? body.amount_kobo;
    const callbackUrl = body.callbackUrl ?? body.callback_url;
    const metadata = body.metadata;

    if (!email) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    const amountUsdNum = Number(amountUsdRaw);
    const amountKoboNum = amountKoboRaw != null ? Number(amountKoboRaw) : null;

    let amountKoboFinal;
    if (amountUsdNum > 0) {
      amountKoboFinal = await usdToPaystackKobo(amountUsdNum);
      if (amountKoboFinal < 100) {
        return res.status(400).json({ error: "Amount too small after conversion" });
      }
    } else if (amountKoboNum != null && amountKoboNum >= 100) {
      amountKoboFinal = amountKoboNum;
    } else {
      return res.status(400).json({ error: "Invalid amount. Please try again or restart the API server (npm run dev)." });
    }
    const payload = {
      email,
      amount: amountKoboFinal,
      callback_url: callbackUrl || undefined,
    };
    if (metadata && typeof metadata === "object") {
      payload.metadata = metadata;
    }
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return res.status(500).json({ error: "Invalid response from Paystack. Check your secret key and try again." });
    }
    if (!data.status || !data.data?.authorization_url) {
      const msg = data.message || "Paystack initialization failed";
      return res.status(400).json({ error: msg });
    }
    res.status(200).json({ authorization_url: data.data.authorization_url });
  } catch (err) {
    console.error("Paystack init error:", err);
    const message = err.message || "Failed to create payment link";
    res.status(500).json({ error: message });
  }
});

// Paystack Verify – on success, send theme confirmation email (email + store link) then return
app.get("/api/paystack-verify", async (req, res) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ success: false, error: "Paystack secret key not configured" });
  }
  const reference = req.query.reference;
  if (!reference || typeof reference !== "string") {
    return res.status(400).json({ success: false, error: "Missing reference" });
  }
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference.trim())}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${secretKey}` },
      }
    );
    const data = await response.json();
    if (!data.status || !data.data) {
      return res.status(200).json({ success: false, error: data.message || "Verification failed" });
    }
    const { status, amount, reference: ref, metadata } = data.data;
    if (status !== "success") {
      return res.status(200).json({ success: false, error: "Transaction not successful", status });
    }
    const email = data.data?.customer?.email || metadata?.email || "";
    const pool = getPool();
    if (pool) {
      try {
        const amountUsd = metadata?.amount_usd != null ? Number(metadata.amount_usd) : null;
        await pool.query(
          "INSERT INTO payments (reference, email, amount_kobo, amount_usd, metadata_json, status) VALUES ($1,$2,$3,$4,$5,$6)",
          [ref, email || null, amount || null, amountUsd, metadata ? JSON.stringify(metadata) : null, status]
        );
      } catch (e) {
        console.warn("Payments insert failed:", e.message);
      }
    }
    if (metadata?.product === "fix_it_manual" && metadata?.store_url && email) {
      sendFixItManualEmail(email, metadata.store_url).catch((e) => console.warn("Fix-It Manual email failed:", e.message));
    }
    res.status(200).json({ success: true, status, amount, reference: ref });
  } catch (err) {
    console.error("Paystack verify error:", err);
    res.status(500).json({ success: false, error: "Verification failed" });
  }
});

// ——— Public: store audit result (manager-set report per store) ———
app.get("/api/store-audit-result", async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(404).end();
  const raw = req.query.storeUrl ?? req.query.store_url ?? "";
  const storeUrl = normStoreUrl(raw);
  if (!storeUrl) return res.status(400).json({ error: "storeUrl required" });
  try {
    const r = await pool.query("SELECT report_json FROM store_reports WHERE store_url = $1", [storeUrl]);
    if (!r.rows[0]) return res.status(404).json({ error: "No custom report" });
    res.json(r.rows[0].report_json);
  } catch (e) {
    logDbErr("store-audit-result", e);
    res.status(500).json({ error: e.message });
  }
});

// ——— Public: check if Fix-It Manual was already purchased for this store (so they can download after 48h) ———
app.get("/api/manual-purchase-status", async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(200).json({ purchased: false });
  const raw = req.query.storeUrl ?? req.query.store_url ?? "";
  const storeUrl = normStoreUrl(raw);
  if (!storeUrl) return res.status(400).json({ error: "storeUrl required" });
  try {
    const r = await pool.query(
      "SELECT 1 FROM payments WHERE status = 'success' AND metadata_json->>'store_url' = $1 LIMIT 1",
      [storeUrl]
    );
    return res.status(200).json({ purchased: r.rows.length > 0 });
  } catch (e) {
    logDbErr("manual-purchase-status", e);
    return res.status(200).json({ purchased: false });
  }
});

// ——— Public: save analysed store (after running audit) ———
// Manual upsert only (SELECT then UPDATE or INSERT). No ON CONFLICT — works without UNIQUE on store_url.
// Restart API server after changing this so the running process uses the new code.
app.post("/api/analysed-stores", async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not available" });
  const body = req.body || {};
  const storeUrl = normStoreUrl(body.store_url ?? body.storeUrl ?? "");
  const resultJson = body.result_json ?? body.result ?? {};
  if (!storeUrl) return res.status(400).json({ error: "store_url required" });
  let resultStr = resultJson;
  if (typeof resultJson === "object") {
    try {
      resultStr = JSON.stringify(resultJson);
    } catch (stringifyErr) {
      logDbErr("analysed-stores stringify", stringifyErr);
      resultStr = JSON.stringify({ storeInfo: { url: storeUrl }, _serializationNote: "partial" });
    }
  }
  try {
    const sel = await pool.query("SELECT id FROM analysed_stores WHERE store_url = $1 LIMIT 1", [storeUrl]);
    if (sel.rows && sel.rows.length > 0) {
      await pool.query(
        "UPDATE analysed_stores SET analysed_at = NOW(), result_json = $2 WHERE store_url = $1",
        [storeUrl, resultStr]
      );
    } else {
      await pool.query(
        "INSERT INTO analysed_stores (store_url, result_json) VALUES ($1, $2)",
        [storeUrl, resultStr]
      );
    }
    res.status(201).json({ ok: true });
  } catch (e) {
    logDbErr("analysed-stores save", e);
    res.status(500).json({ error: e.message });
  }
});

// ——— Public: contact form submission ———
app.post("/api/contacts", async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not available" });
  const body = req.body || {};
  const email = (body.email ?? "").trim();
  const name = (body.name ?? "").trim() || null;
  const storeLink = (body.store_link ?? body.storeLink ?? "").trim() || null;
  const primaryGoal = (body.primary_goal ?? "").trim() || null;
  const budget = (body.budget ?? "").trim() || null;
  const message = (body.message ?? "").trim() || null;
  const source = (body.source ?? "contact").trim() || null;
  if (!email) return res.status(400).json({ error: "email required" });
  try {
    await pool.query(
      "INSERT INTO contacts (email, name, store_link, primary_goal, budget, message, source) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [email, name, storeLink, primaryGoal, budget, message, source]
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    logDbErr("contacts save", e);
    res.status(500).json({ error: e.message });
  }
});

// ——— Public: onboarding (get-started flow) ———
// Handler functions (mounted at both /api/onboarding and /onboarding for proxy compatibility)
async function onboardingCreateSession(req, res) {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not available" });
  try {
    const r = await pool.query(
      "INSERT INTO onboarding_sessions DEFAULT VALUES RETURNING id",
      []
    );
    const id = r?.rows?.[0]?.id;
    if (!id) return res.status(500).json({ error: "Failed to create session" });
    res.status(201).json({ sessionId: id });
  } catch (e) {
    logDbErr("onboarding session create", e);
    res.status(500).json({ error: e.message });
  }
}
async function onboardingGetSession(req, res) {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not available" });
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "Session ID required" });
  try {
    const r = await pool.query(
      "SELECT id, platform, store_url, store_connected, first_choice, created_at FROM onboarding_sessions WHERE id = $1",
      [id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: "Session not found" });
    res.json(r.rows[0]);
  } catch (e) {
    logDbErr("onboarding session get", e);
    res.status(500).json({ error: e.message });
  }
}
async function onboardingPatchSession(req, res) {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not available" });
  const id = req.params.id;
  const body = req.body || {};
  if (!id) return res.status(400).json({ error: "Session ID required" });
  const updates = [];
  const values = [];
  let i = 1;
  if (body.platform != null) { updates.push(`platform = $${i++}`); values.push(String(body.platform)); }
  if (body.store_url != null) { updates.push(`store_url = $${i++}`); values.push(String(body.store_url)); }
  if (body.store_connected != null) { updates.push(`store_connected = $${i++}`); values.push(!!body.store_connected); }
  if (body.first_choice != null) { updates.push(`first_choice = $${i++}`); values.push(String(body.first_choice)); }
  if (updates.length === 0) return res.status(400).json({ error: "No fields to update" });
  updates.push("updated_at = NOW()");
  values.push(id);
  try {
    const r = await pool.query(
      `UPDATE onboarding_sessions SET ${updates.join(", ")} WHERE id = $${i} RETURNING id, platform, store_url, store_connected, first_choice`,
      values
    );
    if (!r.rows[0]) return res.status(404).json({ error: "Session not found" });
    res.json(r.rows[0]);
  } catch (e) {
    logDbErr("onboarding session patch", e);
    res.status(500).json({ error: e.message });
  }
}

app.post("/api/onboarding/session", onboardingCreateSession);
app.get("/api/onboarding/session/:id", onboardingGetSession);
app.patch("/api/onboarding/session/:id", onboardingPatchSession);
// Fallback: some proxies (e.g. Vercel→Railway) may strip /api; mount same handlers at /onboarding
app.post("/onboarding/session", onboardingCreateSession);
app.get("/onboarding/session/:id", onboardingGetSession);
app.patch("/onboarding/session/:id", onboardingPatchSession);

// ——— Shopify OAuth (Connect Store) ———
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || "";
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || "";
const SHOPIFY_SCOPES = "read_orders,read_products,read_customers,read_analytics";

function normalizeShop(input) {
  if (!input || typeof input !== "string") return "";
  let s = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (s && !s.endsWith(".myshopify.com")) s = s.replace(/\.myshopify\.com.*$/i, "") + ".myshopify.com";
  return s || "";
}

app.post("/api/shopify/install", requireCustomerAuth, (req, res) => {
  const shop = normalizeShop(req.body?.shop || req.query?.shop);
  if (!shop) return res.status(400).json({ error: "shop required (e.g. store.myshopify.com)" });
  if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
    return res.status(503).json({ error: "Shopify app not configured. Set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET." });
  }
  const apiBase = process.env.API_BASE_URL || `http://localhost:${PORT}`;
  const redirectUri = `${apiBase.replace(/\/$/, "")}/api/shopify/callback`;
  const state = Buffer.from(JSON.stringify({ userId: req.customer.id, sessionId: req.body?.sessionId || null })).toString("base64url");
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=${encodeURIComponent(SHOPIFY_SCOPES)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  res.json({ installUrl });
});

app.get("/api/shopify/callback", async (req, res) => {
  const { code, shop: rawShop, state, hmac } = req.query;
  const shop = normalizeShop(rawShop);
  const frontendBase = process.env.FRONTEND_ORIGIN || process.env.SITE_URL || "http://localhost:8080";
  const dash = `${frontendBase}/dashboard`;

  if (!shop || !code) return res.redirect(`${dash}?shopify=error&msg=missing_params`);
  if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) return res.redirect(`${dash}?shopify=error&msg=not_configured`);

  // Verify HMAC
  const params = new URLSearchParams(req.query);
  params.delete("hmac");
  params.delete("signature");
  const sorted = params.toString().split("&").sort().join("&");
  const genHmac = crypto.createHmac("sha256", SHOPIFY_CLIENT_SECRET).update(sorted).digest("hex");
  if (hmac !== genHmac) return res.redirect(`${dash}?shopify=error&msg=invalid_hmac`);

  let userId, sessionId;
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString());
    userId = parsed?.userId;
    sessionId = parsed?.sessionId;
  } catch {
    return res.redirect(`${dash}?shopify=error&msg=invalid_state`);
  }
  if (!userId) return res.redirect(`${dash}?shopify=error&msg=invalid_state`);

  try {
    const apiBase = process.env.API_BASE_URL || `http://localhost:${PORT}`;
    const redirectUri = `${apiBase.replace(/\/$/, "")}/api/shopify/callback`;
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: SHOPIFY_CLIENT_ID, client_secret: SHOPIFY_CLIENT_SECRET, code, redirect_uri: redirectUri }),
    });
    const tokenData = await tokenRes.json().catch(() => ({}));
    const accessToken = tokenData.access_token;
    if (!accessToken) return res.redirect(`${dash}?shopify=error&msg=no_token`);

    const pool = getPool();
    if (!pool) return res.redirect(`${dash}?shopify=error&msg=db_unavailable`);

    await pool.query(
      `INSERT INTO shopify_stores (customer_user_id, shop, access_token, scope, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (shop, customer_user_id) DO UPDATE SET access_token = $3, scope = $4, updated_at = NOW()`,
      [userId, shop, accessToken, tokenData.scope || SHOPIFY_SCOPES]
    );

    // Link onboarding session if passed in state
    if (sessionId) {
      await pool.query(
        "UPDATE onboarding_sessions SET store_url = $1, store_connected = true, updated_at = NOW() WHERE id = $2",
        [shop, sessionId]
      ).catch(() => {});
    }

    res.redirect(`${dash}?shopify=connected&shop=${encodeURIComponent(shop)}`);
  } catch (e) {
    logDbErr("shopify callback", e);
    res.redirect(`${dash}?shopify=error&msg=${encodeURIComponent(e.message || "Unknown error")}`);
  }
});

app.get("/api/shopify/stores", requireCustomerAuth, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not available" });
  try {
    const r = await pool.query("SELECT id, shop, created_at FROM shopify_stores WHERE customer_user_id = $1 ORDER BY created_at DESC", [req.customer.id]);
    res.json(r.rows || []);
  } catch (e) {
    logDbErr("shopify stores", e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/shopify/dashboard", requireCustomerAuth, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not available" });
  const shop = normalizeShop(req.query.shop);
  if (!shop) return res.status(400).json({ error: "shop parameter required" });

  try {
    const r = await pool.query("SELECT access_token FROM shopify_stores WHERE customer_user_id = $1 AND shop = $2", [req.customer.id, shop]);
    const row = r.rows[0];
    if (!row) return res.status(404).json({ error: "Store not connected" });

    const token = row.access_token;
    const since = req.query.since || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const gql = `query { orders(first: 50, query: "created_at:>=${since}") { edges { node { id totalPriceSet { shopMoney { amount } } createdAt } } } }`;
    const gqlRes = await fetch(`https://${shop}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query: gql }),
    });
    const gqlData = await gqlRes.json();
    const orders = gqlData?.data?.orders?.edges?.map((e) => e.node) || [];

    let totalRevenue = 0;
    const byDay = {};
    orders.forEach((o) => {
      const amt = parseFloat(o?.totalPriceSet?.shopMoney?.amount || 0);
      totalRevenue += amt;
      const day = (o.createdAt || "").slice(0, 10);
      if (day) byDay[day] = (byDay[day] || 0) + amt;
    });

    const days = ["S", "M", "T", "W", "T", "F", "S"];
    const trend = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      trend.push({ day: days[d.getDay()], value: byDay[key] || 0 });
    }

    res.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      ordersCount: orders.length,
      trend,
      conversionRate: null,
    });
  } catch (e) {
    logDbErr("shopify dashboard", e);
    res.status(500).json({ error: e.message });
  }
});

// ——— Helpers: price modifier (from settings table; default -30 = 30% off) ———
async function getPriceModifierPercent(pool) {
  if (!pool) return -30;
  try {
    const r = await pool.query("SELECT value FROM settings WHERE key = 'price_modifier_percent'");
    const val = r?.rows?.[0]?.value;
    const n = Number(val);
    return Number.isFinite(n) ? n : -30;
  } catch {
    return -30;
  }
}
function applyPriceModifierToPackages(packages, modifierPercent) {
  if (!Array.isArray(packages)) return packages;
  const factor = 1 + modifierPercent / 100;
  return packages.map((p) => {
    const price = Number(p.price);
    if (!Number.isFinite(price)) return p;
    const newPrice = Math.round(price * factor);
    return { ...p, price: newPrice };
  });
}

// ——— Public: list services (Improve Store; DB-backed; lazy-seed when empty) ———
app.get("/api/services", async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(200).json([]);
  try {
    await ensureServicesSeeded();
    const modifier = await getPriceModifierPercent(pool);
    const r = await pool.query("SELECT * FROM services ORDER BY sort_order ASC, id ASC");
    const rows = (r.rows || []).map((row) => {
      const packages = Array.isArray(row.packages) ? row.packages : (typeof row.packages === "string" ? (() => { try { return JSON.parse(row.packages); } catch { return []; } })() : []);
      return { ...row, packages: applyPriceModifierToPackages(packages, modifier) };
    });
    res.status(200).json(rows);
  } catch (e) {
    logDbErr("services list public", e);
    res.status(500).json({ error: e.message });
  }
});

// ——— Public: list themes (Theme page; DB-backed; includes admin-added themes) ———
function parseFeatures(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const a = JSON.parse(val);
      return Array.isArray(a) ? a : [];
    } catch {
      return [];
    }
  }
  return [];
}

app.get("/api/themes", async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(200).json([]);
  try {
    await ensureThemesSeeded();
    const r = await pool.query("SELECT id, name, price, features, image, sort_order FROM themes ORDER BY sort_order ASC, id ASC");
    const rows = (r.rows || []).map((row) => ({
      id: row.id,
      name: row.name || "",
      price: Number(row.price) || 0,
      priceLabel: `$${Number(row.price) || 0}`,
      features: parseFeatures(row.features),
      image: row.image || null,
    }));
    res.status(200).json(rows);
  } catch (e) {
    logDbErr("themes list public", e);
    res.status(500).json({ error: e.message });
  }
});

// ——— Public: send verification code (Improve Store order flow) ———
app.post("/api/send-verification-code", async (req, res) => {
  const body = req.body || {};
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "email required" });
  try {
    const code = generateFourDigitCode();
    const expiresAt = Date.now() + CODE_EXPIRY_MS;
    verificationCodes.set(email, { code, expiresAt });
    await sendVerificationCodeEmail(email, code);
    res.status(200).json({ ok: true, expiresIn: Math.floor(CODE_EXPIRY_MS / 1000) });
  } catch (e) {
    console.error("send-verification-code:", e.message);
    const msg = e.message || "Failed to send verification code";
    if (msg.includes("SMTP not configured")) return res.status(503).json({ error: "Email is not configured. Please contact support." });
    res.status(500).json({ error: msg });
  }
});

// ——— Public: place order (Improve Store) ———
app.post("/api/orders", async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not available" });
  const body = req.body || {};
  const email = (body.email ?? "").trim();
  const emailLower = email.toLowerCase();
  const verificationCode = (body.verification_code ?? body.verificationCode ?? "").trim();
  const storeLink = (body.store_link ?? body.storeLink ?? "").trim() || null;
  const collaboratorCode = (body.collaborator_code ?? "").trim() || null;
  const serviceId = body.service_id != null ? Number(body.service_id) : null;
  const serviceTitle = (body.service_title ?? "").trim() || null;
  const packageName = (body.package_name ?? "").trim() || null;
  const packagePriceUsd = body.package_price_usd != null ? Number(body.package_price_usd) : null;
  if (!email) return res.status(400).json({ error: "email required" });
  if (!verificationCode || verificationCode.length !== 4) return res.status(400).json({ error: "Enter the 4-digit code from your email." });
  const stored = verificationCodes.get(emailLower);
  if (!stored) return res.status(400).json({ error: "No code was sent to this email, or it expired. Request a new code." });
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(emailLower);
    return res.status(400).json({ error: "Code expired. Request a new code." });
  }
  if (stored.code !== verificationCode) return res.status(400).json({ error: "Invalid code. Check the code from your email and try again." });
  verificationCodes.delete(emailLower);
  let finalServiceId = serviceId;
  if (serviceId != null && Number.isFinite(serviceId)) {
    try {
      const check = await pool.query("SELECT id FROM services WHERE id = $1", [serviceId]);
      if (!check.rows?.length) finalServiceId = null;
    } catch {
      finalServiceId = null;
    }
  }
  try {
    const r = await pool.query(
      `INSERT INTO orders (email, store_link, collaborator_code, service_id, service_title, package_name, package_price_usd, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING id`,
      [email, storeLink, collaboratorCode, finalServiceId, serviceTitle, packageName, packagePriceUsd]
    );
    res.status(201).json({ ok: true, id: r.rows[0]?.id });
  } catch (e) {
    logDbErr("orders save", e);
    res.status(500).json({ error: e.message });
  }
});

// ——— Customer auth (Get Started flow) ———
const authOtpCodes = new Map(); // email -> { code, expiresAt }
const AUTH_OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 min

function signCustomerToken(payload) {
  const secret = config.jwt?.secret;
  if (!secret) throw new Error("JWT secret not configured");
  return jwt.sign(
    { sub: String(payload.sub), email: payload.email, type: "customer" },
    secret,
    { expiresIn: config.jwt?.expiresIn || "7d", issuer: config.jwt?.issuer || "elursh-api" }
  );
}

async function ensureCustomerUsersTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customer_users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      google_id TEXT UNIQUE,
      name TEXT,
      avatar_url TEXT,
      email_verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_customer_users_email ON customer_users(email)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_customer_users_google_id ON customer_users(google_id)`);
}

app.post("/api/auth/send-otp", async (req, res) => {
  const email = (req.body?.email ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Valid email required" });
  }
  try {
    const code = generateFourDigitCode();
    const expiresAt = Date.now() + AUTH_OTP_EXPIRY_MS;
    authOtpCodes.set(email, { code, expiresAt });
    const html = `<p>Your Elursh verification code is: <strong>${code}</strong></p><p>It expires in 10 minutes. Enter it to sign in or create your account.</p><p>If you didn't request this, you can ignore this email.</p><p>— Elursh</p>`;
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey?.trim()) return res.status(503).json({ error: "Email not configured" });
    const from = process.env.RESEND_FROM || "onboarding@resend.dev";
    const apiRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: from.includes("<") ? from : `Elursh <${from}>`,
        to: [email],
        subject: "Your sign-in code – Elursh",
        html,
      }),
    });
    const data = await apiRes.json().catch(() => ({}));
    if (!apiRes.ok) throw new Error(data.message || data.error || "Resend failed");
    res.status(200).json({ ok: true, expiresIn: Math.floor(AUTH_OTP_EXPIRY_MS / 1000) });
  } catch (e) {
    console.error("auth send-otp:", e.message);
    res.status(500).json({ error: e.message || "Failed to send code" });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  const email = (req.body?.email ?? "").trim().toLowerCase();
  const code = (req.body?.code ?? "").toString().trim();
  if (!email || !code) return res.status(400).json({ error: "Email and code required" });
  const stored = authOtpCodes.get(email);
  if (!stored) return res.status(400).json({ error: "Code expired or invalid. Request a new one." });
  if (Date.now() > stored.expiresAt) {
    authOtpCodes.delete(email);
    return res.status(400).json({ error: "Code expired. Request a new one." });
  }
  if (stored.code !== code) return res.status(400).json({ error: "Invalid code" });
  authOtpCodes.delete(email);
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not available" });
  try {
    await ensureCustomerUsersTable(pool);
    let r = await pool.query("SELECT id, email, name FROM customer_users WHERE email = $1", [email]);
    let user = r.rows[0];
    if (!user) {
      r = await pool.query(
        `INSERT INTO customer_users (email, email_verified_at) VALUES ($1, NOW()) RETURNING id, email, name`,
        [email]
      );
      user = r.rows[0];
    } else {
      await pool.query("UPDATE customer_users SET email_verified_at = COALESCE(email_verified_at, NOW()), updated_at = NOW() WHERE id = $1", [user.id]);
    }
    const token = signCustomerToken({ sub: user.id, email: user.email });
    res.status(200).json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (e) {
    logDbErr("auth verify-otp", e);
    res.status(500).json({ error: e.message || "Verification failed" });
  }
});

app.get("/api/auth/google", (req, res, next) => {
  if (!getPool()) return res.status(503).json({ error: "Database not configured" });
  passport.authenticate("google-customer", { scope: ["profile", "email"] })(req, res, next);
});

app.get("/api/auth/google/callback", async (req, res, next) => {
  passport.authenticate("google-customer", { session: false }, async (err, profile) => {
    const frontendBase = process.env.FRONTEND_ORIGIN || process.env.SITE_URL || "http://localhost:8080";
    const authCallback = `${frontendBase}/auth/callback`;
    if (err) return res.redirect(`${authCallback}?error=${encodeURIComponent(err.message || "Login failed")}`);
    if (!profile) return res.redirect(`${authCallback}?error=login_failed`);
    const pool = getPool();
    if (!pool) return res.redirect(`${authCallback}?error=Database+not+available`);
    try {
      await ensureCustomerUsersTable(pool);
      let r = await pool.query("SELECT id, email, name FROM customer_users WHERE google_id = $1 OR email = $2", [profile.googleId, profile.email]);
      let user = r.rows[0];
      if (!user) {
        r = await pool.query(
          `INSERT INTO customer_users (email, google_id, name, avatar_url, email_verified_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING id, email, name`,
          [profile.email, profile.googleId, profile.name || null, profile.avatarUrl || null]
        );
        user = r.rows[0];
      } else {
        await pool.query(
          "UPDATE customer_users SET google_id = COALESCE(google_id, $1), name = COALESCE(name, $2), avatar_url = COALESCE(avatar_url, $3), updated_at = NOW() WHERE id = $4",
          [profile.googleId, profile.name, profile.avatarUrl, user.id]
        );
      }
      const token = signCustomerToken({ sub: user.id, email: user.email });
      res.redirect(`${authCallback}#token=${encodeURIComponent(token)}`);
    } catch (e) {
      logDbErr("auth google callback", e);
      res.redirect(`${authCallback}?error=${encodeURIComponent(e.message || "Login failed")}`);
    }
  })(req, res, next);
});

function requireCustomerAuth(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Login required" });
  try {
    const secret = config.jwt?.secret;
    if (!secret) return res.status(500).json({ error: "Auth not configured" });
    const decoded = jwt.verify(token, secret, { issuer: config.jwt?.issuer });
    if (decoded.type !== "customer") return res.status(401).json({ error: "Invalid token" });
    req.customer = { id: decoded.sub, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/api/auth/me", requireCustomerAuth, async (req, res) => {
  const pool = getPool();
  if (!pool) return res.status(503).json({ error: "Database not available" });
  try {
    const r = await pool.query("SELECT id, email, name, avatar_url, email_verified_at FROM customer_users WHERE id = $1", [req.customer.id]);
    if (!r.rows[0]) return res.status(404).json({ error: "User not found" });
    res.json(r.rows[0]);
  } catch (e) {
    logDbErr("auth me", e);
    res.status(500).json({ error: e.message });
  }
});

// ——— Manager auth ———
app.get("/api/manager/auth/google", (req, res, next) => {
  if (!getPool()) {
    return res.status(503).json({ error: "Database not configured" });
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});
app.get("/api/manager/auth/google/callback", (req, res, next) => {
  const base = process.env.MANAGER_REDIRECT_AFTER_LOGIN || "/manager";
  passport.authenticate("google", { session: true }, (err, user) => {
    if (err) return res.redirect(`${base}?error=${encodeURIComponent(err.message || "Login failed")}`);
    if (!user) return res.redirect(`${base}?error=login_failed`);
    req.logIn(user, (e) => {
      if (e) return next(e);
      res.redirect(base);
    });
  })(req, res, next);
});
app.get("/api/manager/auth/me", (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Not logged in" });
  }
  res.json(req.user);
});
app.post("/api/manager/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

// ——— Manager auth: TOTP (authenticator app code) ———
app.post("/api/manager/auth/totp", (req, res, next) => {
  const secret = process.env.MANAGER_TOTP_SECRET;
  if (!secret || typeof secret !== "string" || !secret.trim()) {
    return res.status(503).json({ error: "TOTP not configured. Set MANAGER_TOTP_SECRET in .env." });
  }
  const code = (req.body?.code ?? "").toString().replace(/\s/g, "").trim();
  if (!code || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: "Enter the 6-digit code from your authenticator app." });
  }
  let verified = false;
  try {
    verified = speakeasy.totp.verify({
      secret: secret.trim(),
      encoding: "base32",
      token: code,
      window: 1,
    });
  } catch (e) {
    console.warn("TOTP verify error:", e.message);
    return res.status(500).json({ error: "Invalid code or misconfigured secret." });
  }
  if (!verified) {
    return res.status(401).json({ error: "Invalid or expired code. Try again." });
  }
  const email = (req.body?.email ?? "").toString().trim() || "manager";
  const name = (req.body?.name ?? "").toString().trim() || "Manager";
  const user = { id: "manager", email, name };
  req.logIn(user, (err) => {
    if (err) return next(err);
    res.json({ ok: true, user });
  });
});

// ——— Manager API (require login; DB required) ———
function requireDb(req, res, next) {
  if (!getPool()) return res.status(503).json({ error: "Database not configured" });
  next();
}

// Analysed stores (array of rows for list and dashboard count)
app.get("/api/manager/analysed-stores", requireManager, requireDb, async (req, res) => {
  try {
    const r = await query("SELECT id, store_url, analysed_at, result_json, created_at FROM analysed_stores ORDER BY analysed_at DESC");
    const rows = Array.isArray(r?.rows) ? r.rows : [];
    res.json(rows);
  } catch (e) {
    logDbErr("analysed-stores", e);
    res.status(500).json({ error: e.message });
  }
});

// Deleting a store removes it from analysed_stores and store_reports so re-auditing runs a fresh audit.
app.delete("/api/manager/analysed-stores", requireManager, requireDb, async (req, res) => {
  try {
    // Accept ids from query (reliable) or body (some proxies strip DELETE body)
    let idList = [];
    const queryIds = req.query.ids;
    if (typeof queryIds === "string" && queryIds.trim()) {
      idList = queryIds.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
    } else if (Array.isArray(req.body?.ids)) {
      idList = req.body.ids.map((id) => parseInt(id, 10)).filter((n) => !Number.isNaN(n));
    } else if (req.body?.id != null) {
      const n = parseInt(req.body.id, 10);
      if (!Number.isNaN(n)) idList = [n];
    }
    if (idList.length === 0) return res.status(400).json({ error: "ids required (query: ?ids=1,2,3 or body: { ids: [1,2,3] })" });
    // Get store_urls before deleting so we can clear store_reports (custom report) for those URLs
    const rows = await query("SELECT store_url FROM analysed_stores WHERE id = ANY($1::int[])", [idList]);
    const storeUrls = (rows.rows || []).map((r) => r.store_url).filter(Boolean);
    await query("DELETE FROM analysed_stores WHERE id = ANY($1::int[])", [idList]);
    if (storeUrls.length > 0) {
      await query("DELETE FROM store_reports WHERE store_url = ANY($1::text[])", [storeUrls]);
    }
    res.json({ ok: true, deleted: idList.length });
  } catch (e) {
    logDbErr("analysed-stores delete", e);
    res.status(500).json({ error: e.message });
  }
});

// Themes CRUD (registered before services/:id so /api/manager/themes is not matched as services/:id)
app.get("/api/manager/themes", requireManager, requireDb, async (req, res) => {
  try {
    await ensureThemesSeeded();
    const r = await query("SELECT * FROM themes ORDER BY sort_order ASC, id ASC");
    res.json(r.rows);
  } catch (e) {
    logDbErr("themes list", e);
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/manager/themes", requireManager, requireDb, async (req, res) => {
  try {
    const b = req.body || {};
    const r = await query(
      `INSERT INTO themes (name, price, features, image, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [
        b.name ?? "",
        Number(b.price) ?? 99,
        JSON.stringify(Array.isArray(b.features) ? b.features : []),
        b.image ?? null,
        Number(b.sort_order) ?? 0,
      ]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    console.error("themes create", e);
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/manager/themes/:id", requireManager, requireDb, async (req, res) => {
  try {
    const r = await query("SELECT * FROM themes WHERE id = $1", [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e) {
    logDbErr("themes get", e);
    res.status(500).json({ error: e.message });
  }
});
app.put("/api/manager/themes/:id", requireManager, requireDb, async (req, res) => {
  try {
    const b = req.body || {};
    await query(
      `UPDATE themes SET name=$1, price=$2, features=$3, image=$4, sort_order=$5, updated_at=NOW() WHERE id=$6`,
      [
        b.name ?? "",
        Number(b.price) ?? 99,
        JSON.stringify(Array.isArray(b.features) ? b.features : []),
        b.image ?? null,
        Number(b.sort_order) ?? 0,
        req.params.id,
      ]
    );
    const r = await query("SELECT * FROM themes WHERE id = $1", [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e) {
    logDbErr("themes update", e);
    res.status(500).json({ error: e.message });
  }
});
app.delete("/api/manager/themes/:id", requireManager, requireDb, async (req, res) => {
  try {
    const r = await query("DELETE FROM themes WHERE id = $1 RETURNING id", [req.params.id]);
    if (!r.rowCount) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: true, id: req.params.id });
  } catch (e) {
    logDbErr("themes delete", e);
    res.status(500).json({ error: e.message });
  }
});

// ——— Manager: settings (price modifier for services) ———
app.get("/api/manager/settings/price-modifier", requireManager, requireDb, async (req, res) => {
  try {
    const mod = await getPriceModifierPercent(getPool());
    res.json({ priceModifierPercent: mod });
  } catch (e) {
    logDbErr("settings price-modifier get", e);
    res.status(500).json({ error: e.message });
  }
});
app.put("/api/manager/settings/price-modifier", requireManager, requireDb, async (req, res) => {
  try {
    const percent = Number(req.body?.priceModifierPercent ?? req.body?.percent);
    if (!Number.isFinite(percent)) return res.status(400).json({ error: "Invalid percent" });
    const pool = getPool();
    await pool.query(
      `INSERT INTO settings (key, value, updated_at) VALUES ('price_modifier_percent', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
      [String(Math.round(percent))]
    );
    res.json({ priceModifierPercent: Math.round(percent) });
  } catch (e) {
    if (e?.code === "42P01") return res.status(503).json({ error: "Run migrations: node scripts/run-migrations.js" });
    logDbErr("settings price-modifier put", e);
    res.status(500).json({ error: e.message });
  }
});

// Services CRUD (lazy-seed when table empty so Data page shows services)
app.get("/api/manager/services", requireManager, requireDb, async (req, res) => {
  try {
    await ensureServicesSeeded();
    const r = await query("SELECT * FROM services ORDER BY sort_order ASC, id ASC");
    res.json(r.rows);
  } catch (e) {
    logDbErr("services list", e);
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/manager/services", requireManager, requireDb, async (req, res) => {
  try {
    const b = req.body || {};
    const r = await query(
      `INSERT INTO services (title, category, type, store_stages, description, pain_points, benefits, delivery_days_min, delivery_days_max, rating, users, packages, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        b.title ?? "",
        b.category ?? "salesGrowth",
        b.type ?? "SEO",
        JSON.stringify(b.store_stages || []),
        b.description ?? null,
        JSON.stringify(b.pain_points || []),
        JSON.stringify(b.benefits || []),
        Number(b.delivery_days_min) || 5,
        Number(b.delivery_days_max) || 10,
        Number(b.rating) || 4.5,
        Number(b.users) || 0,
        JSON.stringify(b.packages || []),
        Number(b.sort_order) || 0,
      ]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    console.error("services create", e);
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/manager/services/:id", requireManager, requireDb, async (req, res) => {
  try {
    const r = await query("SELECT * FROM services WHERE id = $1", [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e) {
    logDbErr("services get", e);
    res.status(500).json({ error: e.message });
  }
});
app.put("/api/manager/services/:id", requireManager, requireDb, async (req, res) => {
  try {
    const b = req.body || {};
    await query(
      `UPDATE services SET title=$1, category=$2, type=$3, store_stages=$4, description=$5, pain_points=$6, benefits=$7,
       delivery_days_min=$8, delivery_days_max=$9, rating=$10, users=$11, packages=$12, sort_order=$13, updated_at=NOW()
       WHERE id=$14`,
      [
        b.title ?? "",
        b.category ?? "salesGrowth",
        b.type ?? "SEO",
        JSON.stringify(b.store_stages || []),
        b.description ?? null,
        JSON.stringify(b.pain_points || []),
        JSON.stringify(b.benefits || []),
        Number(b.delivery_days_min) ?? 5,
        Number(b.delivery_days_max) ?? 10,
        Number(b.rating) ?? 4.5,
        Number(b.users) ?? 0,
        JSON.stringify(b.packages || []),
        Number(b.sort_order) ?? 0,
        req.params.id,
      ]
    );
    const r = await query("SELECT * FROM services WHERE id = $1", [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e) {
    logDbErr("services update", e);
    res.status(500).json({ error: e.message });
  }
});
app.delete("/api/manager/services/:id", requireManager, requireDb, async (req, res) => {
  try {
    const r = await query("DELETE FROM services WHERE id = $1 RETURNING id", [req.params.id]);
    if (!r.rowCount) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: true, id: req.params.id });
  } catch (e) {
    logDbErr("services delete", e);
    res.status(500).json({ error: e.message });
  }
});

// Store reports (by store_url)
app.get("/api/manager/store-reports", requireManager, requireDb, async (req, res) => {
  try {
    const r = await query("SELECT id, store_url, report_json, created_at, updated_at FROM store_reports ORDER BY updated_at DESC");
    res.json(r.rows);
  } catch (e) {
    logDbErr("store-reports list", e);
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/manager/store-reports/:storeUrl", requireManager, requireDb, async (req, res) => {
  try {
    const url = normStoreUrl(decodeURIComponent(req.params.storeUrl));
    if (!url) return res.status(400).json({ error: "Invalid store URL" });
    const r = await query("SELECT * FROM store_reports WHERE store_url = $1", [url]);
    if (!r.rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e) {
    logDbErr("store-reports get", e);
    res.status(500).json({ error: e.message });
  }
});
app.put("/api/manager/store-reports", requireManager, requireDb, async (req, res) => {
  try {
    const b = req.body || {};
    const storeUrl = normStoreUrl(b.store_url || b.storeUrl || "");
    if (!storeUrl) return res.status(400).json({ error: "store_url required" });
    const reportJson = typeof b.report_json === "object" ? b.report_json : (b.report_json ? JSON.parse(b.report_json) : {});
    await query(
      `INSERT INTO store_reports (store_url, report_json) VALUES ($1,$2)
       ON CONFLICT (store_url) DO UPDATE SET report_json = $2, updated_at = NOW()`,
      [storeUrl, JSON.stringify(reportJson)]
    );
    const r = await query("SELECT * FROM store_reports WHERE store_url = $1", [storeUrl]);
    res.json(r.rows[0]);
  } catch (e) {
    logDbErr("store-reports upsert", e);
    res.status(500).json({ error: e.message });
  }
});

// Orders
app.get("/api/manager/orders", requireManager, requireDb, async (req, res) => {
  try {
    const r = await query("SELECT * FROM orders ORDER BY created_at DESC");
    res.json(r.rows);
  } catch (e) {
    logDbErr("orders", e);
    res.status(500).json({ error: e.message });
  }
});
app.patch("/api/manager/orders/:id", requireManager, requireDb, async (req, res) => {
  try {
    const status = req.body?.status;
    if (!status || typeof status !== "string") return res.status(400).json({ error: "status required" });
    const r = await query("UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [status.trim(), req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e) {
    logDbErr("orders patch", e);
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/manager/orders", requireManager, requireDb, async (req, res) => {
  try {
    let ids = [];
    if (req.query.ids && typeof req.query.ids === "string") {
      ids = req.query.ids.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
    }
    if (ids.length === 0 && Array.isArray(req.body?.ids)) ids = req.body.ids.map((id) => parseInt(id, 10)).filter((n) => !Number.isNaN(n));
    if (ids.length === 0) return res.status(400).json({ error: "ids required" });
    const r = await query("DELETE FROM orders WHERE id = ANY($1::int[]) RETURNING id", [ids]);
    res.json({ ok: true, deleted: r.rowCount });
  } catch (e) {
    logDbErr("orders delete", e);
    res.status(500).json({ error: e.message });
  }
});

// Payments (ensure amount_usd is populated: use stored value or derive from amount_kobo via exchange rate)
app.get("/api/manager/payments", requireManager, requireDb, async (req, res) => {
  try {
    const r = await query("SELECT * FROM payments ORDER BY created_at DESC");
    const rate = await getUsdToNgnRate();
    const rows = (r.rows || []).map((row) => {
      let amountUsd = row.amount_usd != null ? Number(row.amount_usd) : null;
      if (amountUsd == null && row.amount_kobo != null && rate > 0) {
        const ngn = Number(row.amount_kobo) / 100;
        amountUsd = Math.round((ngn / rate) * 100) / 100;
      }
      return { ...row, amount_usd: amountUsd };
    });
    res.json(rows);
  } catch (e) {
    logDbErr("payments", e);
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/manager/payments/:id/fulfillment", requireManager, requireDb, async (req, res) => {
  try {
    const fulfillmentStatus = req.body?.fulfillment_status ?? req.body?.status;
    if (!fulfillmentStatus || typeof fulfillmentStatus !== "string") return res.status(400).json({ error: "fulfillment_status required" });
    const allowed = ["pending", "in_progress", "completed", "cancelled", "deleted"];
    if (!allowed.includes(fulfillmentStatus.trim())) return res.status(400).json({ error: `fulfillment_status must be one of: ${allowed.join(", ")}` });
    const r = await query(
      "UPDATE payments SET fulfillment_status = $1 WHERE id = $2 RETURNING id, fulfillment_status",
      [fulfillmentStatus.trim(), req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e) {
    logDbErr("payments fulfillment", e);
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/manager/payments/:id", requireManager, requireDb, async (req, res) => {
  try {
    const r = await query("DELETE FROM payments WHERE id = $1 RETURNING id", [req.params.id]);
    if (!r.rowCount) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true, deleted: true, id: req.params.id });
  } catch (e) {
    logDbErr("payments delete", e);
    res.status(500).json({ error: e.message });
  }
});

// Other purchases: Fix-It Manual + Theme (for Orders "Others" tab)
app.get("/api/manager/other-purchases", requireManager, requireDb, async (req, res) => {
  try {
    const r = await query(
      `SELECT id, email, created_at, metadata_json, fulfillment_status
       FROM payments
       WHERE status = 'success'
         AND (fulfillment_status IS NULL OR fulfillment_status != 'deleted')
         AND (
           metadata_json->>'product' = 'fix_it_manual'
           OR metadata_json->>'themeName' IS NOT NULL
           OR metadata_json->>'themeId' IS NOT NULL
         )
       ORDER BY created_at DESC`
    );
    const rows = (r.rows || []).map((row) => {
      const meta = typeof row.metadata_json === "string" ? JSON.parse(row.metadata_json || "{}") : (row.metadata_json || {});
      const isFixIt = meta.product === "fix_it_manual";
      const storeUrl = isFixIt
        ? (meta.store_url || "")
        : (meta.storeLink || meta.store_link || "");
      const productType = isFixIt ? "fix_it_manual" : "theme";
      const productLabel = isFixIt ? "Fix-It Manual" : `Theme: ${meta.themeName || "Theme"}`;
      return {
        id: row.id,
        email: row.email || "",
        store_url: storeUrl,
        created_at: row.created_at,
        product_type: productType,
        product_label: productLabel,
        fulfillment_status: row.fulfillment_status || "pending",
      };
    });
    res.json(rows);
  } catch (e) {
    logDbErr("other-purchases", e);
    res.status(500).json({ error: e.message });
  }
});

// Legacy: Fix-It Manual purchasers only (kept for backward compatibility; prefer other-purchases)
app.get("/api/manager/fix-it-purchases", requireManager, requireDb, async (req, res) => {
  try {
    const r = await query(
      `SELECT id, email, created_at, metadata_json
       FROM payments
       WHERE status = 'success' AND metadata_json->>'product' = 'fix_it_manual'
       ORDER BY created_at DESC`
    );
    const rows = (r.rows || []).map((row) => {
      const meta = typeof row.metadata_json === "string" ? JSON.parse(row.metadata_json || "{}") : (row.metadata_json || {});
      return {
        id: row.id,
        email: row.email || "",
        store_url: meta.store_url || "",
        created_at: row.created_at,
      };
    });
    res.json(rows);
  } catch (e) {
    logDbErr("fix-it-purchases", e);
    res.status(500).json({ error: e.message });
  }
});

// Resend Fix-It Manual email (link to download PDF) to purchaser
app.post("/api/manager/send-fix-it-pdf", requireManager, requireDb, async (req, res) => {
  try {
    const b = req.body || {};
    const email = (b.email ?? "").toString().trim();
    const storeUrl = normStoreUrl(b.storeUrl ?? b.store_url ?? "");
    if (!email || !storeUrl) return res.status(400).json({ error: "email and storeUrl required" });
    await sendFixItManualEmail(email, storeUrl);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error("send-fix-it-pdf:", e.message);
    res.status(500).json({ error: e.message || "Failed to send email" });
  }
});

// Send email (manager) — uses Resend only
app.post("/api/manager/send-email", requireManager, requireDb, async (req, res) => {
  try {
    const b = req.body || {};
    const to = (b.to_email || b.to || b.email || "").trim();
    const subject = (b.subject || "").trim();
    const bodyText = b.body_text || b.text || "";
    const bodyHtml = b.body_html || b.html || "";
    if (!to) return res.status(400).json({ error: "to_email required" });
    if (!bodyText && !bodyHtml) return res.status(400).json({ error: "Message body (body_text or body_html) required" });
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey || !resendKey.trim()) {
      return res.status(503).json({ error: "Email not configured. Set RESEND_API_KEY and RESEND_FROM on Railway." });
    }
    const from = process.env.RESEND_FROM || "onboarding@resend.dev";
    const resRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: from.includes("<") ? from : `Elursh <${from}>`,
        to: [to],
        subject: subject || "(No subject)",
        text: bodyText || undefined,
        html: bodyHtml || (bodyText || "").replace(/\n/g, "<br>") || "<p>No content</p>",
      }),
    });
    const data = await resRes.json().catch(() => ({}));
    if (!resRes.ok) throw new Error(data.message || data.error || `Resend failed: ${resRes.status}`);
    await query(
      "INSERT INTO emails_sent (to_email, subject, body_text, body_html) VALUES ($1,$2,$3,$4)",
      [to, subject || null, bodyText || null, bodyHtml || null]
    );
    res.json({ sent: true, to });
  } catch (e) {
    logDbErr("send-email", e);
    res.status(500).json({ error: e.message });
  }
});

// Emails sent log
app.get("/api/manager/emails-sent", requireManager, requireDb, async (req, res) => {
  try {
    const r = await query("SELECT id, to_email, subject, sent_at, created_at FROM emails_sent ORDER BY sent_at DESC");
    res.json(r.rows);
  } catch (e) {
    logDbErr("emails-sent", e);
    res.status(500).json({ error: e.message });
  }
});

async function handleDeleteEmailsSent(req, res) {
  try {
    let ids = [];
    if (req.query.ids && typeof req.query.ids === "string") {
      ids = req.query.ids.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
    }
    if (ids.length === 0 && Array.isArray(req.body?.ids)) {
      ids = req.body.ids.map((id) => parseInt(id, 10)).filter((n) => !Number.isNaN(n));
    }
    if (ids.length === 0) return res.status(400).json({ error: "ids required" });
    const r = await query("DELETE FROM emails_sent WHERE id = ANY($1::int[]) RETURNING id", [ids]);
    res.json({ ok: true, deleted: r.rowCount });
  } catch (e) {
    logDbErr("emails-sent delete", e);
    res.status(500).json({ error: e.message });
  }
}
app.delete("/api/manager/emails-sent", requireManager, requireDb, handleDeleteEmailsSent);
app.post("/api/manager/emails-sent/delete", requireManager, requireDb, handleDeleteEmailsSent);

// Contacts (messages from contact form)
app.get("/api/manager/contacts", requireManager, requireDb, async (req, res) => {
  try {
    const r = await query("SELECT id, email, name, store_link, primary_goal, budget, message, source, status, created_at, updated_at FROM contacts ORDER BY created_at DESC");
    res.json(r.rows);
  } catch (e) {
    logDbErr("contacts", e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/manager/onboarding-sessions", requireManager, requireDb, async (req, res) => {
  try {
    const r = await query(
      "SELECT id, platform, store_url, store_connected, first_choice, created_at, updated_at FROM onboarding_sessions ORDER BY created_at DESC"
    );
    res.json(r.rows || []);
  } catch (e) {
    logDbErr("onboarding-sessions", e);
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/manager/contacts/:id", requireManager, requireDb, async (req, res) => {
  try {
    const status = req.body?.status;
    if (!status || typeof status !== "string") return res.status(400).json({ error: "status required" });
    const r = await query("UPDATE contacts SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [status.trim(), req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e) {
    logDbErr("contacts patch", e);
    res.status(500).json({ error: e.message });
  }
});

// 404 for unhandled /api paths (helps debug wrong URLs)
app.use("/api", (req, res, next) => {
  if (res.headersSent) return next();
  console.warn(`API 404: ${req.method} ${req.path}`);
  res.status(404).json({ error: "Not found", path: req.path });
});

// Global API error handler (v1 and legacy routes)
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error("Unhandled API error:", err.message || err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  const hasKey = !!process.env.PAYSTACK_SECRET_KEY;
  console.log(`API server running at http://localhost:${PORT} (proxy /api from Vite)`);
  console.log(`  v1 API: /api/v1/auth, /api/v1/admin, /api/v1/products, /api/v1/content-pages, /api/v1/services`);
  if (!hasKey) console.warn("Warning: PAYSTACK_SECRET_KEY is not set. Add it to .env for Paystack to work.");
  setImmediate(() => {
    seedThemesIfEmpty();
    seedServicesIfEmpty();
  });
});
