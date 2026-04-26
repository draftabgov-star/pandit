/**
 * Copies the bundled widget into Next.js static files:
 *   widget-lib/dist/livingface-widget.js → public/widget/livingface-widget.js
 * (Run after `npm run build:widget`; `prebuild` does both.)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dashboardRoot = path.join(__dirname, "..");
const src = path.join(dashboardRoot, "widget-lib", "dist", "livingface-widget.js");
const destDir = path.join(dashboardRoot, "public", "widget");
const dest = path.join(destDir, "livingface-widget.js");

if (fs.existsSync(src)) {
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  const kb = (fs.statSync(dest).size / 1024).toFixed(1);
  console.log(`[copy-widget] Copied to public/widget/livingface-widget.js (${kb} KB)`);
} else {
  console.warn("[copy-widget] Source not found:", src, "(skip — run npm run build:widget first)");
}
