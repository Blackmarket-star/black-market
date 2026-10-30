# Project memory

## Product intent & audience

- Vite + React app imported from GitHub; integrates with Supabase backend (auth + database).
- Core flows include login and data screens (exact feature set not yet confirmed).

## Brand personality & voice

- Production-grade, distinctive design — avoid generic/cookie-cutter UI (per `.bolt/prompt`).

## Visual design & UX direction

- Stack: JSX + Tailwind CSS; Lucide React icons; no extra UI/icon packages unless requested.
- Use `@/` path alias (→ `src/`) for all project module imports.

## Decisions, constraints & rationale

- Supabase config provided directly by user; `.env` file created at project root to enable preview.
- Project URL: `https://vlbxbwwidazjptlbjdfj.supabase.co`; anon/publishable key: `sb_publishable_vV0csoq7hl29451k8swbyg_7ihPd_`.
- App reads Supabase settings via env vars (build verified successfully after `.env` creation).
- Assistant cannot restart the preview; user must reload manually if needed.

## Open questions & assumptions

- Exact env var names (e.g. `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) assumed from existing app code — not yet verified.
- Full feature set and specific data screens are unconfirmed.
- Supabase schema/tables and RLS policies are unknown.