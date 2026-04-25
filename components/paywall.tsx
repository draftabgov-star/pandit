'use client'
import { useEffect } from 'react'

export function Paywall({ onUnlock }: { onUnlock: () => void }) {
  // Track when paywall is viewed
  useEffect(() => {
    fetch('/api/event', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'paywall_view' }) 
    })
  }, [])

  const handleUnlock = async () => {
    // Track click before redirecting
    await fetch('/api/event', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'unlock_click' }) 
    })
    onUnlock()
  }

  return (
    <div className="relative mt-8 rounded-2xl overflow-hidden">
      <div className="blur-md opacity-30 select-none pointer-events-none p-6 space-y-3">
        <p className="text-lg text-gray-200">The hidden truth reveals a pattern you have ignored for years...</p>
        <p className="text-lg text-gray-200">Someone close to you is not who they appear to be.</p>
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md">
        <div className="text-center p-6">
          <p className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-2">🔒 Premium Insight Locked</p>
          <h3 className="text-2xl font-bold mb-2">Your Hidden Truth Awaits</h3>
          <p className="text-gray-400 text-sm mb-2">12,847 people unlocked theirs today</p>
          
          <div className="flex items-center justify-center gap-2 text-xs text-red-400 mb-6">
            <span className="animate-pulse">●</span>
            <span>Limited readings remaining this hour</span>
          </div>

          <button 
            onClick={handleUnlock}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold py-3 px-8 rounded-xl hover:scale-105 transition-transform shadow-lg"
          >
            Unlock Full Reading — $4.99
          </button>
        </div>
      </div>
    </div>
  )
}
