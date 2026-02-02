# Fix "password authentication failed for user postgres"

PostgreSQL is rejecting the password in your `.env`. Use one of these approaches.

---

## Option 1: Reset the Postgres password (recommended)

Set a **new** password you control, then put that same value in `.env`.

### In pgAdmin 4

1. Connect to your **local** server (the one you use for `elursh`).
2. Right-click the server → **Properties** → **Connection** tab: note the **username** (often `postgres`).
3. Open **Query Tool** (Tools → Query Tool or right-click a database → Query Tool).
4. Select the database **`elursh`** (or **`postgres`**) in the dropdown.
5. Run this (replace `YourNewPassword` with the password you want):

   ```sql
   ALTER USER postgres PASSWORD 'YourNewPassword';
   ```

6. Click **Execute** (F5). You should see "Query returned successfully."

### In your `.env`

Use the **exact** password you set above.

**If the password has no special characters** (`@`, `#`, `:`, etc.):

```env
DATABASE_URL=postgresql://postgres:YourNewPassword@localhost:5432/elursh
```

**If the password has special characters** (e.g. `@`):

```env
DATABASE_URL=postgresql://postgres@localhost:5432/elursh
DB_PASSWORD=YourNewPassword
```

7. Save `.env`, restart the app (`npm run dev`). Run `node scripts/check-db.js` — you should see `DB health: { ok: true }`.

---

## Option 2: Use your current Postgres password

If you already know the correct password (e.g. the one you use in pgAdmin):

1. Put it in `.env` exactly as you type it in pgAdmin (no quotes, no spaces).
2. If it contains `@`, use **Option B** above: leave the password out of `DATABASE_URL` and set `DB_PASSWORD=yourpassword`.
3. Or URL-encode it in `DATABASE_URL`: `@` → `%40`, `#` → `%23`, `:` → `%3A`.

---

## Verify

```bash
node scripts/check-db.js
```

Expected: `DB health: { ok: true }`
