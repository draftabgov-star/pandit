import "server-only";

/**
 * Absolute URL to the widget IIFE bundle for embed snippets.
 *
 * Behavior is unchanged for embeds:
 * - `WIDGET_CDN_URL`: full URL to `livingface-widget.js` on your CDN (trimmed, no trailing slash).
 * - Production without CDN: same-origin `{NEXTAUTH_URL}/widget/livingface-widget.js` (file from
 *   `public/widget/` after `prebuild` copies `widget-lib/dist/livingface-widget.js`).
 * - Development: `{NEXTAUTH_URL}/api/dev/widget` streams `widget-lib/dist` (run `npm run build:widget` if missing).
 */
export function getWidgetScriptUrl(): string {
  const cdn = process.env.WIDGET_CDN_URL?.trim();
  if (cdn) return cdn.replace(/\/$/, "");

  const origin = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");

  if (process.env.NODE_ENV === "development") {
    return `${origin}/api/dev/widget`;
  }

  return `${origin}/widget/livingface-widget.js`;
}
