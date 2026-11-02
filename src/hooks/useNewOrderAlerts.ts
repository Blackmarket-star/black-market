import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { mapOrderRow, type OrderRow } from "@/lib/orders";
import type { Order } from "@/types";

export function useNewOrderAlerts() {
  const [alerts, setAlerts] = useState<Order[]>([]);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const channel = supabase
      .channel(`admin-new-orders-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = mapOrderRow(payload.new as OrderRow);
          if (seenIds.current.has(order.id)) return;
          seenIds.current.add(order.id);
          setAlerts((prev) => [order, ...prev]);
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("new order alerts subscription failed:", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((o) => o.id !== id));
  }, []);

  return { alerts, dismiss };
}
