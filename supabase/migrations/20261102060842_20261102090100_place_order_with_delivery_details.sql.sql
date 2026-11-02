/*
# Extend place_order with delivery details

## 1. Changed Function
- `place_order` now also accepts province, city, full address, building/unit, optional postal code, optional delivery notes, and optional map coordinates.
- Required: name, phone, province, city, address, and at least one item.
- Prices, stock checks and quantity limits are unchanged and still computed on the server.

## 2. Security
- The previous three-argument version is removed so only one version exists.
- Execute permission is granted to the public shop client only.

## 3. Important Notes
1. Coordinates, when given, must be valid latitude (-90 to 90) and longitude (-180 to 180).
*/

DROP FUNCTION IF EXISTS place_order(text, text, jsonb);

CREATE OR REPLACE FUNCTION place_order(
  customer_name text,
  customer_phone text,
  items jsonb,
  province text,
  city text,
  address text,
  building_unit text DEFAULT NULL,
  postal_code text DEFAULT NULL,
  delivery_notes text DEFAULT NULL,
  latitude double precision DEFAULT NULL,
  longitude double precision DEFAULT NULL
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

  IF length(trim(coalesce(province, ''))) = 0 THEN
    RAISE EXCEPTION 'province is required';
  END IF;

  IF length(trim(coalesce(city, ''))) = 0 THEN
    RAISE EXCEPTION 'city is required';
  END IF;

  IF length(trim(coalesce(address, ''))) < 5 THEN
    RAISE EXCEPTION 'address is required';
  END IF;

  IF (latitude IS NULL) <> (longitude IS NULL) THEN
    RAISE EXCEPTION 'both coordinates are required';
  END IF;

  IF latitude IS NOT NULL AND (latitude < -90 OR latitude > 90 OR longitude < -180 OR longitude > 180) THEN
    RAISE EXCEPTION 'invalid coordinates';
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

  INSERT INTO orders (
    customer_name, customer_phone, items, total_price,
    province, city, address, building_unit, postal_code, delivery_notes, latitude, longitude
  )
  VALUES (
    trim(customer_name), trim(customer_phone), v_items, v_total,
    trim(province), trim(city), trim(address),
    nullif(trim(coalesce(building_unit, '')), ''),
    nullif(trim(coalesce(postal_code, '')), ''),
    nullif(trim(coalesce(delivery_notes, '')), ''),
    latitude, longitude
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION place_order(text, text, jsonb, text, text, text, text, text, text, double precision, double precision) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION place_order(text, text, jsonb, text, text, text, text, text, text, double precision, double precision) TO anon, authenticated;
