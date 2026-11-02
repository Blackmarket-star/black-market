import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const merchantId = Deno.env.get("ZARINPAL_MERCHANT_ID");
    const shopUrl = Deno.env.get("SHOP_PUBLIC_URL");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!merchantId || !shopUrl || !supabaseUrl || !serviceKey) {
      return json({ error: "payment is not configured" }, 503);
    }

    const body = await req.json().catch(() => null);
    const orderId = typeof body?.orderId === "string" ? body.orderId : "";
    if (!UUID_PATTERN.test(orderId)) {
      return json({ error: "invalid order" }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total_price, payment_status")
      .eq("id", orderId)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order) return json({ error: "order not found" }, 404);
    if (order.payment_status === "paid") return json({ error: "order already paid" }, 409);

    const amount = Math.round(Number(order.total_price));
    if (!Number.isFinite(amount) || amount <= 0) {
      return json({ error: "invalid order amount" }, 422);
    }

    const zarinpalResponse = await fetch("https://payment.zarinpal.com/pg/v4/payment/request.json", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount,
        currency: "IRT",
        description: "سفارش آنلاین Black-Market",
        callback_url: `${supabaseUrl}/functions/v1/zarinpal-callback?order=${orderId}`,
        metadata: { order_id: orderId },
      }),
    });
    const payload = await zarinpalResponse.json().catch(() => null);
    const authority = payload?.data?.authority;
    if (!zarinpalResponse.ok || payload?.data?.code !== 100 || typeof authority !== "string") {
      console.error("zarinpal request rejected", payload?.errors ?? payload);
      return json({ error: "payment request failed" }, 502);
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ payment_status: "pending", payment_authority: authority })
      .eq("id", orderId);
    if (updateError) throw updateError;

    return json({ paymentUrl: `https://payment.zarinpal.com/pg/StartPay/${authority}` });
  } catch (err) {
    console.error(err);
    return json({ error: "unexpected error" }, 500);
  }
});
