import type { License } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPresetCss, mergePresetWithHex } from "@/lib/theme-presets";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function parseFeatures(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function absoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  const base = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

type LoadLicenseResult =
  | { ok: true; license: License }
  | { ok: false; reason: "not_found" | "expired" | "domain" };

async function loadLicense(key: string, domain: string): Promise<LoadLicenseResult> {
  const license = await prisma.license.findUnique({ where: { key } });
  if (!license) return { ok: false, reason: "not_found" };
  if (license.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };
  if (license.domain && domain && license.domain !== domain) {
    return { ok: false, reason: "domain" };
  }
  return { ok: true, license };
}

/** Public: theme config for embed widget (requires valid license + customTheme feature). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = (url.searchParams.get("key") || "").trim();
  const domain = (url.searchParams.get("domain") || "").trim().toLowerCase();

  if (!key) {
    return NextResponse.json({ ok: false, reason: "missing_key" }, { status: 400, headers: corsHeaders() });
  }

  const result = await loadLicense(key, domain);
  if (!result.ok) {
    const status = result.reason === "not_found" ? 404 : 403;
    return NextResponse.json({ ok: false, reason: result.reason }, { status, headers: corsHeaders() });
  }

  const license = result.license;
  const features = parseFeatures(license.features);
  if (!features.customTheme) {
    return NextResponse.json(
      { ok: false, reason: "customTheme_disabled" },
      { status: 403, headers: corsHeaders() },
    );
  }

  if (license.themeImageUrl) {
    return NextResponse.json(
      {
        ok: true,
        mode: "image",
        imageUrl: absoluteUrl(license.themeImageUrl),
        preset: license.themePreset,
        css: null,
      },
      { headers: corsHeaders() },
    );
  }

  const baseCss = getPresetCss(license.themePreset);
  const css = mergePresetWithHex(baseCss, license.themeAccentHex, license.themeDeepHex);
  return NextResponse.json(
    {
      ok: true,
      mode: "css",
      imageUrl: null,
      preset: license.themePreset,
      css,
    },
    { headers: corsHeaders() },
  );
}

/** Authenticated: set preset or full reset to default (clears custom image). */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
  }

  let body: {
    licenseKey?: string;
    preset?: string;
    reset?: boolean;
    accentHex?: string | null;
    deepHex?: string | null;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: corsHeaders() });
  }

  const licenseKey = (body.licenseKey || "").trim();
  if (!licenseKey) {
    return NextResponse.json({ error: "licenseKey required" }, { status: 400, headers: corsHeaders() });
  }

  const license = await prisma.license.findFirst({
    where: { key: licenseKey, userId: session.user.id },
  });
  if (!license) {
    return NextResponse.json({ error: "License not found" }, { status: 404, headers: corsHeaders() });
  }

  const hex6 = /^#[0-9A-Fa-f]{6}$/;

  if (body.reset) {
    await prisma.license.update({
      where: { id: license.id },
      data: {
        themePreset: "default",
        themeImageUrl: null,
        themeAccentHex: null,
        themeDeepHex: null,
      },
    });
    return NextResponse.json({ ok: true, mode: "default" }, { headers: corsHeaders() });
  }

  const wantsColors = typeof body.accentHex === "string" && typeof body.deepHex === "string";
  if (wantsColors) {
    const a = body.accentHex!.trim();
    const d = body.deepHex!.trim();
    if (!a && !d) {
      await prisma.license.update({
        where: { id: license.id },
        data: { themeAccentHex: null, themeDeepHex: null },
      });
      return NextResponse.json({ ok: true, colors: "cleared" }, { headers: corsHeaders() });
    }
    if (!hex6.test(a) || !hex6.test(d)) {
      return NextResponse.json({ error: "accentHex and deepHex must be #RRGGBB" }, { status: 400, headers: corsHeaders() });
    }
    await prisma.license.update({
      where: { id: license.id },
      data: { themeAccentHex: a, themeDeepHex: d },
    });
    return NextResponse.json({ ok: true, accentHex: a, deepHex: d }, { headers: corsHeaders() });
  }

  const preset = (body.preset || "default").toLowerCase();
  const allowed = ["default", "ocean", "sunset", "neon", "forest"];
  if (!allowed.includes(preset)) {
    return NextResponse.json({ error: "Invalid preset" }, { status: 400, headers: corsHeaders() });
  }

  await prisma.license.update({
    where: { id: license.id },
    data: {
      themePreset: preset,
      themeImageUrl: null,
    },
  });

  return NextResponse.json({ ok: true, preset }, { headers: corsHeaders() });
}
