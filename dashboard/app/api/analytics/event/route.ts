import { NextResponse } from "next/server";
import { checkAnalyticsRateLimit } from "@/lib/analytics-rate-limit";
import { prisma } from "@/lib/prisma";

const ALLOWED_MOODS = new Set(["neutral", "happy", "thinking", "concerned", "excited", "sleepy"]);

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  };
}

function parseFeatures(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function sanitizeDomain(d: string | undefined): string | null {
  if (!d) return null;
  const s = d.trim().toLowerCase().slice(0, 253);
  if (!/^[a-z0-9.-]+$/.test(s)) return null;
  return s;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  let body: { licenseKey?: string; domain?: string; mood?: string; timestamp?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: corsHeaders() });
  }

  const licenseKey = (body.licenseKey || "").trim();
  const mood = (body.mood || "").trim().toLowerCase();
  const domain = sanitizeDomain(body.domain);
  const tsRaw = body.timestamp;

  if (!licenseKey || !mood || !ALLOWED_MOODS.has(mood)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400, headers: corsHeaders() });
  }

  const ip = clientIp(req);
  if (!checkAnalyticsRateLimit(licenseKey, ip)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: corsHeaders() });
  }

  const license = await prisma.license.findUnique({ where: { key: licenseKey } });
  if (!license || license.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Invalid license" }, { status: 403, headers: corsHeaders() });
  }

  const features = parseFeatures(license.features);
  if (!features.analytics) {
    return NextResponse.json({ error: "Analytics not enabled" }, { status: 403, headers: corsHeaders() });
  }

  let at = new Date();
  if (tsRaw) {
    const parsed = new Date(tsRaw);
    if (!Number.isNaN(parsed.getTime())) at = parsed;
  }

  await prisma.moodEvent.create({
    data: {
      licenseId: license.id,
      mood,
      domain,
      timestamp: at,
    },
  });

  return NextResponse.json({ ok: true }, { headers: corsHeaders() });
}
