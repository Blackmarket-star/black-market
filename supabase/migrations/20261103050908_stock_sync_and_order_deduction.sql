ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_deducted_at timestamptz;

CREATE OR REPLACE FUNCTION public.record_stock_movement(
  p_product_id text,
  p_type text,
  p_quantity integer,
  p_movement_id text,
  p_note text,
  p_date bigint
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
BEGIN
  IF p_type NOT IN ('in', 'out') THEN
    RAISE EXCEPTION 'invalid movement type';
  END IF;
  IF p_quantity IS NULL OR p_quantity < 1 THEN
    RAISE EXCEPTION 'invalid quantity';
  END IF;

  UPDATE products
  SET stock = stock + CASE WHEN p_type = 'in' THEN p_quantity ELSE -p_quantity END
  WHERE id = p_product_id
    AND (p_type = 'in' OR stock >= p_quantity)
  RETURNING name INTO v_name;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'not enough stock or product not found';
  END IF;

  INSERT INTO stock_movements (id, product_id, product_name, type, quantity, date, note)
  VALUES (p_movement_id, p_product_id, v_name, p_type, p_quantity, p_date, p_note);
END;
$$;

CREATE OR REPLACE FUNCTION public.record_sale(
  p_sale_id text,
  p_items jsonb,
  p_date bigint
) RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_idx bigint;
  v_line jsonb;
  v_pid text;
  v_qty integer;
  v_product products%ROWTYPE;
  v_total bigint := 0;
BEGIN
  IF length(trim(coalesce(p_sale_id, ''))) = 0 THEN
    RAISE EXCEPTION 'invalid sale';
  END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'sale has no items';
  END IF;

  FOR v_idx, v_line IN
    SELECT ord, value FROM jsonb_array_elements(p_items) WITH ORDINALITY AS t(value, ord)
  LOOP
    v_pid := v_line->>'productId';
    v_qty := (v_line->>'quantity')::integer;
    IF v_qty IS NULL OR v_qty < 1 OR v_qty > 100000 THEN
      RAISE EXCEPTION 'invalid quantity';
    END IF;

    UPDATE products
    SET stock = stock - v_qty
    WHERE id = v_pid AND stock >= v_qty
    RETURNING * INTO v_product;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'not enough stock for %', coalesce(v_line->>'name', v_pid);
    END IF;

    INSERT INTO sale_items (id, sale_id, product_id, name, quantity, sale_price, total)
    VALUES (gen_random_uuid(), p_sale_id, v_pid, v_product.name, v_qty,
            v_product.sale_price, v_product.sale_price * v_qty);

    INSERT INTO stock_movements (id, product_id, product_name, type, quantity, date, note)
    VALUES (p_sale_id || '-' || v_idx::text, v_pid, v_product.name, 'out', v_qty, p_date, 'فروش');

    v_total := v_total + v_product.sale_price * v_qty;
  END LOOP;

  INSERT INTO sales (id, total, date) VALUES (p_sale_id, v_total, p_date);
  RETURN v_total;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_order_status(p_order_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_idx bigint;
  v_line jsonb;
  v_pid text;
  v_qty integer;
  v_name text;
  v_now_ms bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
BEGIN
  IF p_status NOT IN ('pending', 'completed', 'canceled') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;

  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order not found';
  END IF;

  IF v_order.status = p_status THEN
    RETURN;
  END IF;

  IF p_status = 'completed' AND v_order.stock_deducted_at IS NULL THEN
    FOR v_idx, v_line IN
      SELECT ord, value FROM jsonb_array_elements(v_order.items) WITH ORDINALITY AS t(value, ord)
    LOOP
      v_pid := v_line->>'productId';
      v_qty := (v_line->>'quantity')::integer;

      UPDATE products
      SET stock = stock - v_qty
      WHERE id = v_pid AND stock >= v_qty
      RETURNING name INTO v_name;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'not enough stock for %', coalesce(v_line->>'name', v_pid);
      END IF;

      INSERT INTO stock_movements (id, product_id, product_name, type, quantity, date, note)
      VALUES ('order-' || p_order_id::text || '-' || v_idx::text, v_pid, v_name, 'out', v_qty, v_now_ms, 'سفارش آنلاین');
    END LOOP;
  ELSIF p_status <> 'completed' AND v_order.stock_deducted_at IS NOT NULL THEN
    FOR v_idx, v_line IN
      SELECT ord, value FROM jsonb_array_elements(v_order.items) WITH ORDINALITY AS t(value, ord)
    LOOP
      v_pid := v_line->>'productId';
      v_qty := (v_line->>'quantity')::integer;

      UPDATE products
      SET stock = stock + v_qty
      WHERE id = v_pid
      RETURNING name INTO v_name;

      IF NOT FOUND THEN
        CONTINUE;
      END IF;

      INSERT INTO stock_movements (id, product_id, product_name, type, quantity, date, note)
      VALUES ('order-restore-' || p_order_id::text || '-' || v_idx::text, v_pid, v_name, 'in', v_qty, v_now_ms, 'لغو سفارش آنلاین');
    END LOOP;
  END IF;

  UPDATE orders
  SET status = p_status,
      stock_deducted_at = CASE WHEN p_status = 'completed' THEN now() ELSE NULL END
  WHERE id = p_order_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_stock_movement(text, text, integer, text, text, bigint) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_sale(text, jsonb, bigint) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_order_status(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_stock_movement(text, text, integer, text, text, bigint) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.record_sale(text, jsonb, bigint) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.set_order_status(uuid, text) TO authenticated, anon;

REVOKE UPDATE ON orders FROM anon, authenticated;
