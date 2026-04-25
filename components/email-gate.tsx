'use client'
import { useState } from 'react'

export function EmailGate({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [email, setEmail] = useState('')

  return (
    <div className="bg-white/[0.03] border border-amber-500/20 rounded-2xl p-8 text-center">
      <h3 className="text-2xl font-bold mb-2">Your Reading Is Ready</h3>
      <p className="text-gray-400 mb-6">Enter your email to reveal your destiny</p>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white mb-4"
        required
      />
      <button
        onClick={() => email.includes('@') && onSubmit(email)}
        className="w-full bg-amber-500 text-black font-bold py-3 rounded-xl"
      >
        Reveal My Truth
      </button>
      <p className="text-gray-600 text-xs mt-4">We respect your privacy. Unsubscribe anytime.</p>
    </div>
  )
}
