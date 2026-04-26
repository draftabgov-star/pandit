const DEFAULT_API_URL = "https://api.nowpayments.io/v1";

function apiUrl() {
  return (process.env.NOWPAYMENTS_API_URL || DEFAULT_API_URL).replace(/\/$/, "");
}

export async function createInvoice(
  amountUSD: number,
  orderId: string,
  orderDescription: string,
  successUrl: string,
  cancelUrl: string,
) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) throw new Error("NOWPAYMENTS_API_KEY is not configured");

  const callbackBase = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");

  const res = await fetch(`${apiUrl()}/invoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      price_amount: amountUSD,
      price_currency: "usd",
      pay_currency: "btc",
      order_id: orderId,
      order_description: orderDescription,
      ipn_callback_url: `${callbackBase}/api/payments/ipn`,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });

  if (!res.ok) {
    throw new Error(`Invoice creation failed: ${await res.text()}`);
  }
  return (await res.json()) as { invoice_url: string };
}
