/**
 * Standardized API responses and error handling.
 * All v1 APIs return consistent JSON: { data?, meta?, error?, code? }
 */

export function success(res, data, meta = null, status = 200) {
  const body = meta ? { data, meta } : { data };
  res.status(status).json(body);
}

export function paginated(res, data, meta) {
  res.status(200).json({ data, meta });
}

export function created(res, data) {
  res.status(201).json({ data });
}

export function noContent(res) {
  res.status(204).end();
}

export function error(res, message, code = 400, details = null) {
  const body = { error: message };
  if (details != null) body.details = details;
  if (code) body.code = code;
  res.status(typeof code === "number" ? code : 400).json(body);
}

export function notFound(res, resource = "Resource") {
  error(res, `${resource} not found`, 404);
}

export function unauthorized(res, message = "Authentication required") {
  error(res, message, 401);
}

export function forbidden(res, message = "Insufficient permissions") {
  error(res, message, 403);
}

export function badRequest(res, message = "Bad request", details = null) {
  error(res, message, 400, details);
}

export function serverError(res, message = "Internal server error", err = null) {
  if (err) console.error("API error:", err.message || err);
  error(res, message, 500);
}
