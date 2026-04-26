"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function PricingPage() {
  const { status } = useSession();
  const [error, setError] = useState<string | null>(null);

  async function subscribe(plan: "pro" | "premium") {
    setError(null);
    const res = await fetch("/api/payments/create-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = (await res.json()) as { invoice_url?: string; error?: string };
    if (!res.ok || !data.invoice_url) {
      setError(data.error || "Failed to create invoice");
      return;
    }
    window.location.href = data.invoice_url;
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Pricing</h1>
      <p className="mt-2 text-slate-400">Crypto checkout via NowPayments. Each payment grants 30 days.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="glass-panel p-5">
          <h2 className="text-xl font-semibold text-white">Free</h2>
          <p className="mt-1 text-sm text-slate-400">Basic widget, default branding.</p>
          <p className="mt-4 text-2xl font-bold">$0</p>
        </div>
        <div className="glass-panel border-indigo-400/30 p-5 ring-1 ring-indigo-500/20">
          <h2 className="text-xl font-semibold text-white">Pro</h2>
          <p className="mt-1 text-sm text-slate-400">customTheme + analytics</p>
          <p className="mt-4 text-2xl font-bold">$9/mo</p>
          <button
            disabled={status !== "authenticated"}
            onClick={() => subscribe("pro")}
            className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 disabled:opacity-50"
          >
            Subscribe
          </button>
        </div>
        <div className="glass-panel border-indigo-400/30 p-5 ring-1 ring-indigo-500/20">
          <h2 className="text-xl font-semibold text-white">Premium</h2>
          <p className="mt-1 text-sm text-slate-400">All Pro + whiteLabel + voiceSync</p>
          <p className="mt-4 text-2xl font-bold">$29/mo</p>
          <button
            disabled={status !== "authenticated"}
            onClick={() => subscribe("premium")}
            className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 disabled:opacity-50"
          >
            Subscribe
          </button>
        </div>
      </div>

      {status !== "authenticated" ? (
        <p className="mt-4 text-sm text-amber-300">Login first to start checkout and receive license keys.</p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
    </main>
  );
}
