"use client";

import { useCallback, useMemo, useState } from "react";
import { MoodDistributionBar } from "@/components/mood-distribution-bar";

export type AnalyticsLicense = { id: string; label: string; plan: string };
export type AnalyticsEvent = {
  id: string;
  mood: string;
  domain: string | null;
  timestamp: string;
  licenseId: string;
};

const MOOD_COLORS: Record<string, string> = {
  neutral: "#94a3b8",
  happy: "#22c55e",
  thinking: "#f59e0b",
  concerned: "#ef4444",
  excited: "#a855f7",
  sleepy: "#64748b",
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} Z`;
}

function dayKeyUTC(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function AnalyticsDashboard(props: {
  licenses: AnalyticsLicense[];
  events: AnalyticsEvent[];
  hasAgencyExport: boolean;
}) {
  const { licenses, events: rawEvents, hasAgencyExport } = props;
  const [licenseFilter, setLicenseFilter] = useState<string>("all");
  const [hoverMood, setHoverMood] = useState<string | null>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);

  const events = useMemo(() => {
    if (licenseFilter === "all") return rawEvents;
    return rawEvents.filter((e) => e.licenseId === licenseFilter);
  }, [rawEvents, licenseFilter]);

  const filteredForCharts = useMemo(() => {
    if (!selectedMood) return events;
    return events.filter((e) => e.mood === selectedMood);
  }, [events, selectedMood]);

  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { counts, total };
  }, [events]);

  const pieSlices = useMemo(() => {
    const { counts, total } = distribution;
    if (!total) return [];
    let angle = 0;
    return Object.entries(counts)
      .filter(([, n]) => n > 0)
      .map(([mood, n]) => {
        const sweep = (n / total) * 360;
        const start = angle;
        const end = angle + sweep;
        angle = end;
        return { mood, n, start, end };
      });
  }, [distribution]);

  const timeline = useMemo(() => {
    return [...filteredForCharts].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [filteredForCharts]);

  const dailySentiment = useMemo(() => {
    const byDay = new Map<string, { happy: number; concerned: number }>();
    for (const e of events) {
      const dk = dayKeyUTC(new Date(e.timestamp));
      const row = byDay.get(dk) || { happy: 0, concerned: 0 };
      if (e.mood === "happy") row.happy += 1;
      if (e.mood === "concerned") row.concerned += 1;
      byDay.set(dk, row);
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, { happy, concerned }]) => {
        const denom = happy + concerned;
        const score = denom === 0 ? null : Math.round((happy / denom) * 100);
        return { day, happy, concerned, score };
      });
  }, [events]);

  const onPieEnter = useCallback((m: string) => setHoverMood(m), []);
  const onPieLeave = useCallback(() => setHoverMood(null), []);
  const toggleMoodFilter = useCallback((m: string) => {
    setSelectedMood((prev) => (prev === m ? null : m));
  }, []);

  const cx = 110;
  const cy = 110;
  const r = 88;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Mood analytics</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Anonymous telemetry: mood labels and embedding site domain only. No personal data is stored (GDPR-friendly).
          </p>
        </div>
        <label className="flex flex-col gap-1 text-sm text-slate-300">
          <span>License</span>
          <select
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={licenseFilter}
            onChange={(e) => setLicenseFilter(e.target.value)}
          >
            <option value="all">All licenses</option>
            {licenses.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label} ({l.plan})
              </option>
            ))}
          </select>
        </label>
      </div>

      {events.length === 0 ? (
        <p className="glass-panel px-4 py-6 text-slate-400">
          No events yet. Enable analytics on a license and embed the widget; mood changes will appear here.
        </p>
      ) : null}

      {distribution.total > 0 ? (
        <section className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-white">Mood totals (Chart.js)</h2>
          <p className="mt-1 text-xs text-slate-500">Click a bar to toggle the same filter as the pie chart.</p>
          <div className="mt-4">
            <MoodDistributionBar
              counts={distribution.counts}
              selectedMood={selectedMood}
              onSelectMood={(m) => (m ? toggleMoodFilter(m) : setSelectedMood(null))}
            />
          </div>
        </section>
      ) : null}

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-white">Mood distribution</h2>
          <p className="mt-1 text-xs text-slate-500">Click a slice or legend row to filter the timeline below.</p>
          <div className="mt-4 flex flex-wrap items-center gap-8">
            <svg width={220} height={220} viewBox="0 0 220 220" className="shrink-0">
              {pieSlices.map((s) => {
                const dim = selectedMood && selectedMood !== s.mood;
                const glow = hoverMood === s.mood;
                return (
                  <path
                    key={s.mood}
                    d={arcPath(cx, cy, r, s.start, s.end)}
                    fill={MOOD_COLORS[s.mood] || "#64748b"}
                    opacity={dim ? 0.25 : glow ? 1 : 0.88}
                    stroke="#0f172a"
                    strokeWidth={hoverMood === s.mood ? 2 : 1}
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={() => onPieEnter(s.mood)}
                    onMouseLeave={onPieLeave}
                    onClick={() => toggleMoodFilter(s.mood)}
                  />
                );
              })}
            </svg>
            <ul className="min-w-[180px] space-y-2 text-sm">
              {pieSlices.map((s) => (
                <li key={s.mood}>
                  <button
                    type="button"
                    onClick={() => toggleMoodFilter(s.mood)}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left transition ${
                      selectedMood === s.mood ? "bg-indigo-900/50 ring-1 ring-indigo-500/40" : "hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="h-3 w-3 rounded-sm" style={{ background: MOOD_COLORS[s.mood] }} />
                    <span className="capitalize text-slate-200">{s.mood}</span>
                    <span className="ml-auto text-slate-500">
                      {s.n} ({distribution.total ? Math.round((s.n / distribution.total) * 100) : 0}%)
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {selectedMood ? (
            <p className="mt-3 text-xs text-indigo-300">
              Filtering timeline by <span className="capitalize">{selectedMood}</span>.{" "}
              <button type="button" className="underline" onClick={() => setSelectedMood(null)}>
                Clear
              </button>
            </p>
          ) : null}
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-white">Daily sentiment</h2>
          <p className="mt-1 text-xs text-slate-500">
            Score = happy / (happy + concerned) × 100 when both exist; click a bar to highlight that day on the timeline.
          </p>
          <div className="mt-6 h-44">
            <svg width="100%" height="100%" viewBox="0 0 400 160" preserveAspectRatio="none" className="overflow-visible">
              {dailySentiment.map((d, i) => {
                const w = 400 / Math.max(dailySentiment.length, 1);
                const x = i * w + 4;
                const barW = Math.max(w - 8, 4);
                const h = d.score == null ? 4 : (d.score / 100) * 120;
                const y = 140 - h;
                const active = activeDay === d.day;
                return (
                  <g key={d.day}>
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={Math.max(h, 4)}
                      rx={3}
                      fill={d.score == null ? "#334155" : d.score >= 50 ? "#22c55e" : "#ef4444"}
                      opacity={active ? 1 : activeDay && !active ? 0.35 : 0.85}
                      className="cursor-pointer"
                      onClick={() => setActiveDay((prev) => (prev === d.day ? null : d.day))}
                    />
                    <title>
                      {d.day}: score {d.score == null ? "n/a" : `${d.score}%`} (happy {d.happy}, concerned {d.concerned})
                    </title>
                  </g>
                );
              })}
              <line x1={0} y1={140} x2={400} y2={140} stroke="#475569" strokeWidth={1} />
            </svg>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {activeDay ? (
              <>
                Selected day: <span className="text-slate-300">{activeDay}</span>{" "}
                <button type="button" className="text-indigo-300 underline" onClick={() => setActiveDay(null)}>
                  clear
                </button>
              </>
            ) : (
              "Tip: hover bars for counts; click to filter timeline dots."
            )}
          </p>
        </div>
      </section>

      <section className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-white">Timeline</h2>
        <p className="mt-1 text-xs text-slate-500">Chronological mood changes (oldest left). Hover dots for details.</p>
        <div className="mt-4 overflow-x-auto pb-2">
          <svg height={120} width={Math.max(timeline.length * 14, 400)} className="min-w-full">
            {timeline.map((e, i) => {
              const day = dayKeyUTC(new Date(e.timestamp));
              const dimDay = activeDay && day !== activeDay;
              const x = 20 + i * 14;
              const mood = e.mood;
              const rDot = hoveredEventId === e.id ? 7 : 5;
              return (
                <g key={e.id} opacity={dimDay ? 0.2 : 1}>
                  <circle
                    cx={x}
                    cy={60}
                    r={rDot}
                    fill={MOOD_COLORS[mood] || "#64748b"}
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoveredEventId(e.id)}
                    onMouseLeave={() => setHoveredEventId(null)}
                  />
                  <title>
                    {new Date(e.timestamp).toLocaleString()} — {mood}
                    {e.domain ? ` @ ${e.domain}` : ""}
                  </title>
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      {hasAgencyExport ? (
        <section className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-white">CSV export (agency)</h2>
          <p className="mt-1 text-sm text-slate-400">Download anonymous events for reporting. Columns: timestamp, mood, domain, license_id.</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {licenses
              .filter((l) => l.plan === "agency")
              .map((l) => (
                <li key={l.id}>
                  <a
                    className="inline-block rounded-lg border border-indigo-500/50 bg-indigo-950/40 px-3 py-2 text-sm text-indigo-200 hover:bg-indigo-900/50"
                    href={`/api/analytics/export?licenseId=${encodeURIComponent(l.id)}`}
                  >
                    Export — {l.label}
                  </a>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
