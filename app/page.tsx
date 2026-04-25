import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Pandit <span className="text-amber-500">AI</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-10">
          Ancient Vedic wisdom meets modern AI. Get instant kundli analysis, daily horoscope, and birth chart predictions.
        </p>
        <Link 
          href="/dashboard" 
          className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-4 px-8 rounded-lg text-lg transition-colors"
        >
          Get Your Reading →
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        {[
          { icon: "🪐", title: "Kundli Analysis", desc: "Detailed birth chart based on date, time, and location" },
          { icon: "🔮", title: "Daily Horoscope", desc: "AI-generated predictions for all 12 zodiac signs" },
          { icon: "⭐", title: "Lucky Insights", desc: "Personalized lucky numbers, colors, and guidance" },
        ].map((f) => (
          <div key={f.title} className="bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="font-bold text-xl mb-3">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* SEO Text */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Online Pandit for Kundli & Horoscope</h2>
        <p className="text-gray-400 leading-relaxed">
          Pandit AI brings authentic Vedic astrology to your fingertips. Whether you need a 
          <strong> kundli reading</strong>, <strong>daily rashifal</strong>, or 
          <strong> birth chart analysis</strong>, our AI pandit delivers instant, 
          personalized predictions. Consult the digital pandit for marriage compatibility, 
          career guidance, and spiritual insights based on ancient jyotish principles.
        </p>
      </section>
    </main>
  )
}
