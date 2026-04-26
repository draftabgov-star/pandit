'use client'

import { useState } from 'react'
import Link from 'next/link'
import Paywall from '@/components/paywall'
import WhatsAppShare from '@/components/whatsapp-share'

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
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    question: 'general'
  })

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
      
      {/* Top Bar */}
      <div className="border-b border-white/5 bg-[#030305]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-amber-400 font-bold text-lg">
            ← OnlyPandit
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">

        {!result ? (
          <>
            {/* FORM */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text">
                Reveal Your Hidden Truth
              </h1>
              <p className="text-gray-400 mt-2">
                Enter birth details to unlock destiny
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <input
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  className="bg-white/5 border border-white/10 p-4 rounded-xl"
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  required
                />

                <input
                  type="time"
                  className="bg-white/5 border border-white/10 p-4 rounded-xl"
                  value={form.birthTime}
                  onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
                />
              </div>

              <input
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl"
                placeholder="Birth Location"
                value={form.birthLocation}
                onChange={(e) => setForm({ ...form, birthLocation: e.target.value })}
              />

              <button
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold p-4 rounded-xl"
              >
                {loading ? 'Calculating...' : '🔮 Reveal Destiny'}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* RESULT */}
            <div className="text-center p-6 border border-amber-500/20 rounded-2xl">
              <h2 className="text-3xl text-amber-400 font-bold">{result.sign}</h2>
              <p className="text-gray-400">Ruled by {result.rulingPlanet}</p>
            </div>

            <div className="mt-6 p-6 bg-white/5 rounded-2xl">
              <p>{result.prediction}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 text-center">
              <div>{result.luckyColor}</div>
              <div>{result.luckyNumber}</div>
              <div>{result.remedy}</div>
            </div>

            {!unlocked ? (
              <Paywall onUnlock={() => setUnlocked(true)} />
            ) : (
              <div className="mt-6 p-6 border border-purple-500/30 rounded-2xl">
                {result.hiddenTruth}
              </div>
            )}

            <div className="mt-6 text-center">
              <WhatsAppShare name={form.name} sign={result.sign} />
            </div>
          </>
        )}
      </div>
    </main>
  )
}
