"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

const PRESETS = [
  { id: "default", label: "Default (indigo)" },
  { id: "ocean", label: "Ocean" },
  { id: "sunset", label: "Sunset" },
  { id: "neon", label: "Neon" },
  { id: "forest", label: "Forest" },
];

function ThemeEditorInner() {
  const searchParams = useSearchParams();
  const [licenseKey, setLicenseKey] = useState("");
  const [accentHex, setAccentHex] = useState("#6366f1");
  const [deepHex, setDeepHex] = useState("#312e81");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get("key");
    if (q) setLicenseKey(q);
  }, [searchParams]);

  useEffect(() => {
    if (!licenseKey) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/licenses/theme-config?licenseKey=${encodeURIComponent(licenseKey)}`);
      const data = (await res.json()) as { error?: string; accentHex?: string; deepHex?: string };
      if (cancelled || !res.ok) return;
      setAccentHex(data.accentHex?.trim() || "#6366f1");
      setDeepHex(data.deepHex?.trim() || "#312e81");
    })();
    return () => {
      cancelled = true;
    };
  }, [licenseKey]);

  async function applyPreset(preset: string) {
    setError(null);
    setMessage(null);
    setLoading(true);
    const res = await fetch("/api/licenses/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey, preset }),
    });
    const data = (await res.json()) as { error?: string; ok?: boolean };
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to update theme");
      return;
    }
    setMessage(`Preset set to “${preset}”. Custom image cleared if any.`);
  }

  async function saveColors() {
    setError(null);
    setMessage(null);
    setLoading(true);
    const res = await fetch("/api/licenses/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey, accentHex, deepHex }),
    });
    const data = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to save colors");
      return;
    }
    setMessage("Orb gradient colors saved. Reload an embedded page to see updates.");
  }

  async function clearColors() {
    setError(null);
    setMessage(null);
    setLoading(true);
    const res = await fetch("/api/licenses/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey, accentHex: "", deepHex: "" }),
    });
    const data = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to clear colors");
      return;
    }
    setMessage("Color overrides cleared (preset gradient only).");
  }

  async function resetAll() {
    setError(null);
    setMessage(null);
    setLoading(true);
    const res = await fetch("/api/licenses/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey, reset: true }),
    });
    const data = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to reset");
      return;
    }
    setAccentHex("#6366f1");
    setDeepHex("#312e81");
    setMessage("Reset to default theme, colors, and removed custom image.");
  }

  async function onUpload(file: File) {
    setError(null);
    setMessage(null);
    setLoading(true);
    const fd = new FormData();
    fd.set("licenseKey", licenseKey);
    fd.set("file", file);
    const res = await fetch("/api/licenses/theme/upload", {
      method: "POST",
      body: fd,
    });
    const data = (await res.json()) as { error?: string; url?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    setMessage(`Uploaded. Theme URL: ${data.url}`);
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link href="/dashboard" className="text-sm text-indigo-300 hover:text-indigo-200">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Orb theme</h1>
      <p className="mt-2 text-sm text-slate-400">
        Requires a license with <span className="font-mono text-indigo-200">customTheme</span> (Pro or Premium).
        The widget loads this on every page init via{" "}
        <code className="rounded bg-slate-950/80 px-1 font-mono">GET /api/licenses/theme?key=…</code>.
      </p>

      <div className="glass-panel mt-6 p-5">
        <label className="block text-sm text-slate-300">
          License key
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 font-mono text-xs text-white backdrop-blur"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value.trim())}
            placeholder="HQ-…"
          />
        </label>
      </div>

      <section className="glass-panel mt-8 p-5">
        <h2 className="text-lg font-semibold text-white">Preset colour themes</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={loading || !licenseKey}
              onClick={() => void applyPreset(p.id)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 backdrop-blur hover:bg-white/10 disabled:opacity-40"
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section className="glass-panel mt-8 p-5">
        <h2 className="text-lg font-semibold text-white">Custom orb gradient</h2>
        <p className="mt-1 text-xs text-slate-500">
          Two stops for the radial gradient (accent + deep). Saved per license; image upload still takes priority.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-300">
            Accent
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={accentHex}
                onChange={(e) => setAccentHex(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-white/10 bg-transparent"
              />
              <input
                className="flex-1 rounded-lg border border-white/10 bg-slate-950/50 px-2 py-2 font-mono text-xs text-white"
                value={accentHex}
                onChange={(e) => setAccentHex(e.target.value)}
              />
            </div>
          </label>
          <label className="text-sm text-slate-300">
            Deep
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={deepHex}
                onChange={(e) => setDeepHex(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-white/10 bg-transparent"
              />
              <input
                className="flex-1 rounded-lg border border-white/10 bg-slate-950/50 px-2 py-2 font-mono text-xs text-white"
                value={deepHex}
                onChange={(e) => setDeepHex(e.target.value)}
              />
            </div>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || !licenseKey}
            onClick={() => void saveColors()}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
          >
            Save colors
          </button>
          <button
            type="button"
            disabled={loading || !licenseKey}
            onClick={() => void clearColors()}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-40"
          >
            Clear color overrides
          </button>
        </div>
      </section>

      <section className="glass-panel mt-8 p-5">
        <h2 className="text-lg font-semibold text-white">Custom image (PNG or SVG)</h2>
        <p className="mt-1 text-xs text-slate-500">Max 800KB. Shown as the orb background; eyes and mouth stay on top.</p>
        <input
          type="file"
          accept="image/png,image/svg+xml"
          disabled={loading || !licenseKey}
          className="mt-3 block w-full text-sm text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-sm file:text-white"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onUpload(f);
            e.target.value = "";
          }}
        />
      </section>

      <section className="glass-panel mt-8 p-5">
        <button
          type="button"
          disabled={loading || !licenseKey}
          onClick={() => void resetAll()}
          className="rounded-xl border border-red-500/40 bg-red-950/25 px-4 py-2 text-sm text-red-100 hover:bg-red-950/40 disabled:opacity-40"
        >
          Reset to default
        </button>
        <p className="mt-2 text-xs text-slate-500">Clears custom image, colors, and sets preset to Default.</p>
      </section>

      {message ? <p className="mt-6 text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="mt-6 text-sm text-red-400">{error}</p> : null}
    </main>
  );
}

export default function ThemePage() {
  return (
    <Suspense fallback={<div className="p-10 text-slate-400">Loading…</div>}>
      <ThemeEditorInner />
    </Suspense>
  );
}
