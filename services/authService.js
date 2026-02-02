/**
 * Auth service: user lookup, password verification, JWT issuance.
 * Uses bcryptjs for password hashing (no native build).
 */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../lib/db.js";
import { config } from "../config/index.js";

const SALT_ROUNDS = 12;
const secret = config.jwt?.secret;
const expiresIn = config.jwt?.expiresIn || "24h";
const issuer = config.jwt?.issuer || "elursh-api";

export async function findUserByEmail(email) {
  if (!email || typeof email !== "string") return null;
  const normalized = email.trim().toLowerCase();
  const r = await query(
    "SELECT id, email, password_hash, role, display_name, created_at, updated_at FROM users WHERE email = $1",
    [normalized]
  );
  return r.rows[0] || null;
}

export async function verifyPassword(plain, hash) {
  if (!plain || !hash) return false;
  return bcrypt.compare(plain, hash);
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function signToken(payload) {
  if (!secret) throw new Error("JWT secret not configured");
  return jwt.sign(
    {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    },
    secret,
    { expiresIn, issuer }
  );
}

export async function login(email, password) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return null;
  const token = signToken({
    sub: String(user.id),
    email: user.email,
    role: user.role,
  });
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      display_name: user.display_name,
    },
    token,
    expiresIn,
  };
}

export async function createUser({ email, password, role = "editor", display_name }) {
  const normalized = email.trim().toLowerCase();
  const hash = await hashPassword(password);
  const r = await query(
    `INSERT INTO users (email, password_hash, role, display_name) VALUES ($1,$2,$3,$4)
     RETURNING id, email, role, display_name, created_at, updated_at`,
    [normalized, hash, role === "admin" ? "admin" : "editor", display_name || null]
  );
  return r.rows[0];
}
