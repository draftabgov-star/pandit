import crypto from "crypto";
import { NextResponse } from "next/server";
import { getFeatureByPlan } from "@/lib/feature-plans";
import { generateLicenseKey } from "@/lib/license";
import { prisma } from "@/lib/prisma";

function sortedStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(sortedStringify).join(",")}]`;

  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
  return `{${keys.map((k) => `${JSON.stringify(k)}:${sortedStringify(obj[k])}`).join(",")}}`;
}

function verifySignature(body: Record<string, unknown>, sig: string | null): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET?.trim();
  if (!secret || !sig) return false;
  const digest = crypto.createHmac("sha512", secret).update(sortedStringify(body)).digest("hex");
  return digest === sig;
}

export async function POST(req: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sig = req.headers.get("x-nowpayments-sig");
  if (!verifySignature(payload, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const paymentStatus = String(payload.payment_status || "").toLowerCase();
  const orderId = String(payload.order_id || "");
  if (!orderId || (paymentStatus !== "finished" && paymentStatus !== "confirmed")) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const existing = await prisma.license.findFirst({ where: { paidOrderId: orderId } });
  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const pending = await prisma.pendingPayment.findUnique({ where: { orderId } });
  if (!pending) return NextResponse.json({ ok: true, ignored: true });

  const features = getFeatureByPlan(pending.plan);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  try {
    await prisma.$transaction([
      prisma.license.create({
        data: {
          key: generateLicenseKey(),
          userId: pending.userId,
          plan: pending.plan,
          features: JSON.stringify(features),
          expiresAt,
          activatedAt: new Date(),
          paidOrderId: orderId,
        },
      }),
      prisma.pendingPayment.delete({ where: { orderId } }),
    ]);
  } catch {
    const dup = await prisma.license.findFirst({ where: { paidOrderId: orderId } });
    if (dup) return NextResponse.json({ ok: true, duplicate: true });
    return NextResponse.json({ error: "License creation failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
