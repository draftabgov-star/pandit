import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="glass-panel max-w-2xl px-8 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-indigo-300">HQ Creator AI</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Living Face Widget Dashboard</h1>
        <p className="mt-5 text-slate-400">
          Generate and verify widget license keys, unlock premium feature flags, and monetize with crypto checkout.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/register" className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-900/30 hover:bg-indigo-500">
            Create account
          </Link>
          <Link href="/login" className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-slate-200 backdrop-blur hover:bg-white/10">
            Login
          </Link>
          <Link href="/pricing" className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-slate-200 backdrop-blur hover:bg-white/10">
            View pricing
          </Link>
        </div>
      </div>
    </main>
  );
}
