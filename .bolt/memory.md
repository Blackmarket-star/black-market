# Project memory

## Product intent & audience

- Vite + React app imported from GitHub; integrates with Supabase backend (auth + database).
- Core flows include login and data screens (exact feature set not yet confirmed).
- App name is "Black-Market"; configured as an installable PWA for Windows, Android, and iOS.

## Brand personality & voice

- Production-grade, distinctive design — avoid generic/cookie-cutter UI (per `.bolt/prompt`).

## Visual design & UX direction

- Stack: JSX + Tailwind CSS; Lucide React icons; no extra UI/icon packages unless requested.
- Use `@/` path alias (→ `src/`) for all project module imports.
- App loads a Persian font from Google Fonts in `index.html`; no HubSpot/Sentry or other external scripts.
- Logo image: `public/logo.png` — used as favicon, apple-touch-icon, and PWA icon (192x192 and 512x512).

## Decisions, constraints & rationale

- Supabase config provided directly by user; `.env` file created at project root with `VITE_`-prefixed vars.
- Project URL: `https://vlbxbwwidazjptlbjdfj.supabase.co`; anon/publishable key: `sb_publishable_vV0csoq7hl29451k8swbyg_7ihPd_`.
- Publishable URL/key also embedded as built-in fallback in the Supabase client so preview works without `.env`.
- Database tables confirmed to exist; RLS policies currently open to anyone with the public key.
- Login is a local component (no DB dependency); login password is a fixed hardcoded value.
- PWA configured via `vite-plugin-pwa` in `vite.config.ts`; manifest: name/short_name "Black-Market", theme_color `#2563eb`, background_color `#000000`, display `standalone`, start_url `/`.
- Service worker enabled for caching/offline support via `vite-plugin-pwa` (auto-generated at build).
- `index.html` updated: `<link rel="icon" href="/logo.png" />` and apple-touch-icon set to `/logo.png`.
- Routing, Supabase connections, and existing UI components left unchanged by PWA setup.
- Internal packages were updated during PWA plugin install; build passes.

## Open questions & assumptions

- Env var names assumed (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) — not explicitly verified against existing app code.
- Full feature set and specific data screens are unconfirmed.
- Supabase schema/table structure and RLS policies are not fully known; current policies are permissive.
- User has not yet decided whether real user accounts and tighter RLS rules are needed before production use.
- PWA install behavior not tested on actual Windows/Android/iOS devices — user needs to verify "Add to home screen".