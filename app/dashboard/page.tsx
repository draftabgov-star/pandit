'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Result {
  sign: string
  prediction: string
  luck: number
  luckyColor: string
  luckyNumber: number
}

export default function Dashboard() {
  const [form, setForm] = useState({ name: '', birthDate: '', birthTime: '', birthLocation: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

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
    } catch {
      alert('Failed. Try again.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 max-w-2xl mx-auto">
      <Link href="/" className="text-amber-500 hover:underline mb-6 block">← Back</Link>
      <h1 className="text-3xl font-bold mb-2">Pandit AI Reading</h1>
      <p className="text-gray-400 mb-8">Enter your birth details for instant kundli analysis</p>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg p-4 text-white placeholder-gray-600 focus:border-amber-500 outline-none"
          required
        />
        <input
          type="date"
          value={form.birthDate}
          onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg p-4 text-white focus:border-amber-500 outline-none"
          required
        />
        <input
          type="time"
          value={form.birthTime}
          onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg p-4 text-white focus:border-amber-500 outline-none"
        />
        <input
          type="text"
          placeholder="Birth Location (City, Country)"
          value={form.birthLocation}
          onChange={(e) => setForm({ ...form, birthLocation: e.target.value })}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg p-4 text-white placeholder-gray-600 focus:border-amber-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 text-black font-bold py-4 rounded-lg transition-colors"
        >
          {loading ? 'Consulting Pandit...' : 'Generate Kundli'}
        </button>
      </form>

      {result && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">♈</div>
            <h2 className="text-3xl font-bold text-amber-500 mb-2">{result.sign}</h2>
            <div className="text-5xl font-bold mb-4">{result.luck}%</div>
            <p className="text-gray-400">Luck Score</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-3 text-amber-500">Pandit's Prediction</h3>
            <p className="text-lg leading-relaxed">{result.prediction}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm mb-1">Lucky Color</p>
              <p className="text-xl font-bold">{result.luckyColor}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm mb-1">Lucky Number</p>
              <p className="text-xl font-bold">{result.luckyNumber}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
