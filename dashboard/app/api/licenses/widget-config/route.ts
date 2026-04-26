import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const POSITIONS = new Set(["top-left", "top-right", "bottom-left", "bottom-right"]);
const SIZES = new Set(["small", "medium", "large"]);

function normalizeCss(input: string | undefined) {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 4000);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    licenseKey?: string;
    tooltipText?: string;
    position?: string;
    size?: string;
    zIndex?: number | null;
    customCss?: string;
  };
  const licenseKey = (body.licenseKey || "").trim();
  if (!licenseKey) return NextResponse.json({ error: "licenseKey required" }, { status: 400 });

  const position = (body.position || "bottom-right").trim().toLowerCase();
  const size = (body.size || "medium").trim().toLowerCase();
  if (!POSITIONS.has(position)) return NextResponse.json({ error: "Invalid position" }, { status: 400 });
  if (!SIZES.has(size)) return NextResponse.json({ error: "Invalid size" }, { status: 400 });

  let zIndex: number | null = null;
  if (body.zIndex !== undefined && body.zIndex !== null && String(body.zIndex).trim() !== "") {
    const parsed = Number(body.zIndex);
    if (!Number.isFinite(parsed)) return NextResponse.json({ error: "Invalid zIndex" }, { status: 400 });
    zIndex = Math.max(1, Math.min(2147483647, Math.round(parsed)));
  }

  const license = await prisma.license.findFirst({
    where: { key: licenseKey, userId: session.user.id },
    select: { id: true },
  });
  if (!license) return NextResponse.json({ error: "License not found" }, { status: 404 });

  const updated = await prisma.license.update({
    where: { id: license.id },
    data: {
      widgetTooltipText: body.tooltipText?.trim().slice(0, 140) || null,
      widgetPosition: position,
      widgetSize: size,
      widgetZIndex: zIndex,
      widgetCustomCss: normalizeCss(body.customCss),
    },
    select: {
      widgetTooltipText: true,
      widgetPosition: true,
      widgetSize: true,
      widgetZIndex: true,
      widgetCustomCss: true,
    },
  });

  return NextResponse.json({ ok: true, config: updated });
}
