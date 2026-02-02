/**
 * /api/v1 router: mounts versioned REST APIs.
 */
import { Router } from "express";
import { healthCheck } from "../../lib/db.js";
import auth from "./auth.js";
import admin from "./admin.js";
import products from "./products.js";
import contentPages from "./contentPages.js";
import services from "./services.js";

const router = Router();

// Health (deployment readiness)
router.get("/health", async (_req, res) => {
  const db = await healthCheck();
  res.status(db.ok ? 200 : 503).json({ ok: db.ok, db: db.ok ? "connected" : db.error });
});

router.use("/auth", auth);
router.use("/admin", admin);
router.use("/products", products);
router.use("/content-pages", contentPages);
router.use("/services", services);

export default router;
