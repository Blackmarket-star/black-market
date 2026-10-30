# Project memory

## Product intent & audience

- Vite + React app imported from GitHub; integrates with Supabase backend (auth + database).
- Core flows include login and data screens (exact feature set not yet confirmed).

## Brand personality & voice

- Production-grade, distinctive design — avoid generic/cookie-cutter UI (per `.bolt/prompt`).

## Visual design & UX direction

- Stack: JSX + Tailwind CSS; Lucide React icons; no extra UI/icon packages unless requested.
- Use `@/` path alias (→ `src/`) for all project module imports.
- App loads a Persian font from Google Fonts in `index.html`; no HubSpot/Sentry or other external scripts.

## Decisions, constraints & rationale

- Supabase config provided directly by user; `.env` file created at project root with `VITE_`-prefixed vars.
- Project URL: `https://vlbxbwwidazjptlbjdfj.supabase.co`; anon/publishable key: `sb_publishable_vV0csoq7hl29451k8swbyg_7ihPd_`.
- Preview was blank due to `.env` not being picked up by the running preview; fixed by adding publishable URL/key as a built-in fallback in the Supabase client. Safe because publishable keys are designed to be public.
- Database tables confirmed to exist; RLS policies currently open to anyone with the public key.
- Login is a local component (no DB dependency), login password is a fixed value hardcoded in the app.
- Assistant cannot restart the preview; user must reload manually if needed.

## Open questions & assumptions

- Env var names assumed (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) — not explicitly verified against existing app code.
- Full feature set and specific data screens are unconfirmed.
- Supabase schema/table structure and RLS policies are not fully known; current policies are permissive.
- User has not yet decided whether real user accounts and tighter RLS rules are needed before production use.