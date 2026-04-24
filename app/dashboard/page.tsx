"use client";

import { useState } from "react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get("name"),
      birthDate: formData.get("birthDate"),
      birthTime: formData.get("birthTime"),
      birthLocation: formData.get("birthLocation"),
    };

    const res = await fetch("/api/horoscope", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    setResult(data);
    setLoading(false);
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Pandit AI Dashboard</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 400 }}>
        <input name="name" placeholder="Name" required />
        <input name="birthDate" type="date" required />
        <input name="birthTime" type="time" required />
        <input name="birthLocation" placeholder="Birth Location" required />

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Kundli"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>Result</h2>
          <p>Sign: {result.sign}</p>
          <p>Prediction: {result.prediction}</p>
          <p>Luck: {result.luck}</p>
          <p>Lucky Color: {result.luckyColor}</p>
          <p>Lucky Number: {result.luckyNumber}</p>
        </div>
      )}
    </main>
  );
}
