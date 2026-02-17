# Google OAuth + Railway setup

## Important: redirect URI = **backend** URL

Google redirects the user **to your backend** after sign-in. Your frontend is only used as the final destination after your backend redirects again with the token.

- **Authorized JavaScript origins** = where the **browser** runs your app (frontend).
- **Authorized redirect URIs** = where **Google** sends the user after login = **your API server** (backend).

---

## 1. Google Cloud Console

### Authorized JavaScript origins (keep as-is)

- `https://elursh.com`
- `http://localhost:8080`

### Authorized redirect URIs (must be backend)

Use your **API** base URL + `/api/auth/google/callback`:

- **Local:** `http://localhost:3001/api/auth/google/callback`  
  (API runs on 3001; do **not** use 8080 here.)
- **Production:** `https://<YOUR-RAILWAY-API-URL>/api/auth/google/callback`  
  Example: `https://elursh-production.up.railway.app/api/auth/google/callback`  
  If you use a custom domain for the API (e.g. `api.elursh.com`):  
  `https://api.elursh.com/api/auth/google/callback`

So in Google Console:

1. Remove or replace:
   - `https://elursh.com/auth/google/callback`
   - `http://localhost:8080/auth/google/callback`
2. Add:
   - `http://localhost:3001/api/auth/google/callback` (local)
   - Your Railway API URL + `/api/auth/google/callback` (production)

Save and wait a few minutes for changes to apply.

---

## 2. Railway environment variables

Set these in your Railway project (backend service).

| Variable | Example (production) | Description |
|----------|------------------------|-------------|
| `API_BASE_URL` | `https://elursh-production.up.railway.app` | Public URL of your Railway backend (same as in redirect URI). |
| `CUSTOMER_GOOGLE_CALLBACK_URL` | `https://elursh-production.up.railway.app/api/auth/google/callback` | Optional; defaults to `API_BASE_URL + /api/auth/google/callback`. Set if you need an explicit URL. |
| `FRONTEND_ORIGIN` or `SITE_URL` | `https://elursh.com` | Where the frontend lives. Used to redirect user to `/auth/callback` with token. |
| `GOOGLE_CLIENT_ID` | (from Google Console) | OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | (from Google Console) | OAuth client secret. |

If your frontend is on a different host (e.g. Vercel at `https://elursh.com`) and backend on Railway:

- `API_BASE_URL` = Railway app URL.
- `FRONTEND_ORIGIN` = `https://elursh.com`.
- In Google Console, redirect URI = `API_BASE_URL + /api/auth/google/callback`.

---

## 3. Local `.env`

```env
API_BASE_URL=http://localhost:3001
FRONTEND_ORIGIN=http://localhost:8080
# Optional; default is API_BASE_URL + /api/auth/google/callback
# CUSTOMER_GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 4. Quick checklist

- [ ] Google: Redirect URIs use **backend** host and path `/api/auth/google/callback`.
- [ ] Google: Local redirect URI is `http://localhost:3001/api/auth/google/callback` (not 8080).
- [ ] Railway: `API_BASE_URL` = your Railway backend URL.
- [ ] Railway: `FRONTEND_ORIGIN` = `https://elursh.com` (or your frontend URL).
- [ ] Railway: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set.
