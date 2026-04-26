'use client'

import { useEffect } from 'react'

type Props = {
  onUnlock: () => void
}

export default function Paywall({ onUnlock }: Props) {
  useEffect(() => {
    fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'paywall_view' }),
    })
  }, [])

  const handleUnlock = async () => {
    await fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'unlock_click' }),
    })

    onUnlock()
  }

  return (
    <div className="relative mt-8 rounded-2xl overflow-hidden">
      <div className="blur-md opacity-30 p-6 space-y-2 select-none">
        <p>The hidden truth is blocked...</p>
        <p>Someone close to you is not fully honest.</p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
        <button
          onClick={handleUnlock}
          className="bg-amber-500 text-black font-bold px-6 py-3 rounded-xl"
        >
          Unlock Premium
        </button>
      </div>
    </div>
  )
}
