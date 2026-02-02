/**
 * Pagination and filtering helpers for v1 list endpoints.
 * Query params: page (1-based), limit (default 20, max 100), sort, order, search, filter fields.
 */

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePageLimit(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  let limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;
  limit = Math.min(MAX_LIMIT, Math.max(1, limit));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function buildPaginatedMeta(page, limit, total) {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Build ORDER BY clause from query.sort and query.order.
 * sort: column name (allowlisted), order: 'asc' | 'desc'
 */
export function parseSort(query = {}, allowlist = [], defaultSort = "created_at", defaultOrder = "desc") {
  const sort = (query.sort && allowlist.includes(query.sort)) ? query.sort : defaultSort;
  const order = (query.order === "asc" || query.order === "desc") ? query.order : defaultOrder;
  return { sort, order };
}

/**
 * Escape LIKE pattern for safe use in ILIKE.
 */
export function escapeLike(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[%_\\]/g, "\\$&");
}
