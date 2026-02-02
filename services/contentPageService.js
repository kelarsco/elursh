/**
 * Content pages service: CRUD, pagination, filtering for /api/v1/content-pages.
 */
import { query } from "../lib/db.js";
import { parsePageLimit, buildPaginatedMeta, parseSort, escapeLike } from "../lib/pagination.js";

const SORT_ALLOWLIST = ["id", "slug", "title", "published", "created_at", "updated_at"];

export async function listContentPages(opts = {}) {
  const { page, limit, offset } = parsePageLimit(opts);
  const { sort, order } = parseSort(opts, SORT_ALLOWLIST, "updated_at", "desc");
  const search = typeof opts.search === "string" ? opts.search.trim() : "";
  const published = opts.published;

  let where = [];
  let params = [];
  let idx = 1;

  if (search) {
    const pattern = `%${escapeLike(search)}%`;
    where.push(`(slug ILIKE $${idx} OR title ILIKE $${idx} OR body_text ILIKE $${idx})`);
    params.push(pattern);
    idx++;
  }
  if (published !== undefined) {
    where.push(`published = $${idx}`);
    params.push(!!published);
    idx++;
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderDir = order.toUpperCase();

  const countResult = await query(
    `SELECT COUNT(*) AS total FROM content_pages ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0]?.total || "0", 10);

  params.push(limit, offset);
  const r = await query(
    `SELECT id, slug, title, body_html, body_text, meta_title, meta_description, published, created_at, updated_at
     FROM content_pages ${whereClause}
     ORDER BY ${sort} ${orderDir} NULLS LAST, id ASC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    params
  );

  return {
    data: r.rows,
    meta: buildPaginatedMeta(page, limit, total),
  };
}

export async function getContentPageById(id) {
  const r = await query(
    "SELECT * FROM content_pages WHERE id = $1",
    [id]
  );
  return r.rows[0] || null;
}

export async function getContentPageBySlug(slug) {
  const r = await query(
    "SELECT * FROM content_pages WHERE slug = $1 AND published = true",
    [slug]
  );
  return r.rows[0] || null;
}

export async function createContentPage(data) {
  const r = await query(
    `INSERT INTO content_pages (slug, title, body_html, body_text, meta_title, meta_description, published)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      data.slug ?? "",
      data.title ?? "",
      data.body_html ?? null,
      data.body_text ?? null,
      data.meta_title ?? null,
      data.meta_description ?? null,
      !!data.published,
    ]
  );
  return r.rows[0];
}

export async function updateContentPage(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;
  const allowed = ["slug", "title", "body_html", "body_text", "meta_title", "meta_description", "published"];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(key === "published" ? !!data[key] : data[key]);
      idx++;
    }
  }
  if (fields.length === 0) return getContentPageById(id);
  fields.push(`updated_at = NOW()`);
  values.push(id);
  await query(
    `UPDATE content_pages SET ${fields.join(", ")} WHERE id = $${idx}`,
    values
  );
  return getContentPageById(id);
}

export async function deleteContentPage(id) {
  const r = await query("DELETE FROM content_pages WHERE id = $1 RETURNING id", [id]);
  return r.rowCount > 0;
}
