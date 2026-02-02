# API v1 Reference

Base URL: `/api/v1`

All list endpoints support **pagination**: `?page=1&limit=20` (default limit 20, max 100).

Responses are **JSON only**. Success: `{ "data": ... }` or `{ "data": ..., "meta": { "page", "limit", "total", "totalPages" } }`. Errors: `{ "error": "message", "code": 400 }`.

## Authentication (JWT)

- **Login:** `POST /api/v1/auth/login`  
  Body: `{ "email": "...", "password": "..." }`  
  Returns: `{ "data": { "id", "email", "role", "display_name" }, "meta": { "token", "expiresIn" } }`
- **Me:** `GET /api/v1/auth/me`  
  Header: `Authorization: Bearer <token>`  
  Returns: `{ "data": { "sub", "email", "role" } }`
- **Register (admin only):** `POST /api/v1/auth/register`  
  Body: `{ "email", "password", "role": "admin"|"editor", "display_name" }`

## Health

- `GET /api/v1/health` — Returns `{ "ok": true, "db": "connected" }` or 503 if DB down.

## Admin (JWT + role admin or editor)

- `GET /api/v1/admin/dashboard` — Counts: analysed_stores, contacts, orders, payments
- `GET /api/v1/admin/analysed-stores` — Paginated
- `GET /api/v1/admin/contacts` — Paginated
- `GET /api/v1/admin/orders` — Paginated  
  `PATCH /api/v1/admin/orders/:id` — Body: `{ "status": "..." }`
- `GET /api/v1/admin/payments` — Paginated
- `GET /api/v1/admin/store-reports` — List  
  `GET /api/v1/admin/store-reports/:storeUrl` — One  
  `PUT /api/v1/admin/store-reports` — Body: `{ "store_url", "report_json" }`
- `GET /api/v1/admin/emails-sent` — Paginated

## Products (CRUD)

- `GET /api/v1/products` — List (public: published only; auth: optional filter `?published=true|false`). Query: `page`, `limit`, `search`, `sort`, `order`
- `GET /api/v1/products/:id` — One (public; unpublished only for auth)
- `POST /api/v1/products` — Create (admin/editor). Body: `sku`, `name`, `description`, `price_usd`, `image_url`, `published`, `sort_order`
- `PUT /api/v1/products/:id` — Update (admin/editor)
- `DELETE /api/v1/products/:id` — Delete (admin only)

## Content pages (CRUD)

- `GET /api/v1/content-pages` — List (admin/editor). Query: `page`, `limit`, `search`, `sort`, `order`, `published`
- `GET /api/v1/content-pages/slug/:slug` — Public; published only
- `GET /api/v1/content-pages/:id` — One (admin/editor)
- `POST /api/v1/content-pages` — Create (admin/editor). Body: `slug`, `title`, `body_html`, `body_text`, `meta_title`, `meta_description`, `published`
- `PUT /api/v1/content-pages/:id` — Update (admin/editor)
- `DELETE /api/v1/content-pages/:id` — Delete (admin only)

## Services (Improve Store marketplace)

- `GET /api/v1/services` — List (public). Query: `page`, `limit`, `search`, `category`, `type`, `sort`, `order`
- `GET /api/v1/services/:id` — One (public)
- `POST /api/v1/services` — Create (admin/editor)
- `PUT /api/v1/services/:id` — Update (admin/editor)
- `DELETE /api/v1/services/:id` — Delete (admin only)
