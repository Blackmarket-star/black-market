CREATE OR REPLACE FUNCTION public.set_order_status(p_order_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
VALUES ('order-' || p_order_id::text || '-' || v_idx::text || '-' || v_now_ms::text, v_pid, v_name, 'out', v_qty, v_now_ms, 'سفارش آنلاین');
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
VALUES ('order-restore-' || p_order_id::text || '-' || v_idx::text || '-' || v_now_ms::text, v_pid, v_name, 'in', v_qty, v_now_ms, 'لغو سفارش آنلاین');
END LOOP;
END IF;

UPDATE orders
SET status = p_status,
stock_deducted_at = CASE WHEN p_status = 'completed' THEN now() ELSE NULL END
WHERE id = p_order_id;
END;
$function$;
