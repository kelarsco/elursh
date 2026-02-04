# API & Service Configuration (elursh.com on Vercel)

This guide lists every configuration needed so **all features work** when the frontend is on **Vercel (elursh.com)** and the backend runs elsewhere (e.g. Railway or Render).

---

## 1. Architecture

- **Vercel** serves only the static frontend (React app). It does **not** run `server.js`.
- **Backend** (Railway, Render, Fly.io, etc.) runs `node server.js` and handles all `/api/*` routes.
- The frontend calls the backend using `VITE_API_URL` (set at build time on Vercel).

**You must deploy the backend** and set `VITE_API_URL` on Vercel so the site can reach the API. Optional: use a [Vercel rewrite](https://vercel.com/docs/edge-network/rewrites) to proxy `elursh.com/api/*` to your Railway URL so the frontend can keep using relative `/api/...` URLs (see [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)).

---

## 2. Vercel (Frontend) – Environment Variables

Set these in **Vercel** → Project → **Settings** → **Environment Variables**. Apply to **Production** (and Preview if you use preview deployments). Then **redeploy** so the build picks them up.

| Variable | Required | Value | Notes |
|----------|----------|--------|--------|
| `VITE_API_URL` | **Yes** | Your backend URL, e.g. `https://elursh-api.up.railway.app` | No trailing slash. Frontend uses this for all API calls (services, verification code, Paystack, store audit, manager dashboard). |
| `VITE_PAYSTACK_PUBLIC_KEY` | Yes (if using Paystack) | Same as `pk_live_...` from Paystack | Used by frontend for payment UI. |

That’s all that’s needed on Vercel for the app to talk to your backend and Paystack.

---

## 3. Backend (Railway / Render / etc.) – Environment Variables

Set these on the **backend** platform (Railway, Render, etc.). The backend needs the full set below for every feature to work.

### 3.1 Core (required for API to run)

| Variable | Required | Example / Notes |
|----------|----------|------------------|
| `NODE_ENV` | Yes | `production` |
| `DATABASE_URL` | Yes | Postgres URL (Neon, Railway, Render, Supabase). You already use Neon. |
| `SESSION_SECRET` | Yes | Long random string (sessions for manager dashboard). |
| `JWT_SECRET` | Yes | Long random string (v1 API auth). |
| `API_PORT` or `PORT` | No | Platform often sets `PORT`; backend uses it. |
| `FRONTEND_ORIGIN` | Yes | `https://elursh.com` or `https://www.elursh.com`. Used for CORS and redirects. |
| `FRONTEND_ORIGINS` | No | Comma-separated list if you use both, e.g. `https://elursh.com,https://www.elursh.com`. Overrides `FRONTEND_ORIGIN` when set. |

### 3.2 Google OAuth (Manager dashboard – “Sign in with Google”)

| Variable | Required | Example / Notes |
|----------|----------|------------------|
| `GOOGLE_CLIENT_ID` | If using Google login | From Google Cloud Console (OAuth 2.0 Client ID). |
| `GOOGLE_CLIENT_SECRET` | If using Google login | From same OAuth client. |
| `GOOGLE_CALLBACK_URL` | Recommended | **Backend** callback URL, e.g. `https://elursh-api.up.railway.app/api/manager/auth/google/callback`. If unset, backend builds it from `API_BASE_URL`. |
| `API_BASE_URL` | Recommended | Backend root URL, e.g. `https://elursh-api.up.railway.app`. Used to build `GOOGLE_CALLBACK_URL` when that’s not set. |
| `MANAGER_REDIRECT_AFTER_LOGIN` | **Important for split deploy** | Full URL where to send user after Google login, e.g. `https://elursh.com/manager`. Otherwise they’d be sent to the backend’s `/manager` (wrong). |
| `ADMIN_EMAILS` | Optional | Comma‑separated emails allowed to use manager (e.g. `you@elursh.com`). If empty, any Google user can log in. |

**Google Cloud Console (APIs & Services → Credentials):**

1. Create or use an **OAuth 2.0 Client ID** (Web application).
2. **Authorized redirect URIs**: add **exactly** your backend callback URL, e.g.  
   `https://elursh-api.up.railway.app/api/manager/auth/google/callback`  
   (Use your real backend URL; **not** `elursh.com/auth/google/callback` – Google must redirect to the **backend**.)
3. **Authorized JavaScript origins**: add `https://elursh.com` and `https://www.elursh.com` if you use them.

### 3.3 Manager TOTP (Authenticator app login)

| Variable | Required | Notes |
|----------|----------|--------|
| `MANAGER_TOTP_SECRET` | Yes (for TOTP login) | Base32 secret for authenticator app. Generate with `node scripts/generate-totp-secret.js`. |

### 3.4 Email (verification codes, theme confirmation, Fix‑It Manual, etc.)

**Option A – Resend (recommended)**

| Variable | Example |
|----------|--------|
| `RESEND_API_KEY` | `re_...` from Resend dashboard. |
| `RESEND_FROM` | Verified sender, e.g. `notifications@elursh.com` or `onboarding@resend.dev` for testing. |

**Option B – Gmail / SMTP**

| Variable | Example |
|----------|--------|
| `EMAIL_SERVICE` | `gmail` |
| `EMAIL_USER` | `your@gmail.com` |
| `EMAIL_APP_PASSWORD` | 16‑char app password (Google Account → Security → App passwords). |
| `EMAIL_FROM_NAME` | `Elursh` |

Without one of these, **“Send verification code”** (Improve Store), theme purchase emails, and Fix‑It Manual emails will fail.

### 3.5 Paystack (payments)

| Variable | Required | Notes |
|----------|----------|--------|
| `PAYSTACK_SECRET_KEY` | Yes (for payments) | Live key `sk_live_...` in production. |
| `PAYSTACK_PUBLIC_KEY` | Yes | Live key `pk_live_...`. |
| `PAYSTACK_USD_TO_NGN_RATE` | No | Override USD→NGN rate; otherwise fetched from API. |

(No need to set Paystack keys on Vercel except `VITE_PAYSTACK_PUBLIC_KEY` as in section 2.)

### 3.6 Optional but useful

| Variable | Notes |
|----------|--------|
| `SITE_URL` | Same as `FRONTEND_ORIGIN`; used for links in emails (e.g. Fix‑It Manual download link). |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used by seed script; not required at runtime. |

---

## 4. Feature checklist (what each part needs)

| Feature | Vercel | Backend | Third‑party |
|---------|--------|---------|-------------|
| **Improve Store – services list** | `VITE_API_URL` | `DATABASE_URL` | – |
| **Improve Store – “Send verification code”** | `VITE_API_URL` | Email (Resend or Gmail) | – |
| **Improve Store – place order / Paystack** | `VITE_API_URL`, `VITE_PAYSTACK_PUBLIC_KEY` | `DATABASE_URL`, Paystack keys, email | Paystack dashboard (live keys) |
| **Theme page – list themes / purchase** | `VITE_API_URL`, `VITE_PAYSTACK_PUBLIC_KEY` | `DATABASE_URL`, Paystack keys, email | Paystack |
| **Store audit / Analyze Store** | `VITE_API_URL` | `DATABASE_URL` (for saving results, store reports) | – |
| **Fix‑It Manual purchase** | `VITE_API_URL`, `VITE_PAYSTACK_PUBLIC_KEY` | Paystack keys, email (for download link email) | Paystack |
| **Contact form** | `VITE_API_URL` | `DATABASE_URL` (contacts table) | – |
| **Manager dashboard – TOTP login** | `VITE_API_URL` (manager API base) | `SESSION_SECRET`, `MANAGER_TOTP_SECRET`, `DATABASE_URL` | – |
| **Manager dashboard – Google login** | `VITE_API_URL` | Google OAuth vars, `MANAGER_REDIRECT_AFTER_LOGIN`, `FRONTEND_ORIGIN` | Google Cloud Console redirect URI = **backend** callback URL |

---

## 5. One‑time backend setup

1. **Migrations**  
   On the backend platform, run once (or in release phase):  
   `npm run migrate`

2. **Optional – seed admin**  
   If you use the seed script: set `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then run:  
   `node scripts/seed-admin-user.js`

3. **Optional – seed services/themes**  
   Backend can auto‑seed from code when tables are empty; or run:  
   `node scripts/seed-services-and-themes.js`

---

## 6. Quick verification

- **Frontend → API**  
  Open elursh.com/improve-store; if services load and “Send verification code” can be requested, `VITE_API_URL` and the backend are correct.

- **Manager**  
  Open elursh.com/manager; log in with TOTP (or Google if configured). If the dashboard loads and data appears, manager API and cookies are working.

- **Paystack**  
  Use a test payment (or live if configured); success and webhook handling depend on backend Paystack keys and URL.

- **Google OAuth**  
  Redirect URI in Google Console must be the **backend** URL (e.g. `https://your-backend.up.railway.app/api/manager/auth/google/callback`), and `MANAGER_REDIRECT_AFTER_LOGIN=https://elursh.com/manager` so users land on the site after login.

---

## 7. Summary

1. **Deploy backend** (e.g. Railway) with `server.js`, set all backend env vars above.
2. **Vercel**: set `VITE_API_URL` (and `VITE_PAYSTACK_PUBLIC_KEY`); redeploy.
3. **Google OAuth**: redirect URI = backend callback URL; backend has `MANAGER_REDIRECT_AFTER_LOGIN=https://elursh.com/manager`.
4. **Email**: configure Resend or Gmail on the backend so verification and other emails send.
5. **Paystack**: live keys on backend; public key on Vercel for the frontend.

With this, Google auth, email verification, store audit, Paystack, and the rest of the API will work with elursh.com on Vercel.
