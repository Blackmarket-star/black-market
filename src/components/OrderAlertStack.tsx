import { BellRing, Eye, X } from "lucide-react";
import type { Order } from "@/types";
import { useNewOrderAlerts } from "@/hooks/useNewOrderAlerts";
import { formatPrice } from "@/lib/format";

type OrderAlertStackProps = {
  onView: (orderId: string) => void;
};

const numberFormat = new Intl.NumberFormat("fa-IR");

export default function OrderAlertStack({ onView }: OrderAlertStackProps) {
  const { alerts, dismiss } = useNewOrderAlerts();

  if (alerts.length === 0) return null;

  const order = alerts[0];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <OrderAlertCard
        key={order.id}
        order={order}
        pendingCount={alerts.length - 1}
        onView={() => {
          onView(order.id);
          dismiss(order.id);
        }}
        onDismiss={() => dismiss(order.id)}
      />
    </div>
  );
}

type OrderAlertCardProps = {
  order: Order;
  pendingCount: number;
  onView: () => void;
  onDismiss: () => void;
};

function OrderAlertCard({ order, pendingCount, onView, onDismiss }: OrderAlertCardProps) {
  const time = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(order.createdAt);

  return (
    <div
      role="alertdialog"
      aria-labelledby="order-alert-title"
      className="w-full max-w-2xl rounded-3xl border border-violet-400/40 bg-neutral-950 text-white shadow-2xl shadow-violet-900/50 p-6 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center shrink-0">
            <BellRing className="w-8 h-8 text-violet-300" />
          </div>
          <div>
            <p id="order-alert-title" className="text-2xl sm:text-3xl font-extrabold leading-tight">سفارش آنلاین جدید!</p>
            <p className="text-sm text-neutral-400 mt-1">
              شماره سفارش {numberFormat.format(order.orderNumber)} · ساعت {time}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="بستن اعلان"
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs text-neutral-400">مشتری</p>
          <p className="font-semibold text-base mt-1 truncate">{order.customerName}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs text-neutral-400">تلفن</p>
          <p className="font-semibold text-base mt-1" dir="ltr">{order.customerPhone}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4 sm:col-span-2">
          <p className="text-xs text-neutral-400">آدرس تحویل</p>
          <p className="font-medium mt-1 truncate">{order.city}، {order.address}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-neutral-200 max-h-32 overflow-y-auto">
        {order.items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-3">
            <span className="truncate">{item.name} × {numberFormat.format(item.quantity)}</span>
            <span className="shrink-0 text-neutral-400">{formatPrice(item.total)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-t border-white/10 pt-6">
        <div>
          <p className="text-xs text-neutral-400">مبلغ کل</p>
          <p className="text-3xl font-extrabold">{formatPrice(order.totalPrice)}</p>
          {pendingCount > 0 && (
            <p className="text-xs text-violet-300 mt-2">
              {numberFormat.format(pendingCount)} سفارش دیگر در انتظار نمایش
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onView}
          className="flex items-center justify-center gap-2 rounded-2xl bg-violet-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-violet-900/40 hover:bg-violet-400 transition"
        >
          <Eye className="w-5 h-5" />
          مشاهده سفارش
        </button>
      </div>
    </div>
  );
}
