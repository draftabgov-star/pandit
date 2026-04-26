import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  };
}

const ALLOWED_MOODS = new Set(["neutral", "happy", "thinking", "concerned", "excited", "sleepy"]);

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = (url.searchParams.get("key") || "").trim();
  const domain = (url.searchParams.get("domain") || "").trim().toLowerCase();

  if (!key) {
    return NextResponse.json(
      { valid: false, reason: "Missing key", features: null },
      { status: 400, headers: corsHeaders() },
    );
  }

  const license = await prisma.license.findUnique({ where: { key } });
  if (!license) {
    return NextResponse.json(
      { valid: false, reason: "License not found", features: null },
      { headers: corsHeaders() },
    );
  }

  if (license.expiresAt.getTime() < Date.now()) {
    return NextResponse.json(
      { valid: false, reason: "License expired", features: null },
      { headers: corsHeaders() },
    );
  }

  if (license.domain && domain && license.domain !== domain) {
    return NextResponse.json(
      { valid: false, reason: "Domain not allowed", features: null },
      { headers: corsHeaders() },
    );
  }

  let parsedFeatures: Record<string, unknown> = {};
  try {
    parsedFeatures = JSON.parse(license.features) as Record<string, unknown>;
  } catch {
    parsedFeatures = {};
  }

  return NextResponse.json(
    {
      valid: true,
      plan: license.plan,
      features: parsedFeatures,
      expiresAt: license.expiresAt,
      whiteLabel: Boolean(parsedFeatures.whiteLabel),
      widgetConfig: {
        tooltipText: license.widgetTooltipText,
        position: license.widgetPosition,
        size: license.widgetSize,
        zIndex: license.widgetZIndex,
        customCss: license.widgetCustomCss,
      },
      moodOverride:
        license.forcedMood &&
        license.forcedMoodUntil &&
        license.forcedMoodUntil.getTime() > Date.now() &&
        ALLOWED_MOODS.has(license.forcedMood)
          ? license.forcedMood
          : null,
    },
    { headers: corsHeaders() },
  );
}
