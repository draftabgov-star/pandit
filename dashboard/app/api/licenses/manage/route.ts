import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getFeatureByPlan } from "@/lib/feature-plans";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { licenseId?: string; plan?: string };
  const licenseId = body.licenseId;
  const plan = (body.plan || "free").toLowerCase();
  if (!licenseId) return NextResponse.json({ error: "Missing licenseId" }, { status: 400 });

  const license = await prisma.license.findUnique({ where: { id: licenseId } });
  if (!license || license.userId !== session.user.id) {
    return NextResponse.json({ error: "License not found" }, { status: 404 });
  }

  const updated = await prisma.license.update({
    where: { id: licenseId },
    data: {
      plan,
      features: JSON.stringify(getFeatureByPlan(plan)),
    },
  });

  return NextResponse.json({ license: updated });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const licenseId = url.searchParams.get("licenseId");
  const plan = (url.searchParams.get("plan") || "free").toLowerCase();
  if (!licenseId) return NextResponse.json({ error: "Missing licenseId" }, { status: 400 });

  const license = await prisma.license.findUnique({ where: { id: licenseId } });
  if (!license || license.userId !== session.user.id) {
    return NextResponse.json({ error: "License not found" }, { status: 404 });
  }

  await prisma.license.update({
    where: { id: licenseId },
    data: {
      plan,
      features: JSON.stringify(getFeatureByPlan(plan)),
    },
  });

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
