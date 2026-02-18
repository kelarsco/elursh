# Shopify OAuth – Connect Store

Users connect their Shopify store via OAuth. No passwords. Data is user-specific.

## Flow

1. User logs into your app (Google or email OTP)
2. On Get Started, user selects Shopify and enters `store-name.myshopify.com`
3. Clicks "Connect Store" → backend returns Shopify authorization URL
4. User is redirected to Shopify → approves the app
5. Shopify redirects back with an authorization code
6. Backend exchanges code for an **access token** and saves it in `shopify_stores` linked to `customer_user_id`
7. User is redirected to the dashboard

## Auth Logic (User-Specific Dashboards)

- JWT/session identifies the logged-in user
- Backend fetches **only** stores linked to that user (`shopify_stores WHERE customer_user_id = ?`)
- Dashboard loads sales data for their store(s)
- Data separation: each user sees only their own stores and data

## Setup

1. Create a Shopify app at [partners.shopify.com](https://partners.shopify.com) → Apps → Create app → Create app manually
2. Under **App setup** → **URLs**:
   - **Redirect URL**: `https://YOUR_API_URL/api/shopify/callback`  
     (e.g. `https://elursh-api.railway.app/api/shopify/callback`)
3. Under **API credentials** copy **Client ID** and **Client secret**
4. In `.env`:
   ```
   SHOPIFY_CLIENT_ID=...
   SHOPIFY_CLIENT_SECRET=...
   ```
5. Run migrations: `npm run migrate`

## API Endpoints

- `POST /api/shopify/install` – (auth required) Returns `{ installUrl }` to redirect the user to Shopify
- `GET /api/shopify/callback` – Shopify OAuth callback (handles code exchange, saves token)
- `GET /api/shopify/stores` – (auth required) Returns connected stores for the current user
- `GET /api/shopify/dashboard?shop=xxx` – (auth required) Returns sales data from Shopify for the user’s store
