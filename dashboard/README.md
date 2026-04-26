# Living Face Dashboard

Next.js app: users, license keys, premium flags, NowPayments, analytics, theme and widget customization APIs. The embeddable widget lives in **`widget-lib/`** and is copied to **`public/widget/`** on `npm run build` (via `prebuild`).

## Stack

- Next.js App Router + TypeScript + Tailwind  
- Prisma + SQLite (or your deployed DB URL)  
- NextAuth (credentials)  
- NowPayments invoice + IPN  

## Environment

Create `.env.local` (or `.env`) with:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret
NOWPAYMENTS_API_URL=https://api.nowpayments.io/v1
NOWPAYMENTS_API_KEY=
NOWPAYMENTS_IPN_SECRET=

# Optional: full URL to livingface-widget.js on your CDN (no trailing slash)
WIDGET_CDN_URL=

# Optional: allow /api/dev/widget outside development (not recommended in public prod)
# ALLOW_WIDGET_PROXY=1
```

## Run locally

From **`dashboard/`**:

```bash
npm install
npx prisma db push
npm run build:widget   # once, if you need /api/dev/widget before a full build
npm run dev
```

## Widget URLs

| Mode | Embed `src` |
|------|-------------|
| **Development** | If `WIDGET_CDN_URL` is unset: `{NEXTAUTH_URL}/api/dev/widget` (serves `widget-lib/dist/livingface-widget.js`). |
| **Production** | Set `WIDGET_CDN_URL` to your CDN, or rely on same-origin `{NEXTAUTH_URL}/widget/livingface-widget.js` after `npm run build` (prebuild copies into `public/widget/`). |

## Routes (summary)

- `POST /api/auth/register`, `POST /api/auth/login` — auth  
- `GET /api/licenses/generate` — create license (session)  
- `GET /api/licenses/verify?key=...&domain=...` — public verify + features (CORS)  
- `GET /api/dev/widget` — dev (or `ALLOW_WIDGET_PROXY=1`): streams `widget-lib/dist`  
- `GET/POST /api/licenses/theme*`, `POST /api/licenses/widget-config` — theme & widget UI  
- `POST /api/analytics/event`, `GET /api/analytics/export` — analytics  
- `POST /api/widget/mood` — public mood override  
- `POST /api/payments/create-invoice`, `POST /api/payments/ipn` — payments  

## Widget embed snippet

Use the URL from `getWidgetScriptUrl()` (dashboard shows **Copy embed code**):

```html
<script src="YOUR_WIDGET_SCRIPT_URL" data-hq-key="YOUR_LICENSE_KEY" async></script>
```

## Vercel

Set the Vercel project **Root Directory** to **`dashboard`**. Use the **default** build command (`npm run build`) and default output—no extra settings. See the repository root **`README.md`** for the full deployment checklist.
