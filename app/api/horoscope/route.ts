import { NextRequest, NextResponse } from 'next/server'

const PREDICTIONS: Record<string, string> = {
  general: "The cosmos whispers your name. A planetary shift in your 7th house signals transformation. What you seek is seeking you — but from an unexpected direction.",
  love: "Venus dances in your favor. Someone from your past returns with unfinished business. Your heart knows the truth before your mind accepts it.",
  career: "Saturn rewards discipline. A financial opportunity disguised as risk arrives Thursday. Say yes before doubt creeps in.",
  betrayal: "Rahu casts shadows. Someone you trust wears two faces. The signs have been there — your intuition tried to warn you. Distance yourself before the eclipse.",
  health: "The Moon governs your vitality. Sleep is your medicine this month. A 21-day ritual will reset your energy field completely.",
}

const REMEDIES = [
  "Light a mustard oil lamp facing east for 7 days.",
  "Chant 'Om Namah Shivaya' 108 times before sunrise.",
  "Wear copper on your dominant wrist.",
  "Donate yellow food to a temple on Thursday.",
  "Meditate under moonlight for 11 minutes.",
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, birthDate, question } = body
    
    if (!name || !birthDate) {
      return NextResponse.json({ error: 'Required' }, { status: 400 })
    }

    const date = new Date(birthDate)
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    const signs = ['Capricorn','Aquarius','Pisces','Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius']
    const planets = ['Saturn','Uranus','Neptune','Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Pluto','Jupiter']
    
    let signIndex = 0
    if ((month === 1 && day <= 19) || (month === 12 && day >= 22)) signIndex = 0
    else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) signIndex = 1
    else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) signIndex = 2
    else if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) signIndex = 3
    else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) signIndex = 4
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) signIndex = 5
    else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) signIndex = 6
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) signIndex = 7
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) signIndex = 8
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) signIndex = 9
    else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) signIndex = 10
    else signIndex = 11

    const seed = name.length + month + day
    const q = question || 'general'

    return NextResponse.json({
      sign: signs[signIndex],
      rulingPlanet: planets[signIndex],
      prediction: PREDICTIONS[q] || PREDICTIONS.general,
      hiddenTruth: "The person you think about before sleep holds the key to your next chapter. They appear in your dreams for a reason. The universe does not send accidental connections.",
      luckyColor: ['Red','Blue','Green','Gold','White','Purple'][seed % 6],
      luckyNumber: (seed % 99) + 1,
      remedy: REMEDIES[seed % REMEDIES.length],
    })

  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
