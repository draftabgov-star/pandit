'use client'

import { useEffect } from 'react'

type Props = {
  onUnlock: () => void
}

export function Paywall({ onUnlock }: Props) {
  useEffect(() => {
    fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'paywall_view' })
    })
  }, [])

  const handleUnlock = async () => {
    await fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'unlock_click' })
    })

    onUnlock()
  }

  return (
    <div className="relative mt-8 rounded-2xl overflow-hidden">
      <div className="blur-md opacity-30 p-6 space-y-3 pointer-events-none">
        <p>The hidden truth reveals something about your life...</p>
        <p>Someone close may not be honest with you.</p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
        <button
          onClick={handleUnlock}
          className="bg-amber-500 text-black px-6 py-3 rounded-xl font-bold"
        >
          Unlock Reading — $4.99
        </button>
      </div>
    </div>
  )
}
