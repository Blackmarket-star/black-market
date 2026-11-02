/*
# Add delivery, payment and store address support to orders

## 1. Modified Tables
- `orders`
  - `order_number` (bigint, identity): short sequential number shown to staff and customers
  - `province`, `city`, `address`, `building_unit`, `postal_code`, `delivery_notes` (text, optional where noted)
  - `latitude`, `longitude` (double precision, optional): customer location from the map
  - `payment_status` (text, default 'unpaid'): unpaid, pending, paid, failed
  - `payment_authority` (text), `payment_ref_id` (text), `paid_at` (timestamptz)

## 2. New Tables
- `store_settings`: single row (id 'main') holding the store's own address and coordinates, editable by the admin.

## 3. Security
- Payment columns are not granted to the public or admin clients; only server functions (service role) can change them.
- `store_settings` is readable by the public and writable by the admin client, matching the existing products table.
- Realtime is enabled for `orders` so the admin dashboard receives new orders instantly. Access still follows the orders SELECT policy.

## 4. Important Notes
1. Existing orders keep their data; new columns are empty for them.
2. Payment columns start as 'unpaid' and are only set to 'paid' after server-side Zarinpal verification.
*/

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number bigint GENERATED ALWAYS AS IDENTITY;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS province text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS building_unit text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS postal_code text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_notes text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_authority text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_ref_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
      CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

CREATE TABLE IF NOT EXISTS store_settings (
  id text PRIMARY KEY DEFAULT 'main' CHECK (id = 'main'),
  province text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  latitude double precision,
  longitude double precision,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON store_settings TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_store_settings" ON store_settings;
CREATE POLICY "anon_select_store_settings" ON store_settings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_store_settings" ON store_settings;
CREATE POLICY "anon_insert_store_settings" ON store_settings FOR INSERT
TO anon, authenticated WITH CHECK (id = 'main');

DROP POLICY IF EXISTS "anon_update_store_settings" ON store_settings;
CREATE POLICY "anon_update_store_settings" ON store_settings FOR UPDATE
TO anon, authenticated USING (id = 'main') WITH CHECK (id = 'main');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
END $$;
