# Deploy Backend to Railway (elursh.com architecture)

This doc matches the **Vercel (frontend) → Railway (API) → Neon (DB) → Gmail (email)** setup so `/api/send-verification-code` and all other API routes work and emails send.

---

## Architecture

```
Frontend (Vercel – elursh.com)
        ↓
Backend API (Railway – Express / Node)
        ↓
Database (Neon – PostgreSQL)
        ↓
Email (Gmail / Google Workspace SMTP)
```

**Result:** API 404s fixed, verification emails send, users can verify; page 404s (e.g. `/manager` on refresh) are fixed by the existing SPA rewrite in `vercel.json`.

---

## Step 1: Backend is already ready for Railway

This repo has:

- **`server.js`** – Express app with all `/api/*` routes (including `/api/send-verification-code`).
- **`package.json`** – Start with `npm start` (runs `node server.js`).

The server **already listens on `process.env.PORT`** (via `config.api.port`: `PORT` or `API_PORT` or 3001). Railway sets `PORT`, so no code change needed.

---

## Step 2: Push to GitHub (if not already)

Railway deploys from GitHub. Use **this same repo** (monorepo: frontend + backend).

- If the repo is already on GitHub (e.g. `kelarsco/elursh`), you’re set.
- Railway will build and run from the same repo; set **Start Command** to `npm start` or `node server.js` and **Root Directory** to the repo root (where `server.js` and `package.json` are).

---

## Step 3: Deploy on Railway

1. Go to [railway.app](https://railway.app) → **New Project**.
2. **Deploy from GitHub Repo** → choose your `elursh` repo.
3. Railway will detect Node.js. Set:
   - **Start command:** `npm start` or `node server.js`
   - **Root directory:** (leave default if `server.js` is at repo root)
4. After deploy, open **Settings → Networking → Generate domain**. You’ll get a URL like:
   - `https://elursh-production-xxxx.up.railway.app`  
   This is your **live API base URL**.

---

## Step 4: Environment variables on Railway

In **Railway → Project → Your service → Variables**, add:

**Database (Neon)**  
- `DATABASE_URL` = your Neon Postgres URL (you already have this).

**Email (Gmail)** – use either set:

- **Option A (recommended):**  
  `EMAIL_SERVICE=gmail`  
  `EMAIL_USER=info@elursh.com`  
  `EMAIL_APP_PASSWORD=your_google_app_password`

- **Option B (prompt-style names):**  
  `SENDER_EMAIL=info@elursh.com`  
  `SMTP_HOST=smtp.gmail.com`  
  `SMTP_PORT=587`  
  `SMTP_USER=info@elursh.com`  
  `SMTP_PASS=your_google_app_password`

**CORS (required)**  
- `FRONTEND_ORIGIN=https://elursh.com`  
  or, if you use both:  
  `FRONTEND_ORIGINS=https://elursh.com,https://www.elursh.com`

**Core**  
- `NODE_ENV=production`  
- `SESSION_SECRET=<long-random-string>`  
- `JWT_SECRET=<long-random-string>`

**Optional but recommended**  
- Paystack, Google OAuth, `MANAGER_REDIRECT_AFTER_LOGIN`, etc. (see [VERCEL_API_CONFIG.md](./VERCEL_API_CONFIG.md)).

After adding variables, **Redeploy** the service.

---

## Step 5: Test the API

From browser or c:

- **POST** `https://YOUR_RAILWAY_URL/api/send-verification-code`  
  With body: `{ "email": "test@example.com" }`  
  Expected: **200** and a success-style response (or your normal validation/error payload).
- **GET** same URL → expected **405** (Method Not Allowed). That confirms the route exists and only POST is allowed.

If this works, the backend is live.

---

## Step 6: Point the frontend at the backend

**Option A – Proxy mode (recommended, fixes manager dashboard 401)**

`vercel.json` already rewrites `/api/*` to Railway, so API requests are same-origin (no third‑party cookie issues).

1. In **Vercel** → Project → **Settings** → **Environment variables**:
   - Add `VITE_USE_API_PROXY` = `true`
   - You can remove `VITE_API_URL` (or leave it unset)
2. In **Railway** → Your service → **Variables**:
   - Add `COOKIE_DOMAIN` = `.elursh.com` (so the session cookie works when proxied)
3. **Redeploy** both Vercel and Railway.

With this setup, all API calls go to `www.elursh.com/api/...` (proxied to Railway) and the manager dashboard login works.

**Option B – Direct mode (if you prefer direct Railway URLs)**

1. In **Vercel** → Project → **Settings** → **Environment variables**:
   - Add `VITE_API_URL` = your Railway URL (e.g. `https://elursh-production-xxxx.up.railway.app`), **no trailing slash**
   - Do **not** set `VITE_USE_API_PROXY`
2. **Redeploy** the frontend on Vercel.

API calls go directly to Railway. Manager login may fail with 401 in some browsers due to third‑party cookie blocking; use Option A if that happens.

---

## Step 7: CORS (already handled)

The backend uses **`FRONTEND_ORIGIN`** or **`FRONTEND_ORIGINS`** from config for CORS. As long as you set one of these on Railway to `https://elursh.com` (and optionally `https://www.elursh.com`), the browser will allow requests from your site. No extra code needed.

---

## Manager dashboard: 401 on `/api/manager/auth/me`

If you get 401 on `/api/manager/auth/me` after TOTP login:

1. Use **proxy mode** (Step 6 Option A): `VITE_USE_API_PROXY=true` on Vercel, `COOKIE_DOMAIN=.elursh.com` on Railway. Redeploy both. Railway’s proxy and the **Secure** session cookie is set.
2. Also ensure on Railway: NODE_ENV, SESSION_SECRET, FRONTEND_ORIGINS.  
   - `NODE_ENV=production`  
   - `SESSION_SECRET` = a long random string  
   - `FRONTEND_ORIGINS=https://elursh.com,https://www.elursh.com` (or your real frontend URL(s))

Redeploy the backend after changing env vars. If 401 persists, try in an incognito window and ensure you’re using the same frontend origin (e.g. always `https://www.elursh.com`) that you listed in `FRONTEND_ORIGINS`.

---

## Summary

| What                         | How |
|-----------------------------|-----|
| API 404 (e.g. send-verification-code) | Deploy backend to Railway, set `VITE_API_URL` on Vercel (or use Vercel proxy above). |
| Page 404 (e.g. /manager on refresh)   | Already handled by SPA rewrite in `vercel.json` (all non-api routes → `index.html`). |
| Emails send                  | Set Gmail (or SMTP) vars on Railway; backend uses them. |
| Users can verify             | Same API + email config; frontend already calls the API. |

For full env var and feature checklist, see [VERCEL_API_CONFIG.md](./VERCEL_API_CONFIG.md).
