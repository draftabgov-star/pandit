import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { EmbedSnippet } from "@/components/embed-snippet";
import { LicenseCustomizePanel } from "@/components/license-customize-panel";
import { getWidgetScriptUrl } from "@/lib/widget-cdn";
import { prisma } from "@/lib/prisma";

function formatFeatures(features: unknown) {
  let f: Record<string, boolean> = {};
  if (typeof features === "string") {
    try {
      f = JSON.parse(features) as Record<string, boolean>;
    } catch {
      f = {};
    }
  } else if (features && typeof features === "object") {
    f = features as Record<string, boolean>;
  }
  if (!Object.keys(f).length) return "none";
  return Object.entries(f)
    .filter(([, v]) => Boolean(v))
    .map(([k]) => k)
    .join(", ");
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const licenses = await prisma.license.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  const licenseIds = licenses.map((l) => l.id);
  const events =
    licenseIds.length === 0
      ? []
      : await prisma.moodEvent.findMany({
          where: { licenseId: { in: licenseIds } },
          orderBy: { timestamp: "desc" },
          take: 10,
        });

  const widgetScriptUrl = getWidgetScriptUrl();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
      <p className="mt-2 text-slate-400">Welcome {session.user.email}. Manage licenses and copy embed snippets.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="/api/licenses/generate?plan=free&days=30"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur hover:bg-white/10"
        >
          Generate Free License
        </a>
        <Link href="/pricing" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-900/30 hover:bg-indigo-500">
          Upgrade via Pricing
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white">Your licenses</h2>
        <div className="mt-4 overflow-hidden glass-panel">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/70 text-slate-300">
              <tr>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">License Key</th>
                <th className="px-4 py-3">Features</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {licenses.length === 0 ? (
                <tr>
                  <td className="px-4 py-3 text-slate-400" colSpan={5}>
                    No licenses yet.
                  </td>
                </tr>
              ) : (
                licenses.map((license) => (
                  <tr key={license.id} className="border-t border-slate-800">
                    <td className="px-4 py-3">{license.plan}</td>
                    <td className="px-4 py-3 font-mono text-xs">{license.key}</td>
                    <td className="px-4 py-3 text-slate-300">{formatFeatures(license.features)}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {new Date(license.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          className="rounded border border-indigo-500/50 px-2 py-1 text-xs text-indigo-200"
                          href={`/dashboard/theme?key=${encodeURIComponent(license.key)}`}
                        >
                          Theme
                        </Link>
                        <a
                          className="rounded border border-slate-700 px-2 py-1 text-xs"
                          href={`/api/licenses/manage?licenseId=${license.id}&plan=free`}
                        >
                          Free
                        </a>
                        <a
                          className="rounded border border-slate-700 px-2 py-1 text-xs"
                          href={`/api/licenses/manage?licenseId=${license.id}&plan=pro`}
                        >
                          Pro
                        </a>
                        <a
                          className="rounded border border-slate-700 px-2 py-1 text-xs"
                          href={`/api/licenses/manage?licenseId=${license.id}&plan=premium`}
                        >
                          Premium
                        </a>
                        <a
                          className="rounded border border-slate-700 px-2 py-1 text-xs"
                          href={`/api/licenses/manage?licenseId=${license.id}&plan=agency`}
                        >
                          Agency
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">Embed snippet</h2>
        <p className="text-sm text-slate-400">
          Production: set <code className="rounded bg-slate-950/80 px-1 font-mono text-indigo-200">WIDGET_CDN_URL</code>{" "}
          to your CDN URL for <code className="font-mono">livingface-widget.js</code>. Development serves the bundle
          via <code className="font-mono">/api/dev/widget</code> automatically.
        </p>
        <EmbedSnippet scriptUrl={widgetScriptUrl} />
      </section>

      <LicenseCustomizePanel licenses={licenses} />

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white">Recent analytics events</h2>
        <p className="mt-1 text-sm text-slate-500">
          <Link href="/dashboard/analytics" className="text-indigo-300 hover:underline">
            Open full analytics
          </Link>{" "}
          for charts and CSV export (agency).
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          {events.length === 0 ? <li className="text-slate-500">No analytics events yet.</li> : null}
          {events.map((event) => (
            <li key={event.id} className="rounded border border-slate-800 bg-slate-900/40 px-3 py-2">
              {event.mood} • {event.domain || "unknown-domain"} • {new Date(event.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
