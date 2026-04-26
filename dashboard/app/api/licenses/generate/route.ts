import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getFeatureByPlan } from "@/lib/feature-plans";
import { generateLicenseKey } from "@/lib/license";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const plan = (url.searchParams.get("plan") || "free").toLowerCase();
  const domain = url.searchParams.get("domain")?.trim() || null;
  const expiresDays = Math.max(1, Number(url.searchParams.get("days") || "30"));

  const features = getFeatureByPlan(plan);
  const license = await prisma.license.create({
    data: {
      key: generateLicenseKey(),
      userId: session.user.id,
      plan,
      domain,
      features: JSON.stringify(features),
      expiresAt: new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000),
      activatedAt: new Date(),
    },
  });

  return NextResponse.json({ license });
}
