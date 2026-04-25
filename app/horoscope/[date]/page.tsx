export async function generateStaticParams() {
  const dates = []
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= 28; d++) {
      dates.push({ date: `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
    }
  }
  return dates
}

export async function generateMetadata({ params }: { params: { date: string } }) {
  return {
    title: `Horoscope ${params.date} — Daily Rashifal & Astrology Predictions | OnlyPandit`,
    description: `Daily horoscope for ${params.date}. Love, career, and health predictions. Free AI-powered rashifal reading.`,
  }
}

const dailyPredictions = [
  "Today the Moon aligns with Jupiter — a day of unexpected blessings. Trust your intuition in financial matters.",
  "Mercury's energy brings clarity to communication. A conversation today changes your path.",
  "Venus showers love on those who are patient. Wait before reacting emotionally.",
  "Mars fuels your drive. Start that project you've been delaying — the stars support action.",
  "Saturn demands discipline. Hard work today pays off tenfold next month.",
  "The Sun illuminates your career sector. A superior notices your contribution.",
  "Rahu creates illusions — don't believe everything you hear today.",
  "Ketu guides toward spirituality. A meditation session reveals answers.",
]

export default function DatePage({ params }: { params: { date: string } }) {
  const seed = params.date.split('-').join('') 
  const prediction = dailyPredictions[parseInt(seed) % dailyPredictions.length]

  return (
    <main className="min-h-screen bg-[#030305] text-white p-6 md:p-12 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4">
        Daily Horoscope — {params.date}
      </h1>
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 mb-8">
        <p className="text-xl leading-relaxed text-gray-200">{prediction}</p>
      </div>
      <div className="text-center">
        <a href="/dashboard" className="inline-block bg-amber-500 text-black font-bold py-3 px-6 rounded-xl">
          Get Personal Reading →
        </a>
      </div>
    </main>
  )
}
