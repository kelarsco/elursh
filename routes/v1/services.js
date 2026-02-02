/**
 * /api/v1/services: Improve Store marketplace services. Full CRUD for admin/editor; public list/get.
 */
import { Router } from "express";
import * as improveStoreService from "../../services/improveStoreService.js";
import * as api from "../../lib/apiResponse.js";
import { requireJwt, requireRole, optionalJwt } from "../../middleware/auth.js";
import { getPool } from "../../lib/db.js";

const router = Router();

function requireDb(req, res, next) {
  if (!getPool()) return api.serverError(res, "Database not configured");
  next();
}

// List: public (no auth) gets all; query params page, limit, search, category, type, sort, order
router.get("/", requireDb, async (req, res) => {
  try {
    const opts = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      category: req.query.category,
      type: req.query.type,
      sort: req.query.sort,
      order: req.query.order,
    };
    const result = await improveStoreService.listServices(opts);
    api.paginated(res, result.data, result.meta);
  } catch (err) {
    api.serverError(res, "Failed to list services", err);
  }
});

// Get by id (public)
router.get("/:id", requireDb, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return api.badRequest(res, "Invalid id");
    const service = await improveStoreService.getServiceById(id);
    if (!service) return api.notFound(res, "Service");
    res.json({ data: service });
  } catch (err) {
    api.serverError(res, "Failed to get service", err);
  }
});

// Create (admin/editor)
router.post("/", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const service = await improveStoreService.createService(req.body || {});
    api.created(res, service);
  } catch (err) {
    api.serverError(res, "Failed to create service", err);
  }
});

// Update (admin/editor)
router.put("/:id", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return api.badRequest(res, "Invalid id");
    const service = await improveStoreService.updateService(id, req.body || {});
    if (!service) return api.notFound(res, "Service");
    res.json({ data: service });
  } catch (err) {
    api.serverError(res, "Failed to update service", err);
  }
});

// Delete (admin only)
router.delete("/:id", requireJwt, requireRole("admin"), requireDb, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return api.badRequest(res, "Invalid id");
    const deleted = await improveStoreService.deleteService(id);
    if (!deleted) return api.notFound(res, "Service");
    api.noContent(res);
  } catch (err) {
    api.serverError(res, "Failed to delete service", err);
  }
});

export default router;
