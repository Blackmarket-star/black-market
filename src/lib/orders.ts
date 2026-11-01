import type { Order, OrderItem, OrderStatus } from "@/types";
import { supabase } from "@/lib/supabase";

export type OrderLineInput = { productId: string; quantity: number };

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    items: Array.isArray(r.items)
      ? (r.items as OrderItem[]).map((it) => ({
          productId: String(it.productId),
          name: String(it.name),
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          total: Number(it.total),
        }))
      : [],
    totalPrice: Number(r.total_price),
    status: r.status as OrderStatus,
    createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function placeOrder(input: {
  customerName: string;
  customerPhone: string;
  items: OrderLineInput[];
}): Promise<string> {
  const { data, error } = await supabase.rpc("place_order", {
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    items: input.items,
  });

  if (error) throw error;
  if (typeof data !== "string") throw new Error("invalid order response");
  return data;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("id");

  if (error) throw error;
  if (!data || data.length === 0) throw new Error("order was not updated");
}
