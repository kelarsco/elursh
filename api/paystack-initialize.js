/**
 * Paystack Initialize Transaction – serverless (Vercel).
 * Docs: https://paystack.com/docs/payments/accept-payments/ (Redirect flow)
 * API: https://paystack.com/docs/api/transaction#initialize
 *
 * Set PAYSTACK_SECRET_KEY in environment (e.g. Vercel dashboard).
 * POST body: { email, amountUsd, callbackUrl, metadata? } or { email, amountKobo, ... }
 * Prices in USD: send amountUsd; we convert to NGN at PAYSTACK_USD_TO_NGN_RATE or live rate.
 * metadata: { themeId, themeName, storeLink, email } for theme purchase confirmation email.
 * Returns: { authorization_url } – redirect user to this URL to pay.
 */
const PAYSTACK_INIT_URL = "https://api.paystack.co/transaction/initialize";
const USD_TO_NGN_FALLBACK = 1600;

async function getUsdToNgnRate() {
  const envRate = process.env.PAYSTACK_USD_TO_NGN_RATE;
  if (envRate != null && envRate !== "") {
    const n = Number(envRate);
    if (Number.isFinite(n) && n > 0) return n;
  }
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    const ngn = data?.conversion_rates?.NGN;
    if (typeof ngn === "number" && ngn > 0) return ngn;
  } catch (_) {}
  return USD_TO_NGN_FALLBACK;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "Paystack secret key not configured" });
  }

  try {
    const { email, amountUsd, amountKobo, callbackUrl, metadata } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: "Invalid email" });
    }

    let amountKoboFinal;
    if (amountUsd != null && Number(amountUsd) > 0) {
      const rate = await getUsdToNgnRate();
      const amountNgn = Number(amountUsd) * rate;
      amountKoboFinal = Math.round(amountNgn * 100);
      if (amountKoboFinal < 100) {
        return res.status(400).json({ error: "Amount too small after conversion" });
      }
    } else if (amountKobo != null && Number(amountKobo) >= 100) {
      amountKoboFinal = Number(amountKobo);
    } else {
      return res.status(400).json({ error: "Invalid amount: send amountUsd (dollars) or amountKobo" });
    }

    const payload = {
      email: String(email).trim(),
      amount: amountKoboFinal,
      callback_url: callbackUrl || undefined,
    };
    if (metadata && typeof metadata === "object") {
      payload.metadata = metadata;
    }

    const response = await fetch(PAYSTACK_INIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!data.status || !data.data?.authorization_url) {
      return res.status(400).json({ error: data.message || "Paystack initialization failed" });
    }

    res.status(200).json({ authorization_url: data.data.authorization_url });
  } catch (err) {
    console.error("Paystack init error:", err);
    res.status(500).json({ error: "Failed to create payment link" });
  }
}
