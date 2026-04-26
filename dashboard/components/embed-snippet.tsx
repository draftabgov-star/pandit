"use client";

import { useState } from "react";

export function EmbedSnippet({ scriptUrl }: { scriptUrl: string }) {
  const snippet = `<script src="${scriptUrl}" data-hq-key="YOUR_LICENSE_KEY" async></script>`;
  const [msg, setMsg] = useState<string | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setMsg("Copied to clipboard.");
      window.setTimeout(() => setMsg(null), 2000);
    } catch {
      setMsg("Copy failed — select the snippet manually.");
    }
  }

  return (
    <div className="glass-panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-300">Embed snippet</p>
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
        >
          Copy embed code
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Replace <code className="rounded bg-slate-950/80 px-1 py-0.5 font-mono">YOUR_LICENSE_KEY</code> with your key.
        Script URL: <span className="break-all font-mono text-slate-400">{scriptUrl}</span>
      </p>
      <pre className="mt-3 max-h-40 overflow-x-auto overflow-y-auto rounded-lg border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-200">
        {snippet}
      </pre>
      {msg ? <p className="mt-2 text-xs text-emerald-300">{msg}</p> : null}
    </div>
  );
}
