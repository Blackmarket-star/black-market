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

  INSERT INTO sales (id, total, date) VALUES (p_sale_id, 0, p_date);

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

  UPDATE sales SET total = v_total WHERE id = p_sale_id;
  RETURN v_total;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_sale(text, jsonb, bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_sale(text, jsonb, bigint) TO authenticated, anon;
