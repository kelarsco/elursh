/**
 * /api/v1/auth: login (JWT), me, register (admin-only optional).
 */
import { Router } from "express";
import * as authService from "../../services/authService.js";
import * as api from "../../lib/apiResponse.js";
import { requireJwt, requireRole } from "../../middleware/auth.js";
import { getPool } from "../../lib/db.js";

const router = Router();

function requireDb(req, res, next) {
  if (!getPool()) return api.serverError(res, "Database not configured");
  next();
}

// POST /api/v1/auth/login — email + password → JWT
router.post("/login", requireDb, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return api.badRequest(res, "email and password required");
    }
    const result = await authService.login(email.trim(), password);
    if (!result) {
      return api.unauthorized(res, "Invalid email or password");
    }
    res.status(200).json({
      data: result.user,
      meta: { token: result.token, expiresIn: result.expiresIn },
    });
  } catch (err) {
    api.serverError(res, "Login failed", err);
  }
});

// GET /api/v1/auth/me — current user (requires JWT)
router.get("/me", requireJwt, (req, res) => {
  res.json({ data: req.user });
});

// POST /api/v1/auth/register — create user (admin only; optional)
router.post("/register", requireJwt, requireRole("admin"), requireDb, async (req, res) => {
  try {
    const { email, password, role, display_name } = req.body || {};
    if (!email || !password) {
      return api.badRequest(res, "email and password required");
    }
    const user = await authService.createUser({
      email,
      password,
      role: role === "admin" ? "admin" : "editor",
      display_name,
    });
    api.created(res, user);
  } catch (err) {
    if (err.code === "23505") return api.badRequest(res, "Email already registered");
    api.serverError(res, "Registration failed", err);
  }
});

export default router;
