# Paystack Integration

This project uses [Paystack](https://paystack.com) for payments (themes, Fix-It Manual, Improve Store services).

## Live vs Test Keys

- **Test keys** (`sk_test_*`, `pk_test_*`) – Use for development; no real charges.
- **Live keys** (`sk_live_*`, `pk_live_*`) – Use for production; collects real payments.

Get your keys from [Paystack Dashboard → Settings → API Keys & Webhooks](https://dashboard.paystack.com/#/settings/developers).

## Environment Variables

Add these to your `.env` file:

| Variable | Description |
|----------|-------------|
| `PAYSTACK_SECRET_KEY` | Secret key (sk_live_* for live, sk_test_* for test). **Never expose this.** |
| `PAYSTACK_PUBLIC_KEY` | Public key (pk_live_* for live, pk_test_* for test). |
| `VITE_PAYSTACK_PUBLIC_KEY` | Same as `PAYSTACK_PUBLIC_KEY`; used by the frontend (Vite embeds it at build time). |
| `PAYSTACK_USD_TO_NGN_RATE` | Optional. Override USD→NGN conversion rate (e.g. `1600`). |

## Switching to Live Payments

1. In [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developers), copy your **Live** public and secret keys.
2. Update `.env`:
   ```
   PAYSTACK_SECRET_KEY=sk_live_your_secret_key
   PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
   ```
3. Restart the API server and rebuild the frontend if needed.
4. Ensure your Paystack account is activated for live transactions (complete business verification if required).

## Security

- **Never commit** `.env` or any file containing `PAYSTACK_SECRET_KEY`.
- The secret key is used only on the backend (server.js) for initializing and verifying transactions.
- The public key can be used in the frontend; it is safe to expose.
