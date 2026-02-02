/**
 * /api/v1/admin: dashboard aggregates and manager-style resources (analysed stores, contacts, orders, payments, store reports, emails).
 * All routes require JWT with admin or editor role.
 */
import { Router } from "express";
import { query } from "../../lib/db.js";
import * as api from "../../lib/apiResponse.js";
import { requireJwt, requireRole } from "../../middleware/auth.js";
import { getPool } from "../../lib/db.js";
import { parsePageLimit, buildPaginatedMeta } from "../../lib/pagination.js";

const router = Router();

function requireDb(req, res, next) {
  if (!getPool()) return api.serverError(res, "Database not configured");
  next();
}

function normStoreUrl(url) {
  if (typeof url !== "string") return "";
  return url.replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase().trim() || "";
}

// GET /api/v1/admin/dashboard — counts for dashboard
router.get("/dashboard", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const [stores, contacts, orders, payments] = await Promise.all([
      query("SELECT COUNT(*) AS c FROM analysed_stores").then((r) => parseInt(r.rows[0]?.c || "0", 10)),
      query("SELECT COUNT(*) AS c FROM contacts").then((r) => parseInt(r.rows[0]?.c || "0", 10)),
      query("SELECT COUNT(*) AS c FROM orders").then((r) => parseInt(r.rows[0]?.c || "0", 10)),
      query("SELECT COUNT(*) AS c FROM payments").then((r) => parseInt(r.rows[0]?.c || "0", 10)),
    ]);
    res.json({
      data: { analysed_stores: stores, contacts, orders, payments },
    });
  } catch (err) {
    api.serverError(res, "Dashboard failed", err);
  }
});

// Analysed stores (paginated)
router.get("/analysed-stores", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const { page, limit, offset } = parsePageLimit(req.query);
    const count = await query("SELECT COUNT(*) AS total FROM analysed_stores");
    const total = parseInt(count.rows[0]?.total || "0", 10);
    const r = await query(
      "SELECT id, store_url, analysed_at, result_json, created_at FROM analysed_stores ORDER BY analysed_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    api.paginated(res, r.rows, buildPaginatedMeta(page, limit, total));
  } catch (err) {
    api.serverError(res, "Failed to list analysed stores", err);
  }
});

// Contacts (paginated)
router.get("/contacts", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const { page, limit, offset } = parsePageLimit(req.query);
    const count = await query("SELECT COUNT(*) AS total FROM contacts");
    const total = parseInt(count.rows[0]?.total || "0", 10);
    const r = await query(
      "SELECT id, email, store_link, message, source, created_at FROM contacts ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    api.paginated(res, r.rows, buildPaginatedMeta(page, limit, total));
  } catch (err) {
    api.serverError(res, "Failed to list contacts", err);
  }
});

// Orders (paginated)
router.get("/orders", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const { page, limit, offset } = parsePageLimit(req.query);
    const count = await query("SELECT COUNT(*) AS total FROM orders");
    const total = parseInt(count.rows[0]?.total || "0", 10);
    const r = await query(
      "SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    api.paginated(res, r.rows, buildPaginatedMeta(page, limit, total));
  } catch (err) {
    api.serverError(res, "Failed to list orders", err);
  }
});

router.patch("/orders/:id", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const status = req.body?.status;
    if (!status || typeof status !== "string") return api.badRequest(res, "status required");
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return api.badRequest(res, "Invalid id");
    const r = await query("UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [status.trim(), id]);
    if (!r.rows[0]) return api.notFound(res, "Order");
    res.json({ data: r.rows[0] });
  } catch (err) {
    api.serverError(res, "Failed to update order", err);
  }
});

// Payments (paginated)
router.get("/payments", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const { page, limit, offset } = parsePageLimit(req.query);
    const count = await query("SELECT COUNT(*) AS total FROM payments");
    const total = parseInt(count.rows[0]?.total || "0", 10);
    const r = await query(
      "SELECT * FROM payments ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    api.paginated(res, r.rows, buildPaginatedMeta(page, limit, total));
  } catch (err) {
    api.serverError(res, "Failed to list payments", err);
  }
});

// Store reports (list, get by storeUrl, upsert)
router.get("/store-reports", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const r = await query("SELECT id, store_url, report_json, created_at, updated_at FROM store_reports ORDER BY updated_at DESC");
    res.json({ data: r.rows });
  } catch (err) {
    api.serverError(res, "Failed to list store reports", err);
  }
});

router.get("/store-reports/:storeUrl", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const url = normStoreUrl(decodeURIComponent(req.params.storeUrl || ""));
    if (!url) return api.badRequest(res, "Invalid store URL");
    const r = await query("SELECT * FROM store_reports WHERE store_url = $1", [url]);
    if (!r.rows[0]) return api.notFound(res, "Store report");
    res.json({ data: r.rows[0] });
  } catch (err) {
    api.serverError(res, "Failed to get store report", err);
  }
});

router.put("/store-reports", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const b = req.body || {};
    const storeUrl = normStoreUrl(b.store_url || b.storeUrl || "");
    if (!storeUrl) return api.badRequest(res, "store_url required");
    const reportJson = typeof b.report_json === "object" ? b.report_json : (b.report_json ? JSON.parse(b.report_json) : {});
    await query(
      `INSERT INTO store_reports (store_url, report_json) VALUES ($1,$2)
       ON CONFLICT (store_url) DO UPDATE SET report_json = $2, updated_at = NOW()`,
      [storeUrl, JSON.stringify(reportJson)]
    );
    const r = await query("SELECT * FROM store_reports WHERE store_url = $1", [storeUrl]);
    res.json({ data: r.rows[0] });
  } catch (err) {
    api.serverError(res, "Failed to upsert store report", err);
  }
});

// Emails sent (paginated)
router.get("/emails-sent", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const { page, limit, offset } = parsePageLimit(req.query);
    const count = await query("SELECT COUNT(*) AS total FROM emails_sent");
    const total = parseInt(count.rows[0]?.total || "0", 10);
    const r = await query(
      "SELECT id, to_email, subject, sent_at, created_at FROM emails_sent ORDER BY sent_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    api.paginated(res, r.rows, buildPaginatedMeta(page, limit, total));
  } catch (err) {
    api.serverError(res, "Failed to list emails sent", err);
  }
});

export default router;
