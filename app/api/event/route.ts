import { NextRequest, NextResponse } from 'next/server'

// In-memory store (replace with DB when you scale)
const events: Array<{ type: string; data?: any; time: string; ip?: string }> = []

export async function POST(req: NextRequest) {
  const { type, data } = await req.json()
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  
  events.push({ type, data, time: new Date().toISOString(), ip })
  
  // Keep last 1000 events only
  if (events.length > 1000) events.shift()
  
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const stats = {
    total: events.length,
    paywallViews: events.filter(e => e.type === 'paywall_view').length,
    unlockClicks: events.filter(e => e.type === 'unlock_click').length,
    paymentsStarted: events.filter(e => e.type === 'payment_started').length,
    paymentsConfirmed: events.filter(e => e.type === 'payment_confirmed').length,
    readingsGenerated: events.filter(e => e.type === 'reading_generated').length,
    emailsCaptured: events.filter(e => e.type === 'email_captured').length,
    recent: events.slice(-50),
  }
  
  return NextResponse.json(stats)
}
