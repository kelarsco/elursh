/**
 * /api/v1/content-pages: full CRUD, pagination, filtering. Public read by slug when published.
 */
import { Router } from "express";
import * as contentPageService from "../../services/contentPageService.js";
import * as api from "../../lib/apiResponse.js";
import { requireJwt, requireRole } from "../../middleware/auth.js";
import { getPool } from "../../lib/db.js";

const router = Router();

function requireDb(req, res, next) {
  if (!getPool()) return api.serverError(res, "Database not configured");
  next();
}

// List (admin/editor only for now; could add public list of published)
router.get("/", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const opts = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      sort: req.query.sort,
      order: req.query.order,
      published: req.query.published === "true" ? true : req.query.published === "false" ? false : undefined,
    };
    const result = await contentPageService.listContentPages(opts);
    api.paginated(res, result.data, result.meta);
  } catch (err) {
    api.serverError(res, "Failed to list content pages", err);
  }
});

// Public get by slug (published only)
router.get("/slug/:slug", requireDb, async (req, res) => {
  try {
    const slug = decodeURIComponent(req.params.slug || "").trim();
    if (!slug) return api.badRequest(res, "slug required");
    const page = await contentPageService.getContentPageBySlug(slug);
    if (!page) return api.notFound(res, "Content page");
    res.json({ data: page });
  } catch (err) {
    api.serverError(res, "Failed to get content page", err);
  }
});

// Get by id (admin/editor)
router.get("/:id", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return api.badRequest(res, "Invalid id");
    const page = await contentPageService.getContentPageById(id);
    if (!page) return api.notFound(res, "Content page");
    res.json({ data: page });
  } catch (err) {
    api.serverError(res, "Failed to get content page", err);
  }
});

router.post("/", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const page = await contentPageService.createContentPage(req.body || {});
    api.created(res, page);
  } catch (err) {
    api.serverError(res, "Failed to create content page", err);
  }
});

router.put("/:id", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return api.badRequest(res, "Invalid id");
    const page = await contentPageService.updateContentPage(id, req.body || {});
    if (!page) return api.notFound(res, "Content page");
    res.json({ data: page });
  } catch (err) {
    api.serverError(res, "Failed to update content page", err);
  }
});

router.delete("/:id", requireJwt, requireRole("admin"), requireDb, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return api.badRequest(res, "Invalid id");
    const deleted = await contentPageService.deleteContentPage(id);
    if (!deleted) return api.notFound(res, "Content page");
    api.noContent(res);
  } catch (err) {
    api.serverError(res, "Failed to delete content page", err);
  }
});

export default router;
