import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { PLAN_PRICE_USD } from "@/lib/feature-plans";
import { createInvoice } from "@/lib/nowpayments";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { plan?: "pro" | "premium" };
  try {
    body = (await req.json()) as { plan?: "pro" | "premium" };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const plan = body.plan;
  if (!plan || !(plan in PLAN_PRICE_USD)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const amount = PLAN_PRICE_USD[plan];
  const orderId = randomUUID();
  const base = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");

  await prisma.pendingPayment.create({
    data: {
      orderId,
      userId: session.user.id,
      amountUsd: amount,
      plan,
    },
  });

  try {
    const invoice = await createInvoice(
      amount,
      orderId,
      `Living Face ${plan} plan`,
      `${base}/dashboard?paid=true`,
      `${base}/pricing`,
    );
    return NextResponse.json({ invoice_url: invoice.invoice_url });
  } catch (error) {
    await prisma.pendingPayment.deleteMany({ where: { orderId } });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create invoice" },
      { status: 502 },
    );
  }
}
