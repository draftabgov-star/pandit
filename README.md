# Living Face

Single **Next.js** application in **`dashboard/`** only (the repo root holds this README, `.gitignore`, and optional non-app folders — there is **no** `package.json` at the repository root).

**Vercel → Settings → General → Root Directory:** set to **`dashboard`** (not `./`). Leave the default **Build Command** (`npm run build`) and **Install Command** (`npm install`); `prebuild` runs the widget bundle before `next build`.

The app covers auth, licenses, NowPayments, analytics, theme APIs, and the embeddable **Living Face** widget (`dashboard/widget-lib/` → `public/widget/` on each production build).

## Prerequisites

- Node.js 20+ recommended  
- npm 9+

## Local setup

All install and scripts run from **`dashboard/`**:

```bash
cd dashboard
npm install
npx prisma db push
npm run dev
```

Create `dashboard/.env.local` (see `dashboard/README.md` for the full variable list).

### Widget script in development

If `WIDGET_CDN_URL` is unset, the app uses `/api/dev/widget`, which reads `widget-lib/dist/livingface-widget.js`. Generate it once (or run a full build):

```bash
cd dashboard
npm run build:widget
```

## Production build

From `dashboard/`:

```bash
npm run build
```

npm runs **`prebuild`** automatically before **`next build`**: it builds the widget (`build:widget`) and copies `widget-lib/dist/livingface-widget.js` → `public/widget/livingface-widget.js`.

## Deploy on Vercel

1. Connect this repository to Vercel and open the project **Settings**.
2. Under **General → Root Directory**, set **`dashboard`** (the folder that contains `package.json` and `next.config.ts`).
3. Leave **Build Command** and **Output Directory** empty so Vercel uses the defaults (`npm run build` and Next’s output). No custom install or build commands are required: `prebuild` runs the widget bundle and copy before `next build`.
4. Add the same environment variables you use locally (`DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, NowPayments keys, etc.).
5. Point the NowPayments IPN URL to `https://<your-domain>/api/payments/ipn`.

Optional: set **`WIDGET_CDN_URL`** to the full URL of `livingface-widget.js` on a CDN. If unset in production, embeds fall back to same-origin **`/widget/livingface-widget.js`** (the file produced under `public/widget/` during build).

## Project layout

```
├── README.md                 ← this file
└── dashboard/
    ├── app/                  ← Next.js App Router
    ├── widget-lib/           ← widget source + esbuild (dist/ is build output)
    ├── prisma/
    ├── public/widget/        ← livingface-widget.js copied on prebuild (.gitkeep tracked)
    └── scripts/copy-widget.mjs
```

## Security notes

- **Public widget APIs** (`/api/licenses/verify`, `/api/licenses/theme`, `/api/analytics/event`, `/api/widget/mood`) use **license key + domain** checks instead of session cookies. **CSRF** does not apply to those cross-origin JSON calls; keep keys secret and bind licenses to domains when needed.
- **Authenticated routes** use NextAuth; use HTTPS in production.
