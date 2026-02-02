/**
 * Improve Store services (marketplace services): CRUD, pagination, filtering for /api/v1/services.
 * Maps to existing `services` table.
 */
import { query } from "../lib/db.js";
import { parsePageLimit, buildPaginatedMeta, parseSort, escapeLike } from "../lib/pagination.js";

const SORT_ALLOWLIST = ["id", "title", "category", "type", "sort_order", "created_at", "updated_at", "rating"];

export async function listServices(opts = {}) {
  const { page, limit, offset } = parsePageLimit(opts);
  const { sort, order } = parseSort(opts, SORT_ALLOWLIST, "sort_order", "asc");
  const search = typeof opts.search === "string" ? opts.search.trim() : "";
  const category = typeof opts.category === "string" ? opts.category.trim() : "";
  const type = typeof opts.type === "string" ? opts.type.trim() : "";

  let where = [];
  let params = [];
  let idx = 1;

  if (search) {
    const pattern = `%${escapeLike(search)}%`;
    where.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
    params.push(pattern);
    idx++;
  }
  if (category) {
    where.push(`category = $${idx}`);
    params.push(category);
    idx++;
  }
  if (type) {
    where.push(`type = $${idx}`);
    params.push(type);
    idx++;
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderCol = sort === "sort_order" ? "sort_order" : sort;
  const orderDir = order.toUpperCase();

  const countResult = await query(
    `SELECT COUNT(*) AS total FROM services ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0]?.total || "0", 10);

  params.push(limit, offset);
  const r = await query(
    `SELECT id, title, category, type, store_stages, description, pain_points, benefits,
     delivery_days_min, delivery_days_max, rating, users, packages, sort_order, created_at, updated_at
     FROM services ${whereClause}
     ORDER BY ${orderCol} ${orderDir} NULLS LAST, id ASC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    params
  );

  return {
    data: r.rows,
    meta: buildPaginatedMeta(page, limit, total),
  };
}

export async function getServiceById(id) {
  const r = await query("SELECT * FROM services WHERE id = $1", [id]);
  return r.rows[0] || null;
}

export async function createService(data) {
  const r = await query(
    `INSERT INTO services (title, category, type, store_stages, description, pain_points, benefits,
     delivery_days_min, delivery_days_max, rating, users, packages, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      data.title ?? "",
      data.category ?? "salesGrowth",
      data.type ?? "SEO",
      JSON.stringify(data.store_stages || []),
      data.description ?? null,
      JSON.stringify(data.pain_points || []),
      JSON.stringify(data.benefits || []),
      Number(data.delivery_days_min) || 5,
      Number(data.delivery_days_max) || 10,
      Number(data.rating) ?? 4.5,
      Number(data.users) || 0,
      JSON.stringify(data.packages || []),
      Number(data.sort_order) || 0,
    ]
  );
  return r.rows[0];
}

export async function updateService(id, data) {
  const r = await query(
    `UPDATE services SET title=COALESCE($1,title), category=COALESCE($2,category), type=COALESCE($3,type),
     store_stages=COALESCE($4,store_stages), description=COALESCE($5,description),
     pain_points=COALESCE($6,pain_points), benefits=COALESCE($7,benefits),
     delivery_days_min=COALESCE($8,delivery_days_min), delivery_days_max=COALESCE($9,delivery_days_max),
     rating=COALESCE($10,rating), users=COALESCE($11,users), packages=COALESCE($12,packages),
     sort_order=COALESCE($13,sort_order), updated_at=NOW()
     WHERE id=$14 RETURNING *`,
    [
      data.title ?? null,
      data.category ?? null,
      data.type ?? null,
      data.store_stages != null ? JSON.stringify(data.store_stages) : null,
      data.description !== undefined ? data.description : null,
      data.pain_points != null ? JSON.stringify(data.pain_points) : null,
      data.benefits != null ? JSON.stringify(data.benefits) : null,
      data.delivery_days_min != null ? Number(data.delivery_days_min) : null,
      data.delivery_days_max != null ? Number(data.delivery_days_max) : null,
      data.rating != null ? Number(data.rating) : null,
      data.users != null ? Number(data.users) : null,
      data.packages != null ? JSON.stringify(data.packages) : null,
      data.sort_order != null ? Number(data.sort_order) : null,
      id,
    ]
  );
  return r.rows[0] || null;
}

export async function deleteService(id) {
  const r = await query("DELETE FROM services WHERE id = $1 RETURNING id", [id]);
  return r.rowCount > 0;
}
