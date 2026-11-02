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

  return (
    <div className="fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-4 px-4 pointer-events-none">
      {alerts.map((order) => (
        <OrderAlertCard
          key={order.id}
          order={order}
          onView={() => {
            onView(order.id);
            dismiss(order.id);
          }}
          onDismiss={() => dismiss(order.id)}
        />
      ))}
    </div>
  );
}

type OrderAlertCardProps = {
  order: Order;
  onView: () => void;
  onDismiss: () => void;
};

function OrderAlertCard({ order, onView, onDismiss }: OrderAlertCardProps) {
  const time = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(order.createdAt);

  return (
    <div
      role="alert"
      className="pointer-events-auto w-full max-w-lg rounded-3xl border border-violet-400/30 bg-neutral-950 text-white shadow-2xl shadow-violet-900/40 p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center">
            <BellRing className="w-6 h-6 text-violet-300" />
          </div>
          <div>
            <p className="text-lg font-extrabold">سفارش جدید آنلاین</p>
            <p className="text-xs text-neutral-400 mt-0.5">
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
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="text-xs text-neutral-400">مشتری</p>
          <p className="font-semibold mt-1 truncate">{order.customerName}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="text-xs text-neutral-400">تلفن</p>
          <p className="font-semibold mt-1" dir="ltr">{order.customerPhone}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3 col-span-2">
          <p className="text-xs text-neutral-400">آدرس</p>
          <p className="font-medium mt-1 truncate">{order.city}، {order.address}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 text-sm text-neutral-200 max-h-28 overflow-y-auto">
        {order.items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-3">
            <span className="truncate">{item.name} × {numberFormat.format(item.quantity)}</span>
            <span className="shrink-0 text-neutral-400">{formatPrice(item.total)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
        <div>
          <p className="text-xs text-neutral-400">مبلغ کل</p>
          <p className="text-xl font-extrabold">{formatPrice(order.totalPrice)}</p>
        </div>
        <button
          type="button"
          onClick={onView}
          className="flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-400 transition"
        >
          <Eye className="w-4 h-4" />
          مشاهده سفارش
        </button>
      </div>
    </div>
  );
}
