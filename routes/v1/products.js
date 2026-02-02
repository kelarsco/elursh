/**
 * /api/v1/products: full CRUD, pagination, filtering, search.
 */
import { Router } from "express";
import * as productService from "../../services/productService.js";
import * as api from "../../lib/apiResponse.js";
import { requireJwt, requireRole, optionalJwt } from "../../middleware/auth.js";
import { getPool } from "../../lib/db.js";

const router = Router();

function requireDb(req, res, next) {
  if (!getPool()) return api.serverError(res, "Database not configured");
  next();
}

// Public list (published only when unauthenticated; admin/editor see all with ?published=)
router.get("/", requireDb, optionalJwt, async (req, res) => {
  try {
    const opts = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      sort: req.query.sort,
      order: req.query.order,
    };
    if (!req.user) opts.published = true;
    else if (req.query.published !== undefined) opts.published = req.query.published === "true";
    const result = await productService.listProducts(opts);
    api.paginated(res, result.data, result.meta);
  } catch (err) {
    api.serverError(res, "Failed to list products", err);
  }
});

// Public get by id (unpublished only for admin/editor)
router.get("/:id", requireDb, optionalJwt, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return api.badRequest(res, "Invalid id");
    const product = await productService.getProductById(id);
    if (!product) return api.notFound(res, "Product");
    if (!product.published && !req.user) return api.notFound(res, "Product");
    res.json({ data: product });
  } catch (err) {
    api.serverError(res, "Failed to get product", err);
  }
});

// Create (admin/editor)
router.post("/", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const product = await productService.createProduct(req.body || {});
    api.created(res, product);
  } catch (err) {
    api.serverError(res, "Failed to create product", err);
  }
});

// Update (admin/editor)
router.put("/:id", requireJwt, requireRole("admin", "editor"), requireDb, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return api.badRequest(res, "Invalid id");
    const product = await productService.updateProduct(id, req.body || {});
    if (!product) return api.notFound(res, "Product");
    res.json({ data: product });
  } catch (err) {
    api.serverError(res, "Failed to update product", err);
  }
});

// Delete (admin only)
router.delete("/:id", requireJwt, requireRole("admin"), requireDb, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return api.badRequest(res, "Invalid id");
    const deleted = await productService.deleteProduct(id);
    if (!deleted) return api.notFound(res, "Product");
    api.noContent(res);
  } catch (err) {
    api.serverError(res, "Failed to delete product", err);
  }
});

export default router;
