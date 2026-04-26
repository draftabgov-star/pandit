"use client";

import { useState } from "react";

type LicenseRow = {
  id: string;
  key: string;
  plan: string;
  features: string;
  widgetTooltipText: string | null;
  widgetPosition: string;
  widgetSize: string;
  widgetZIndex: number | null;
  widgetCustomCss: string | null;
};

type FormState = {
  tooltipText: string;
  position: string;
  size: "small" | "medium" | "large";
  zIndex: string;
  customCss: string;
};

const POSITIONS = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;

function toForm(l: LicenseRow): FormState {
  return {
    tooltipText: l.widgetTooltipText || "",
    position: l.widgetPosition || "bottom-right",
    size: (l.widgetSize as FormState["size"]) || "medium",
    zIndex: l.widgetZIndex ? String(l.widgetZIndex) : "",
    customCss: l.widgetCustomCss || "",
  };
}

export function LicenseCustomizePanel({ licenses }: { licenses: LicenseRow[] }) {
  const [forms, setForms] = useState<Record<string, FormState>>(
    Object.fromEntries(licenses.map((l) => [l.id, toForm(l)])),
  );
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const update = (id: string, patch: Partial<FormState>) => {
    setForms((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  async function save(license: LicenseRow) {
    const f = forms[license.id];
    if (!f) return;
    setBusyId(license.id);
    setMessages((m) => ({ ...m, [license.id]: "" }));
    const res = await fetch("/api/licenses/widget-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        licenseKey: license.key,
        tooltipText: f.tooltipText,
        position: f.position,
        size: f.size,
        zIndex: f.zIndex ? Number(f.zIndex) : null,
        customCss: f.customCss,
      }),
    });
    const data = (await res.json()) as { error?: string };
    setBusyId(null);
    if (!res.ok) {
      setMessages((m) => ({ ...m, [license.id]: data.error || "Failed to save" }));
      return;
    }
    setMessages((m) => ({ ...m, [license.id]: "Saved. Widget picks this up automatically." }));
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-white">Customize (white-label + placement)</h2>
      <p className="mt-1 text-sm text-slate-400">
        Configure tooltip text, placement, size, z-index, and custom CSS per license.
      </p>
      <div className="mt-4 space-y-4">
        {licenses.map((l) => {
          const f = forms[l.id];
          if (!f) return null;
          const isBusy = busyId === l.id;
          return (
            <div key={l.id} className="glass-panel p-4">
              <p className="text-xs text-slate-500">
                {l.plan.toUpperCase()} • <span className="font-mono">{l.key}</span>
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-sm">
                  <span className="text-slate-300">Custom tooltip text</span>
                  <input
                    value={f.tooltipText}
                    onChange={(e) => update(l.id, { tooltipText: e.target.value })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
                    placeholder="Assistant ready"
                  />
                </label>
                <label className="text-sm">
                  <span className="text-slate-300">Position</span>
                  <select
                    value={f.position}
                    onChange={(e) => update(l.id, { position: e.target.value })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
                  >
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  <span className="text-slate-300">Size</span>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={1}
                    value={{ small: 0, medium: 1, large: 2 }[f.size]}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      update(l.id, { size: (["small", "medium", "large"][idx] as FormState["size"]) || "medium" });
                    }}
                    className="mt-2 w-full"
                  />
                  <div className="mt-1 text-xs text-slate-400">{f.size}</div>
                </label>
                <label className="text-sm">
                  <span className="text-slate-300">z-index override</span>
                  <input
                    value={f.zIndex}
                    onChange={(e) => update(l.id, { zIndex: e.target.value })}
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
                    placeholder="2147483000"
                  />
                </label>
              </div>
              <label className="mt-3 block text-sm">
                <span className="text-slate-300">Custom CSS (advanced, shadow root scope)</span>
                <textarea
                  value={f.customCss}
                  onChange={(e) => update(l.id, { customCss: e.target.value })}
                  className="mt-1 h-28 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 font-mono text-xs"
                  placeholder=".orb { filter: saturate(1.2); }"
                />
              </label>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void save(l)}
                  className="rounded bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  Save customize settings
                </button>
                {messages[l.id] ? <span className="text-xs text-slate-300">{messages[l.id]}</span> : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
