/*
# Create online orders table and secure order placement

## 1. New Tables
- `orders`
  - `id` (uuid, primary key, auto-generated)
  - `customer_name` (text, required)
  - `customer_phone` (text, required)
  - `items` (jsonb, list of ordered products with name, quantity, unit price and line total)
  - `total_price` (numeric, calculated on the server from current product prices)
  - `status` (text, default 'pending'; allowed values: pending, completed, canceled)
  - `created_at` (timestamptz, defaults to now)

## 2. New Function
- `place_order(customer_name, customer_phone, items)` validates the customer details and
  each line (product must exist, quantity 1 to 1000, not more than stock on hand), prices
  every line from the products table, and stores the order. Returns the new order id.

## 3. Security
- Row level security is enabled on `orders`.
- Customers cannot insert orders directly; they must use `place_order`, which sets prices.
- Public and admin clients can read orders (the app has no sign-in).
- Clients can change only the `status` column, and only to pending, completed or canceled.
- Orders cannot be deleted through the Data API.

## 4. Important Notes
1. Placing an order does not reduce product stock; stock is only checked at ordering time.
2. Customer phone numbers are readable with the public key, as the app has no sign-in yet.
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'canceled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON orders TO anon, authenticated;
GRANT UPDATE (status) ON orders TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_order_status" ON orders;
CREATE POLICY "anon_update_order_status" ON orders FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (status IN ('pending', 'completed', 'canceled'));

CREATE OR REPLACE FUNCTION place_order(
  customer_name text,
  customer_phone text,
  items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_line jsonb;
  v_product products%ROWTYPE;
  v_qty integer;
  v_items jsonb := '[]'::jsonb;
  v_total numeric := 0;
  v_id uuid;
BEGIN
  IF length(trim(coalesce(customer_name, ''))) = 0 THEN
    RAISE EXCEPTION 'customer name is required';
  END IF;

  IF length(trim(coalesce(customer_phone, ''))) < 5 THEN
    RAISE EXCEPTION 'customer phone is required';
  END IF;

  IF jsonb_typeof(items) <> 'array' OR jsonb_array_length(items) = 0 THEN
    RAISE EXCEPTION 'order has no items';
  END IF;

  FOR v_line IN SELECT * FROM jsonb_array_elements(items) LOOP
    v_qty := (v_line->>'quantity')::integer;
    IF v_qty IS NULL OR v_qty < 1 OR v_qty > 1000 THEN
      RAISE EXCEPTION 'invalid quantity';
    END IF;

    SELECT * INTO v_product FROM products WHERE id = v_line->>'productId';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'product not found';
    END IF;

    IF v_product.stock < v_qty THEN
      RAISE EXCEPTION 'not enough stock for %', v_product.name;
    END IF;

    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'productId', v_product.id,
      'name', v_product.name,
      'quantity', v_qty,
      'unitPrice', v_product.sale_price,
      'total', v_product.sale_price * v_qty
    ));
    v_total := v_total + v_product.sale_price * v_qty;
  END LOOP;

  INSERT INTO orders (customer_name, customer_phone, items, total_price)
  VALUES (trim(customer_name), trim(customer_phone), v_items, v_total)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION place_order(text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION place_order(text, text, jsonb) TO anon, authenticated;
