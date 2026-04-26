"use client";

import { Chart, registerables } from "chart.js";
import { useEffect, useRef } from "react";

Chart.register(...registerables);

const MOOD_ORDER = ["neutral", "happy", "thinking", "concerned", "excited", "sleepy"] as const;
const COLORS: Record<string, string> = {
  neutral: "#94a3b8",
  happy: "#22c55e",
  thinking: "#f59e0b",
  concerned: "#ef4444",
  excited: "#a855f7",
  sleepy: "#64748b",
};

export function MoodDistributionBar(props: {
  counts: Record<string, number>;
  onSelectMood?: (mood: string | null) => void;
  selectedMood: string | null;
}) {
  const { counts, onSelectMood, selectedMood } = props;
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    chartRef.current?.destroy();

    const labels = [...MOOD_ORDER];
    const data = labels.map((m) => counts[m] || 0);
    const backgroundColor = labels.map((m) => COLORS[m] || "#64748b");

    chartRef.current = new Chart(canvas, {
      type: "bar",
      data: {
        labels: labels.map((m) => m.charAt(0).toUpperCase() + m.slice(1)),
        datasets: [
          {
            label: "Events",
            data,
            backgroundColor: labels.map((m, i) =>
              selectedMood === m ? backgroundColor[i] : `${backgroundColor[i]}99`,
            ),
            borderColor: labels.map((m) => (selectedMood === m ? "#e2e8f0" : "transparent")),
            borderWidth: labels.map((m) => (selectedMood === m ? 2 : 0)),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { intersect: true },
        },
        scales: {
          x: {
            ticks: { color: "#94a3b8", font: { size: 11 } },
            grid: { color: "rgba(148,163,184,0.12)" },
          },
          y: {
            beginAtZero: true,
            ticks: { color: "#94a3b8", precision: 0 },
            grid: { color: "rgba(148,163,184,0.12)" },
          },
        },
        onClick(_, elements) {
          if (!onSelectMood) return;
          if (!elements.length) {
            onSelectMood(null);
            return;
          }
          const idx = elements[0].index;
          const mood = labels[idx];
          onSelectMood(selectedMood === mood ? null : mood);
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [counts, onSelectMood, selectedMood]);

  return (
    <div className="relative h-56 w-full">
      <canvas ref={ref} className="max-h-56 w-full" />
    </div>
  );
}
