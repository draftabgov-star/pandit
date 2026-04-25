'use client'

import { useState } from 'react'

export function Paywall({ onUnlock }: { onUnlock: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="relative mt-8 rounded-2xl overflow-hidden">
      <div className="blur-md opacity-30 select-none pointer-events-none p-6 space-y-3">
        <p className="text-lg text-gray-200">The hidden truth reveals a pattern you have ignored for years...</p>
        <p className="text-lg text-gray-200">Someone close to you is not who they appear to be.</p>
        <p className="text-lg text-gray-200">Your ruling planet shifts in 14 days. This changes everything.</p>
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

          <div className="flex flex-col gap-3">
            <button 
              onClick={onUnlock}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className={`bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold py-3 px-8 rounded-xl transition-all ${hovered ? 'scale-105 shadow-[0_0_30px_rgba(245,158,11,0.4)]' : 'shadow-lg'}`}
            >
              Unlock Full Reading — $4.99
            </button>
            <button className="text-gray-500 text-sm hover:text-white transition-colors">
              Unlock Deep Analysis — $7.99
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
