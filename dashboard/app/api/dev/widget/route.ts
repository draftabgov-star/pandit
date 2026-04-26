import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export const dynamic = "force-dynamic";

function allowDevWidgetProxy(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return process.env.ALLOW_WIDGET_PROXY === "1";
}

export async function GET() {
  if (!allowDevWidgetProxy()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const cwd = /* turbopackIgnore: true */ process.cwd();
  const candidates = [
    path.join(cwd, "widget-lib", "dist", "livingface-widget.js"),
    path.join(cwd, "dashboard", "widget-lib", "dist", "livingface-widget.js"),
  ];

  for (const filePath of candidates) {
    try {
      const buf = await readFile(filePath);
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    } catch {
      // try next
    }
  }

  return NextResponse.json(
    { error: "Widget bundle not found. Run: npm run build:widget (from dashboard)" },
    { status: 404 },
  );
}
