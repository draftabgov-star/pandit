import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_BYTES = 800 * 1024;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const licenseKey = String(form.get("licenseKey") || "").trim();
  const file = form.get("file");
  if (!licenseKey || !(file instanceof File)) {
    return NextResponse.json({ error: "licenseKey and file required" }, { status: 400 });
  }

  const license = await prisma.license.findFirst({
    where: { key: licenseKey, userId: session.user.id },
  });
  if (!license) {
    return NextResponse.json({ error: "License not found" }, { status: 404 });
  }

  let features: { customTheme?: boolean } = {};
  try {
    features = JSON.parse(license.features || "{}") as { customTheme?: boolean };
  } catch {
    features = {};
  }
  if (!features.customTheme) {
    return NextResponse.json({ error: "customTheme not enabled for this license" }, { status: 403 });
  }

  const mime = file.type;
  if (mime !== "image/png" && mime !== "image/svg+xml") {
    return NextResponse.json({ error: "Only PNG or SVG allowed" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    return NextResponse.json({ error: "Max file size is 800KB" }, { status: 400 });
  }

  const ext = mime === "image/svg+xml" ? "svg" : "png";
  const dir = path.join(process.cwd(), "public", "license-themes");
  await mkdir(dir, { recursive: true });

  const baseName = license.id.replace(/[^a-z0-9_-]/gi, "");
  const filename = `${baseName}.${ext}`;
  const outPath = path.join(dir, filename);

  try {
    await unlink(outPath);
  } catch {
    // ignore
  }
  await writeFile(outPath, buf);

  const publicPath = `/license-themes/${filename}`;
  await prisma.license.update({
    where: { id: license.id },
    data: {
      themeImageUrl: publicPath,
    },
  });

  const base = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  return NextResponse.json({ ok: true, url: `${base}${publicPath}` });
}
