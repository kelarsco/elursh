/**
 * Product service: CRUD, pagination, filtering, search for /api/v1/products.
 */
import { query } from "../lib/db.js";
import { parsePageLimit, buildPaginatedMeta, parseSort, escapeLike } from "../lib/pagination.js";

const SORT_ALLOWLIST = ["id", "name", "sku", "price_usd", "created_at", "updated_at", "sort_order"];

export async function listProducts(opts = {}) {
  const { page, limit, offset } = parsePageLimit(opts);
  const { sort, order } = parseSort(opts, SORT_ALLOWLIST, "sort_order", "asc");
  const search = typeof opts.search === "string" ? opts.search.trim() : "";
  const published = opts.published;

  let where = [];
  let params = [];
  let idx = 1;

  if (search) {
    const pattern = `%${escapeLike(search)}%`;
    where.push(`(name ILIKE $${idx} OR sku ILIKE $${idx} OR description ILIKE $${idx})`);
    params.push(pattern);
    idx++;
  }
  if (published !== undefined) {
    where.push(`published = $${idx}`);
    params.push(!!published);
    idx++;
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderCol = sort === "price_usd" ? "price_usd" : sort === "sort_order" ? "sort_order" : sort;
  const orderDir = order.toUpperCase();

  const countResult = await query(
    `SELECT COUNT(*) AS total FROM products ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0]?.total || "0", 10);

  params.push(limit, offset);
  const r = await query(
    `SELECT id, sku, name, description, price_usd, image_url, published, sort_order, created_at, updated_at
     FROM products ${whereClause}
     ORDER BY ${orderCol} ${orderDir} NULLS LAST, id ASC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    params
  );

  return {
    data: r.rows,
    meta: buildPaginatedMeta(page, limit, total),
  };
}

export async function getProductById(id) {
  const r = await query(
    "SELECT id, sku, name, description, price_usd, image_url, published, sort_order, created_at, updated_at FROM products WHERE id = $1",
    [id]
  );
  return r.rows[0] || null;
}

export async function getProductBySku(sku) {
  const r = await query(
    "SELECT id, sku, name, description, price_usd, image_url, published, sort_order, created_at, updated_at FROM products WHERE sku = $1",
    [sku]
  );
  return r.rows[0] || null;
}

export async function createProduct(data) {
  const r = await query(
    `INSERT INTO products (sku, name, description, price_usd, image_url, published, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, sku, name, description, price_usd, image_url, published, sort_order, created_at, updated_at`,
    [
      data.sku ?? null,
      data.name ?? "",
      data.description ?? null,
      data.price_usd != null ? Number(data.price_usd) : null,
      data.image_url ?? null,
      !!data.published,
      Number(data.sort_order) || 0,
    ]
  );
  return r.rows[0];
}

export async function updateProduct(id, data) {
  await query(
    `UPDATE products SET sku=COALESCE($1,sku), name=COALESCE($2,name), description=COALESCE($3,description),
     price_usd=COALESCE($4,price_usd), image_url=COALESCE($5,image_url), published=COALESCE($6,published),
     sort_order=COALESCE($7,sort_order), updated_at=NOW() WHERE id=$8`,
    [
      data.sku !== undefined ? data.sku : null,
      data.name !== undefined ? data.name : null,
      data.description !== undefined ? data.description : null,
      data.price_usd !== undefined ? (data.price_usd != null ? Number(data.price_usd) : null) : null,
      data.image_url !== undefined ? data.image_url : null,
      data.published !== undefined ? !!data.published : null,
      data.sort_order !== undefined ? Number(data.sort_order) : null,
      id,
    ]
  );
  return getProductById(id);
}

export async function deleteProduct(id) {
  const r = await query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);
  return r.rowCount > 0;
}
