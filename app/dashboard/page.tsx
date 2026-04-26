'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Paywall } from '@/components/paywall'
import { WhatsAppShare } from '@/components/whatsapp-share'

interface Result {
  sign: string
  rulingPlanet: string
  prediction: string
  hiddenTruth: string
  luckyColor: string
  luckyNumber: number
  remedy: string
}

export default function Dashboard() {
  const [form, setForm] = useState({ name: '', birthDate: '', birthTime: '', birthLocation: '', question: 'general' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [unlocked, setUnlocked] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.birthDate) return
    setLoading(true)
    try {
      const res = await fetch('/api/horoscope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      setResult(data)
      setUnlocked(false)
    } catch {
      alert('Failed. Try again.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#030305] text-white">
      <div className="border-b border-white/5 bg-[#030305]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-amber-400 hover:text-amber-300 font-bold text-lg">← OnlyPandit</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {!result ? (
          <>
            <div className="mb-10 text-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent mb-3">
                Reveal Your Hidden Truth
              </h1>
              <p className="text-gray-400">Enter your birth details. Our AI Pandit sees what others cannot.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                placeholder="Your Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:border-amber-500/50 outline-none"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white focus:border-amber-500/50 outline-none"
                  required
                />
                <input
                  type="time"
                  value={form.birthTime}
                  onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white focus:border-amber-500/50 outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Birth Location"
                value={form.birthLocation}
                onChange={(e) => setForm({ ...form, birthLocation: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:border-amber-500/50 outline-none"
              />
              <select
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white focus:border-amber-500/50 outline-none"
              >
                <option value="general" className="bg-gray-900">General Reading</option>
                <option value="love" className="bg-gray-900">Love & Relationships</option>
                <option value="career" className="bg-gray-900">Career & Money</option>
                <option value="betrayal" className="bg-gray-900">Betrayal & Trust</option>
                <option value="health" className="bg-gray-900">Health & Wellness</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold py-4 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]"
              >
                {loading ? 'Consulting the Stars...' : '🔮 Reveal My Destiny'}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-6">
            <button onClick={() => setResult(null)} className="text-gray-500 hover:text-white text-sm">← New Reading</button>
            
            <div className="bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 rounded-3xl p-8 text-center">
              <h2 className="text-4xl font-bold text-amber-400 mb-1">{result.sign}</h2>
              <p className="text-gray-400">Ruled by {result.rulingPlanet}</p>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <h3 className="text-amber-400 font-bold mb-3">Your Reading</h3>
              <p className="text-gray-200 leading-relaxed text-lg">{result.prediction}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-center">
                <p className="text-gray-500 text-xs uppercase">Color</p>
                <p className="text-xl font-bold text-amber-400">{result.luckyColor}</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-center">
                <p className="text-gray-500 text-xs uppercase">Number</p>
                <p className="text-xl font-bold text-amber-400">{result.luckyNumber}</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-center">
                <p className="text-gray-500 text-xs uppercase">Remedy</p>
                <p className="text-sm font-bold text-amber-400">{result.remedy}</p>
              </div>
            </div>

            {!unlocked ? (
              <Paywall onUnlock={() => setUnlocked(true)} />
            ) : (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                <h3 className="text-purple-400 font-bold mb-2">🔮 Hidden Truth Unlocked</h3>
                <p className="text-gray-200 leading-relaxed">{result.hiddenTruth}</p>
              </div>
            )}

            <div className="text-center pt-4">
              <WhatsAppShare name={form.name} sign={result.sign} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
