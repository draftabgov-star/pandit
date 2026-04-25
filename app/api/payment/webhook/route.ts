import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-nowpayments-sig')

  const expected = crypto
    .createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET!)
    .update(body)
    .digest('hex')

  if (signature !== expected) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const data = JSON.parse(body)

  if (data.payment_status === 'finished') {
    // Log confirmed payment (replace with DB update when ready)
    console.log('✅ Payment confirmed:', data.payment_id, 'Amount:', data.price_amount)
    
    // TODO: When you add DB, update report status here:
    // await db.payment.updateMany({
    //   where: { nowpaymentsId: data.payment_id },
    //   data: { status: 'confirmed' }
    // })
  }

  return NextResponse.json({ received: true })
}
