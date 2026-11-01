import { useState } from "react";
import { AlertCircle, Loader2, Send } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";

export type CartLine = { product: Product; quantity: number };

type CheckoutPanelProps = {
  lines: CartLine[];
  total: number;
  onSubmit: (customerName: string, customerPhone: string) => Promise<void>;
};

const PHONE_PATTERN = /^[0-9۰-۹+\-\s()]{5,20}$/;

export default function CheckoutPanel({ lines, total, onSubmit }: CheckoutPanelProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = lines.length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = customerName.trim();
    const phone = customerPhone.trim();

    if (!name) {
      setError("لطفاً نام خود را وارد کنید.");
      return;
    }
    if (!PHONE_PATTERN.test(phone)) {
      setError("لطفاً شماره تماس معتبر وارد کنید.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(name, phone);
      setCustomerName("");
      setCustomerPhone("");
    } catch {
      setError("ثبت سفارش انجام نشد. لطفاً دوباره تلاش کنید؛ ممکن است موجودی برخی کالاها تغییر کرده باشد.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-5"
    >
      <div>
        <h2 className="text-lg font-bold text-slate-900">سبد خرید</h2>
        <p className="text-sm text-slate-500 mt-1">
          {lines.length === 0 ? "هنوز کالایی انتخاب نشده است" : `${lines.length} کالا انتخاب شده`}
        </p>
      </div>

      {lines.length > 0 && (
        <ul className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
          {lines.map(({ product, quantity }) => (
            <li key={product.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="text-slate-700 truncate">
                {product.name} <span className="text-slate-400">× {quantity.toLocaleString("fa-IR")}</span>
              </span>
              <span className="font-semibold text-slate-900 shrink-0">
                {formatPrice(product.salePrice * quantity)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="text-sm text-slate-500">جمع کل</span>
        <span className="text-xl font-extrabold text-slate-900">{formatPrice(total)}</span>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="customer-name" className="block text-sm font-medium text-slate-700 mb-1.5">
            نام و نام خانوادگی
          </label>
          <input
            id="customer-name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            maxLength={100}
            autoComplete="name"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            placeholder="مثلاً علی احمدی"
          />
        </div>
        <div>
          <label htmlFor="customer-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
            شماره تماس
          </label>
          <input
            id="customer-phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            maxLength={20}
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            placeholder="09123456789"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white py-3.5 text-sm font-semibold transition hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {submitting ? "در حال ثبت سفارش..." : "ثبت سفارش"}
      </button>
    </form>
  );
}
