import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function redirectToShop(shopUrl: string, result: string, orderNumber?: number) {
  const params = new URLSearchParams({ payment: result });
  if (orderNumber !== undefined) params.set("order", String(orderNumber));
  return new Response(null, {
    status: 303,
    headers: { ...corsHeaders, Location: `${shopUrl}/shop?${params.toString()}` },
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
      return new Response("payment is not configured", { status: 503, headers: corsHeaders });
    }

    const url = new URL(req.url);
    const orderId = url.searchParams.get("order") ?? "";
    const authority = url.searchParams.get("Authority") ?? "";
    const status = url.searchParams.get("Status") ?? "";
    if (!UUID_PATTERN.test(orderId) || !authority) {
      return redirectToShop(shopUrl, "failed");
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, total_price, payment_status, payment_authority")
      .eq("id", orderId)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order || order.payment_authority !== authority) {
      return redirectToShop(shopUrl, "failed");
    }
    if (order.payment_status === "paid") {
      return redirectToShop(shopUrl, "paid", order.order_number);
    }

    if (status !== "OK") {
      await supabase.from("orders").update({ payment_status: "failed" }).eq("id", orderId);
      return redirectToShop(shopUrl, "failed", order.order_number);
    }

    const verifyResponse = await fetch("https://payment.zarinpal.com/pg/v4/payment/verify.json", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: Math.round(Number(order.total_price)),
        currency: "IRT",
        authority,
      }),
    });
    const payload = await verifyResponse.json().catch(() => null);
    const code = payload?.data?.code;

    if (verifyResponse.ok && (code === 100 || code === 101)) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          payment_ref_id: payload?.data?.ref_id !== undefined ? String(payload.data.ref_id) : null,
          paid_at: new Date().toISOString(),
        })
        .eq("id", orderId);
      if (updateError) throw updateError;
      return redirectToShop(shopUrl, "paid", order.order_number);
    }

    console.error("zarinpal verify rejected", payload?.errors ?? payload);
    await supabase.from("orders").update({ payment_status: "failed" }).eq("id", orderId);
    return redirectToShop(shopUrl, "failed", order.order_number);
  } catch (err) {
    console.error(err);
    return new Response("unexpected error", { status: 500, headers: corsHeaders });
  }
});
