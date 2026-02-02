/**
 * Paystack Verify Transaction – serverless (Vercel).
 * See: https://paystack.com/docs/payments/verify-payments/
 * Set PAYSTACK_SECRET_KEY in environment.
 * GET ?reference=xxx
 * Returns: { success, status, amount } or { success: false, error }.
 */
const PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify/";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "Paystack secret key not configured" });
  }

  const reference = req.query.reference;
  if (!reference || typeof reference !== "string") {
    return res.status(400).json({ success: false, error: "Missing reference" });
  }

  try {
    const response = await fetch(`${PAYSTACK_VERIFY_URL}${encodeURIComponent(reference.trim())}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const data = await response.json();
    if (!data.status || !data.data) {
      return res.status(200).json({ success: false, error: data.message || "Verification failed" });
    }

    const { status, amount, reference: ref } = data.data;
    if (status !== "success") {
      return res.status(200).json({ success: false, error: "Transaction not successful", status });
    }

    res.status(200).json({
      success: true,
      status,
      amount,
      reference: ref,
    });
  } catch (err) {
    console.error("Paystack verify error:", err);
    res.status(500).json({ success: false, error: "Verification failed" });
  }
}
