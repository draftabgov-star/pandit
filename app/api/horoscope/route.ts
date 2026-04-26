import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, birthDate, birthTime, birthLocation, question } = await request.json()
    if (!name || !birthDate) return NextResponse.json({ error: 'Required' }, { status: 400 })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'AI unavailable' }, { status: 500 })

    const prompt = `You are a master Vedic astrologer with 40 years experience. 
Generate a personalized reading for ${name}, born ${birthDate} at ${birthTime || 'unknown'} in ${birthLocation || 'unknown'}.
Focus: ${question || 'general life'}.

Return STRICT JSON:
{
  "sign": "Zodiac sign",
  "rulingPlanet": "Planet name",
  "prediction": "2 emotional paragraphs about their focus area. Be specific, mysterious, and wise.",
  "hiddenTruth": "1 shocking, deeply personal insight that feels like you know them. Maximum curiosity gap.",
  "luckyColor": "Color",
  "luckyNumber": 7,
  "remedy": "Specific 1-sentence Upay they can do today"
}`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Expert Vedic astrologer. JSON only. Emotional, mysterious, specific.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.9,
      }),
    })

    const data = await res.json()
    const reading = JSON.parse(data.choices[0].message.content)

    return NextResponse.json(reading)

  } catch {
    return NextResponse.json({ error: 'Reading failed' }, { status: 500 })
  }
}
