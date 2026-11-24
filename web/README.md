# Rasoi on the web

Rasoi as an installable web app (PWA) for iPhone Safari, with a small Next.js server.
Same features and look as the native app; the native app in the repo root is unchanged.

## How it fits together

- **Shared code, not copied by hand.** `scripts/prepare-assets.mjs` (run by `npm run dev`
  and `npm run build`) copies the platform-neutral code from `../src` (`domain`, `lib`,
  `data`, `db`, `design`, `hooks`, `store.tsx`, `types.ts`) and the bundled photos and
  icons from `../assets` into `web/shared/` (git-ignored). Edit the originals, never
  `web/shared`.
- **Shims** (`shims/`) stand in for the few native modules the shared code imports:
  `expo-sqlite` → sql.js (SQLite in WebAssembly) saved to IndexedDB, AsyncStorage →
  localStorage, `expo-notifications` → web push, `react-native` → a few types, `Linking`
  and `AppState`. `next.config.ts` and `tsconfig.json` map the module names to them.
- **UI** (`client/`) is the native screens rewritten as React DOM components with the
  same palette, sizes and copy.
- **Server** (`app/api/`): an Unsplash proxy that adds the access key (the browser never
  sees it), and web push for the daily reminder (subscriptions + a Vercel Cron job).
- **Offline**: `public/sw.js` caches the app, the bundled photos and photos already seen.

## Local

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # web tests (Vitest)
npm run typecheck
```

The root Jest suite (`npm test` in the repo root) still covers `src/`.

Local dev reads `../.env.local` for the Unsplash key. For reminders locally, put test
VAPID keys and a `CRON_SECRET` in `web/.env.local` (git-ignored).

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Name | What |
| --- | --- |
| `UNSPLASH_ACCESS_KEY` | Unsplash access key (server only). Without it, dishes keep the bundled Wikimedia photos. |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | From `npx web-push generate-vapid-keys`. |
| `VAPID_SUBJECT` | Optional. `https://<your-site>` or `mailto:…`; defaults to the production URL. |
| `CRON_SECRET` | Any long random string; Vercel Cron sends it to `/api/cron/reminders`. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Set automatically when you add **Upstash Redis** (free) from the Vercel Marketplace. Stores reminder subscriptions. |

## Deploying on Vercel (Hobby, free)

The Vercel project `rasoi` is connected to this GitHub repo: **every push to the
production branch deploys automatically**; pushes to other branches get preview URLs.

Project settings (already set): Root Directory `web`, "Include files outside the root
directory" on (the build reads `../src` and `../assets`), framework Next.js, production
branch `claude/blissful-bassi-21bb84`.

To deploy by hand from this machine instead, from `web/`:
`npx vercel build --prod` then `npx vercel deploy --prebuilt --prod`.

The cron in `vercel.json` runs once a day at 02:30 UTC (8:00 in India). On the Hobby plan
Vercel may run it any time within that hour.

## On iPhone

Open the site in Safari → Share → **Add to Home Screen**. Reminders need iOS 16.4+ and
the Home Screen app (Safari tabs can't get push). Turn on **Daily 8am reminder** in
Setup from the Home Screen app and allow notifications.
