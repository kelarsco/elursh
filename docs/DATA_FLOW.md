# Admin → UI Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React / Vite)                            │
│  Pages: Dashboard, AnalysedStores, Contacts, Orders, Payments, Services,   │
│         StoreReports, SendEmail, EmailsSent                                   │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │ /api/manager/* │  │ /api/v1/*    │  │ Public /api  │
         │ (session+TOTP) │  │ (JWT)        │  │ (no auth)    │
         └───────┬───────┘  └───────┬──────┘  └───────┬──────┘
                 │                  │                  │
                 └──────────────────┼──────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXPRESS API (server.js)                              │
│  CORS, JSON body, session (manager), v1 router (JWT), legacy routes          │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ Middleware      │    │ Services            │    │ lib/db.js            │
│ auth (JWT, role)│    │ authService         │    │ getPool(), query(),   │
│ requireManager  │    │ productService      │    │ healthCheck()         │
│ requireDb       │    │ contentPageService  │    │ config (env-based)    │
└─────────────────┘    │ improveStoreService │    └──────────┬────────────┘
                       └─────────────────────┘               │
                                    │                        │
                                    └────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PostgreSQL (connection pool)                                │
│  users, analysed_stores, contacts, services, store_reports, orders,         │
│  payments, emails_sent, content_pages, products, schema_migrations            │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Flow summary

1. **Admin performs CRUD** (dashboard or API client) → request with session cookie (legacy) or `Authorization: Bearer <JWT>` (v1).
2. **Backend validates** — requireManager or requireJwt + requireRole; requireDb ensures pool exists.
3. **Service layer** — business logic and queries (list with pagination/filter, get, create, update, delete).
4. **Database updates** — via connection pool; migrations applied via `npm run migrate`.
5. **UI receives data** — JSON response; list endpoints include `meta` (page, limit, total) for pagination.

## Real-time updates

- The UI can poll list endpoints (e.g. `GET /api/v1/admin/orders?page=1&limit=20`) or refetch after mutations.
- For true real-time, add WebSockets or Server-Sent Events later; the current design supports polling and refetch.
