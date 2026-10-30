/*
# Create core tables for store management app (single-tenant, no auth)

This migration creates the four core tables needed by the store management app:
products, sales, sale_items, and stock_movements.

## Context
The app has no sign-in / authentication screen. All data is shared (single-store).
Therefore policies use `TO anon, authenticated` with `USING (true)` so the
anon-key frontend client can read and write all rows.

## New Tables

### 1. products
Stores the catalog of goods available in the store.
- id (text, primary key) — client-generated ID
- name (text, not null) — product name
- barcode (text, default '') — barcode string
- purchase_price (bigint, default 0) — purchase price in toman (integer tomans)
- sale_price (bigint, default 0) — sale price in toman
- stock (integer, default 0) — current stock quantity
- unit (text, default 'عدد') — unit of measurement
- created_at (bigint) — epoch milliseconds timestamp

### 2. sales
Stores each sale transaction (header).
- id (text, primary key) — client-generated ID
- total (bigint, not null) — total sale amount in toman
- date (bigint, not null) — epoch milliseconds timestamp

### 3. sale_items
Stores line items belonging to each sale (child of sales).
- id (uuid, primary key, auto-generated)
- sale_id (text, foreign key → sales.id ON DELETE CASCADE)
- product_id (text) — references products.id (no FK constraint to allow orphan items)
- name (text, not null) — product name snapshot at time of sale
- quantity (integer, not null) — quantity sold
- sale_price (bigint, not null) — unit price at time of sale
- total (bigint, not null) — line total (quantity × sale_price)

### 4. stock_movements
Stores stock-in / stock-out audit log entries.
- id (text, primary key) — client-generated ID
- product_id (text, not null) — product reference
- product_name (text, not null) — product name snapshot
- type (text, not null) — 'in' or 'out'
- quantity (integer, not null) — quantity moved
- date (bigint, not null) — epoch milliseconds timestamp
- note (text) — optional note

## Security
- RLS enabled on all four tables.
- All four CRUD policies (SELECT/INSERT/UPDATE/DELETE) use `TO anon, authenticated`
  with `USING (true)` / `WITH CHECK (true)` because this is a single-tenant app
  with no authentication — the anon-key client must be able to read and write.
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL,
  barcode text NOT NULL DEFAULT '',
  purchase_price bigint NOT NULL DEFAULT 0,
  sale_price bigint NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'عدد',
  created_at bigint NOT NULL DEFAULT 0
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id text PRIMARY KEY,
  total bigint NOT NULL,
  date bigint NOT NULL
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sales" ON sales;
CREATE POLICY "anon_select_sales" ON sales FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sales" ON sales;
CREATE POLICY "anon_insert_sales" ON sales FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sales" ON sales;
CREATE POLICY "anon_update_sales" ON sales FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sales" ON sales;
CREATE POLICY "anon_delete_sales" ON sales FOR DELETE
  TO anon, authenticated USING (true);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id text NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id text NOT NULL DEFAULT '',
  name text NOT NULL,
  quantity integer NOT NULL,
  sale_price bigint NOT NULL,
  total bigint NOT NULL
);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sale_items" ON sale_items;
CREATE POLICY "anon_select_sale_items" ON sale_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sale_items" ON sale_items;
CREATE POLICY "anon_insert_sale_items" ON sale_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sale_items" ON sale_items;
CREATE POLICY "anon_update_sale_items" ON sale_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sale_items" ON sale_items;
CREATE POLICY "anon_delete_sale_items" ON sale_items FOR DELETE
  TO anon, authenticated USING (true);

-- Stock movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id text PRIMARY KEY,
  product_id text NOT NULL,
  product_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('in', 'out')),
  quantity integer NOT NULL,
  date bigint NOT NULL,
  note text
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_stock_movements" ON stock_movements;
CREATE POLICY "anon_select_stock_movements" ON stock_movements FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_stock_movements" ON stock_movements;
CREATE POLICY "anon_insert_stock_movements" ON stock_movements FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_stock_movements" ON stock_movements;
CREATE POLICY "anon_update_stock_movements" ON stock_movements FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_stock_movements" ON stock_movements;
CREATE POLICY "anon_delete_stock_movements" ON stock_movements FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date DESC);
