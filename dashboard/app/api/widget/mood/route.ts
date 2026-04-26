import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_MOODS = new Set(["neutral", "happy", "thinking", "concerned", "excited", "sleepy"]);

export async function POST(req: Request) {
  let body: {
    licenseKey?: string;
    mood?: string;
    ttlSeconds?: number;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const licenseKey = (body.licenseKey || "").trim();
  const mood = (body.mood || "").trim().toLowerCase();
  const ttlSeconds = Math.max(5, Math.min(3600, Number(body.ttlSeconds || 60)));

  if (!licenseKey || !ALLOWED_MOODS.has(mood)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const license = await prisma.license.findUnique({
    where: { key: licenseKey },
    select: { id: true, expiresAt: true },
  });
  if (!license || license.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Invalid license" }, { status: 403 });
  }

  await prisma.license.update({
    where: { id: license.id },
    data: {
      forcedMood: mood,
      forcedMoodUntil: new Date(Date.now() + ttlSeconds * 1000),
    },
  });

  return NextResponse.json({ ok: true, mood, ttlSeconds });
}
