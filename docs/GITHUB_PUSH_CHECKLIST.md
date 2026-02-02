# GitHub Push Checklist

Before pushing this backend to GitHub, ensure:

- [ ] **`.env` is ignored** — `.env`, `.env.local`, `.env.*.local` are in `.gitignore`. Never commit real credentials.
- [ ] **`.env.example` is committed** — Contains variable names and placeholders only (no secrets).
- [ ] **No credentials in code** — No `DATABASE_URL`, `JWT_SECRET`, `PAYSTACK_SECRET_KEY`, or passwords in source files.
- [ ] **Migrations are tracked** — `db/migrations/` is committed so others can run `npm run migrate`.
- [ ] **Seed script is optional** — `scripts/seed-admin-user.js` uses env vars; no hardcoded users.
- [ ] **Secrets rotated** — If the repo was ever public or shared, rotate all secrets (DB password, JWT_SECRET, SESSION_SECRET, Paystack keys) after pushing to a new remote.
- [ ] **README or docs** — Note that setup requires copying `.env.example` to `.env` and running `npm run migrate` (and optionally `node scripts/seed-admin-user.js`).

## Quick verify

```bash
git status
# Ensure .env does not appear

rg -i "password|secret|sk_live|sk_test" --type-add 'code:*.{js,ts,jsx,tsx}' -t code .
# Should not show real secrets in code (only .env.example placeholders are OK)
```
