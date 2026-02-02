# Deployment Checklist

Use this for Railway, Render, Fly.io, or a VPS.

## Environment variables (set on the platform)

| Variable | Required | Notes |
|----------|----------|--------|
| `NODE_ENV` | Yes | `production` |
| `DATABASE_URL` | Yes | Cloud Postgres connection string (Railway/Render/Neon/Supabase provide this) |
| `JWT_SECRET` | Yes | Long random string for v1 API auth |
| `SESSION_SECRET` | Yes | Long random string for session (manager dashboard) |
| `API_PORT` | No | Port the process listens on (many platforms set `PORT`; map to `API_PORT` if needed) |
| `FRONTEND_ORIGIN` | Yes (prod) | Allowed CORS origin, e.g. `https://yourdomain.com` |
| `PAYSTACK_SECRET_KEY` | If using Paystack | Use live key (sk_live_*) in production |
| `PAYSTACK_PUBLIC_KEY` | If using Paystack | Use live key (pk_live_*) in production |
| `VITE_PAYSTACK_PUBLIC_KEY` | If using Paystack | Same as PUBLIC_KEY for frontend build |

Optional: `DB_POOL_MAX`, `DB_POOL_IDLE_MS`, `JWT_EXPIRES_IN`, `JWT_ISSUER`, SMTP vars, `MANAGER_TOTP_SECRET`.

## One-command startup

- **Start API:** `npm start` or `node server.js` (uses `API_PORT` or `process.env.PORT` or 3001).
- **Run migrations:** `npm run migrate` (run once per deploy or in release phase).
- **Seed first admin (optional):** Set `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then `node scripts/seed-admin-user.js` once.

## Platform notes

- **Railway / Render:** Set `DATABASE_URL` from their Postgres add-on. Use release phase or a one-off job to run `npm run migrate`. Start command: `npm start`.
- **Fly.io:** Set secrets with `fly secrets set`. Run migrations in a release command or manually after deploy.
- **VPS:** Use a process manager (PM2, systemd). Point Nginx/reverse proxy to the API port. Run migrations after pull: `npm run migrate`.

## Health check

- **Endpoint:** `GET /api/v1/health`
- **Success:** `200` with `{ "ok": true, "db": "connected" }`
- **Failure:** `503` if DB is down.

## No local-only dependencies

- All config comes from environment variables.
- Database is always external (cloud Postgres) in production.
- One-command start: `npm start`.
