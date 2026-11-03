import type { Order, OrderItem, OrderStatus, PaymentStatus } from "@/types";
import { supabase } from "@/lib/supabase";

export type OrderLineInput = { productId: string; quantity: number };

export type DeliveryInput = {
  province: string;
  city: string;
  address: string;
  buildingUnit: string;
  postalCode: string;
  deliveryNotes: string;
  latitude: number | null;
  longitude: number | null;
};

export type OrderRow = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  items: unknown;
  total_price: number | string;
  status: string;
  payment_status: string;
  province: string | null;
  city: string | null;
  address: string | null;
  building_unit: string | null;
  postal_code: string | null;
  delivery_notes: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export function mapOrderRow(r: OrderRow): Order {
  return {
    id: r.id,
    orderNumber: Number(r.order_number),
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
    paymentStatus: r.payment_status as PaymentStatus,
    province: r.province ?? "",
    city: r.city ?? "",
    address: r.address ?? "",
    buildingUnit: r.building_unit,
    postalCode: r.postal_code,
    deliveryNotes: r.delivery_notes,
    latitude: r.latitude,
    longitude: r.longitude,
    createdAt: new Date(r.created_at).getTime(),
  };
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r) => mapOrderRow(r as OrderRow));
}

export async function placeOrder(input: {
  customerName: string;
  customerPhone: string;
  items: OrderLineInput[];
  delivery: DeliveryInput;
}): Promise<string> {
  const { delivery } = input;
  const { data, error } = await supabase.rpc("place_order", {
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    items: input.items,
    province: delivery.province,
    city: delivery.city,
    address: delivery.address,
    building_unit: delivery.buildingUnit || null,
    postal_code: delivery.postalCode || null,
    delivery_notes: delivery.deliveryNotes || null,
    latitude: delivery.latitude,
    longitude: delivery.longitude,
  });

  if (error) throw error;
  if (typeof data !== "string") throw new Error("invalid order response");
  return data;
}

export async function fetchOrderNumber(orderId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("order_number")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) return null;
  return Number(data.order_number);
}

export async function requestOnlinePayment(orderId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("zarinpal-request", {
    body: { orderId },
  });

  if (error) throw error;
  if (typeof data?.paymentUrl !== "string") throw new Error("invalid payment response");
  return data.paymentUrl;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase.rpc("set_order_status", {
    p_order_id: id,
    p_status: status,
  });

  if (error) throw error;
}
