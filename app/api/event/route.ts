import { NextRequest, NextResponse } from 'next/server'

const events: any[] = []

export async function POST(req: NextRequest) {
  const { type, data } = await req.json()
  events.push({ type, data, time: new Date() })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ events })
}
