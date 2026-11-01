# Project memory

## Product intent & audience

- Vite + React app imported from GitHub; integrates with Supabase backend (auth + database).
- App name is "Black-Market"; configured as an installable PWA for Windows, Android, and iOS.
- Two distinct user surfaces: admin/staff dashboard (management interface) and a standalone customer storefront (`/shop`) for online ordering.
- Core flows: login, product management, customer ordering, and order management.
- Customer storefront is completely isolated from admin UI — no sidebar, header, or staff links.

## Brand personality & voice

- Production-grade, distinctive design — avoid generic/cookie-cutter UI (per `.bolt/prompt`).
- Primary UI language is Persian (Farsi) for labels, navigation, and customer-facing text.

## Visual design & UX direction

- Stack: JSX + Tailwind CSS; Lucide React icons; no extra UI/icon packages unless requested.
- Use `@/` path alias (→ `src/`) for all project module imports.
- Persian font loaded from Google Fonts in `index.html`.
- Logo image: `public/logo.png` — used as favicon, apple-touch-icon, PWA icon (192/512), and displayed above "Black-Market" text on the main selection screen.
- Selection screen: three cards/buttons — management, staff, and "سفارش آنلاین (فروشگاه)" linking to `/shop`.
- Storefront (`/shop`): clean e-commerce layout with product grid, quantity controls, name/phone form, and success screen after ordering.
- Admin dashboard includes sidebar with tabs including "سفارش‌های آنلاین" for order management with status control (pending/completed/canceled).

## Decisions, constraints & rationale

- Supabase config: `.env` at project root with `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`; publishable URL/key also embedded as built-in fallback.
- Project URL: `https://vlbxbwwidazjptlbjdfj.supabase.co`; anon key: `sb_publishable_vV0csoq7hl29451k8swbyg_7ihPd_`.
- Database tables: `products` (existing, readable by public key), `orders` (new).
- `orders` table columns: `id` (uuid PK), `customer_name` (text), `customer_phone` (text), `items` (jsonb), `total_price` (numeric), `status` (text default 'pending'), `created_at` (timestamp).
- Orders placed via a server-side Supabase function that prices items from the products table and rejects orders if stock is insufficient.
- RLS policies currently open to anyone with the public key.
- Login is a local component (no DB dependency); login password is a fixed hardcoded value.
- PWA configured via `vite-plugin-pwa` in `vite.config.ts`; manifest: name/short_name "Black-Market", theme_color `#2563eb`, background_color `#000000`, display `standalone`, start_url `/`.
- Service worker enabled for caching/offline support via `vite-plugin-pwa`.
- No router library installed; route handling implemented manually in the entry file.
- Project type-checks and builds successfully.

## Open questions & assumptions

- No sign-in/auth on storefront; anyone with the public key can read all orders including phone numbers — staff login needed for production security.
- Placing an order does not reduce product stock.
- Env var names assumed — not explicitly verified against existing app code.
- Full feature set and specific data screens beyond products/orders are unconfirmed.
- Supabase schema/table structure and RLS policies not fully known; current policies are permissive.
- User has not yet decided whether real user accounts and tighter RLS rules are needed before production use.
- PWA install behavior not tested on actual Windows/Android/iOS devices.
- New storefront and admin orders pages not yet tested in a browser by the developer.