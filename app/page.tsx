import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#030305] text-white">
      <section className="flex flex-col items-center justify-center px-6 py-24 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-amber-300 text-sm font-medium">AI Vedic Astrologer</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
          Your Destiny Is <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500">
            Written In The Stars
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
          12,847 people discovered their hidden truth this week. Our AI Pandit reads what the universe has been trying to tell you.
        </p>
        <Link href="/dashboard" className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold py-4 px-8 rounded-xl text-lg hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]">
          Reveal My Truth →
        </Link>
        <p className="text-gray-600 text-sm mt-4">Free reading • 30 seconds • No signup required</p>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        {[
          { icon: "🔮", title: "Hidden Truth Revealed", desc: "Our AI sees patterns in your birth chart that human astrologers miss." },
          { icon: "⚡", title: "Instant Results", desc: "No waiting. No appointments. Your personalized reading in 30 seconds." },
          { icon: "🔒", title: "Private & Secure", desc: "Your destiny is personal. We never share your birth details." },
        ].map((f) => (
          <div key={f.title} className="bg-white/[0.03] border border-white/[0.08] p-8 rounded-2xl">
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
