import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { amount } = await req.json()
  
  const res = await fetch('https://api.nowpayments.io/v1/payment', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price_amount: amount,
      price_currency: 'usd',
      pay_currency: 'btc',
      order_id: `pandit-${Date.now()}`,
      order_description: 'OnlyPandit Premium Reading',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?paid=success`,
    }),
  })

  const data = await res.json()
  return NextResponse.json({ paymentUrl: data.payment_url })
}
