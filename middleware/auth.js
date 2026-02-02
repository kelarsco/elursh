/**
 * JWT authentication and role-based authorization middleware.
 * Expects Authorization: Bearer <token> or cookie (optional).
 */
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import * as api from "../lib/apiResponse.js";

const secret = config.jwt?.secret;
const issuer = config.jwt?.issuer;

export function requireJwt(req, res, next) {
  if (!secret) {
    return api.serverError(res, "JWT not configured");
  }
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.cookies?.token ?? req.query?.token;
  if (!token) {
    return api.unauthorized(res);
  }
  try {
    const decoded = jwt.verify(token, secret, { issuer });
    req.user = decoded; // { sub, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return api.unauthorized(res, "Token expired");
    }
    return api.unauthorized(res, "Invalid token");
  }
}

/**
 * Require one of the given roles (e.g. ['admin', 'editor']).
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return api.unauthorized(res);
    const role = req.user.role || req.user.rol;
    if (!roles.length || roles.includes(role)) {
      next();
      return;
    }
    api.forbidden(res);
  };
}

/**
 * Optional JWT: attach user if token present, continue either way.
 */
export function optionalJwt(req, res, next) {
  if (!secret) return next();
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.cookies?.token;
  if (!token) return next();
  try {
    req.user = jwt.verify(token, secret, { issuer });
  } catch {
    // ignore invalid/expired
  }
  next();
}
