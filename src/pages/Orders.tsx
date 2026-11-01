import { useEffect, useState } from "react";
import { AlertCircle, Loader2, RefreshCw, ClipboardList } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { fetchOrders, updateOrderStatus } from "@/lib/orders";
import { formatDate, formatPrice } from "@/lib/format";

const tp = { color: "var(--text-primary)" };
const ts = { color: "var(--text-secondary)" };
const tm = { color: "var(--text-muted)" };

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "در انتظار",
  completed: "تکمیل شده",
  canceled: "لغو شده",
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  canceled: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
};

const STATUSES: OrderStatus[] = ["pending", "completed", "canceled"];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setLoadError(null);
    try {
      setOrders(await fetchOrders());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "خطا در بارگذاری سفارش‌ها");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(order: Order, status: OrderStatus) {
    if (status === order.status) return;
    setActionError(null);
    setUpdatingId(order.id);
    const previous = order.status;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    try {
      await updateOrderStatus(order.id, status);
    } catch (err) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: previous } : o)));
      setActionError(err instanceof Error ? err.message : "خطا در تغییر وضعیت سفارش");
    } finally {
      setUpdatingId(null);
    }
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="page-enter space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold" style={tp}>سفارش‌های آنلاین</h2>
          <p className="text-sm mt-1" style={ts}>
            {orders.length.toLocaleString("fa-IR")} سفارش ثبت شده، {pendingCount.toLocaleString("fa-IR")} سفارش در انتظار
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-60"
          style={{ color: "var(--text-secondary)", background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          بارگذاری مجدد
        </button>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 rounded-2xl p-4 text-sm font-medium" style={{ background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#e11d48" }}>
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="glass rounded-[1.75rem] p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm" style={ts}>در حال بارگذاری سفارش‌ها...</p>
          </div>
        ) : loadError ? (
          <div className="flex items-start gap-2 rounded-2xl p-4 text-sm font-medium" style={{ background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#e11d48" }}>
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{loadError}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--surface)" }}>
              <ClipboardList className="w-8 h-8" style={tm} />
            </div>
            <p className="text-sm font-medium" style={ts}>هنوز سفارشی ثبت نشده است</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs border-b" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
                  <th className="text-right py-3 font-medium">مشتری</th>
                  <th className="text-right py-3 font-medium">تلفن</th>
                  <th className="text-right py-3 font-medium">اقلام</th>
                  <th className="text-right py-3 font-medium">مبلغ کل</th>
                  <th className="text-right py-3 font-medium">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 align-top" style={{ borderColor: "var(--border)" }}>
                    <td className="py-4 pl-4">
                      <p className="font-medium" style={tp}>{order.customerName}</p>
                      <p className="text-xs mt-1" style={tm}>{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="py-4 pl-4 text-xs" style={ts} dir="ltr">{order.customerPhone}</td>
                    <td className="py-4 pl-4 text-xs space-y-1 min-w-[12rem]" style={ts}>
                      {order.items.map((item) => (
                        <p key={item.productId}>
                          {item.name} × {item.quantity.toLocaleString("fa-IR")}
                        </p>
                      ))}
                    </td>
                    <td className="py-4 pl-4 font-bold whitespace-nowrap" style={tp}>{formatPrice(order.totalPrice)}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                          aria-label="تغییر وضعیت سفارش"
                          className="text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60"
                          style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
