import { useState } from "react";
import { AlertCircle, Loader2, LocateFixed, Send } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import type { DeliveryInput } from "@/lib/orders";

export type CartLine = { product: Product; quantity: number };

export type CheckoutFormValues = DeliveryInput & {
  customerName: string;
  customerPhone: string;
};

type CheckoutPanelProps = {
  lines: CartLine[];
  total: number;
  onSubmit: (values: CheckoutFormValues) => Promise<void>;
};

const PHONE_PATTERN = /^[0-9۰-۹+\-\s()]{5,20}$/;
const POSTAL_PATTERN = /^[0-9۰-۹]{10}$/;

const EMPTY_FORM: CheckoutFormValues = {
  customerName: "",
  customerPhone: "",
  province: "",
  city: "",
  address: "",
  buildingUnit: "",
  postalCode: "",
  deliveryNotes: "",
  latitude: null,
  longitude: null,
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition";
const labelClass = "block text-sm font-medium text-neutral-300 mb-1.5";

export default function CheckoutPanel({ lines, total, onSubmit }: CheckoutPanelProps) {
  const [form, setForm] = useState<CheckoutFormValues>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = lines.length > 0 && !submitting;

  function update<K extends keyof CheckoutFormValues>(key: K, value: CheckoutFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      setError("مرورگر شما امکان تعیین موقعیت را ندارد.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update("latitude", pos.coords.latitude);
        update("longitude", pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setError("برای ثبت موقعیت، دسترسی مکان را فعال کنید یا نشانی را کامل وارد کنید.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const values: CheckoutFormValues = {
      ...form,
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      province: form.province.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      buildingUnit: form.buildingUnit.trim(),
      postalCode: form.postalCode.trim(),
      deliveryNotes: form.deliveryNotes.trim(),
    };

    if (!values.customerName) return setError("لطفاً نام خود را وارد کنید.");
    if (!PHONE_PATTERN.test(values.customerPhone)) return setError("لطفاً شماره تماس معتبر وارد کنید.");
    if (!values.province) return setError("لطفاً استان را وارد کنید.");
    if (!values.city) return setError("لطفاً شهر را وارد کنید.");
    if (values.address.length < 5) return setError("لطفاً نشانی کامل را وارد کنید.");
    if (values.postalCode && !POSTAL_PATTERN.test(values.postalCode)) {
      return setError("کد پستی باید ۱۰ رقم باشد.");
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(
        err instanceof Error && /stock/i.test(err.message)
          ? "موجودی برخی کالاها تغییر کرده است. لطفاً سبد خرید را بررسی کنید."
          : "ثبت سفارش انجام نشد. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-neutral-900/80 border border-white/10 p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">سبد خرید</h2>
        <p className="text-sm text-neutral-400 mt-1">
          {lines.length === 0 ? "هنوز کالایی انتخاب نشده است" : `${lines.length} کالا انتخاب شده`}
        </p>
      </div>

      {lines.length > 0 && (
        <ul className="divide-y divide-white/10 max-h-56 overflow-y-auto">
          {lines.map(({ product, quantity }) => (
            <li key={product.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="text-neutral-200 truncate">
                {product.name} <span className="text-neutral-500">× {quantity.toLocaleString("fa-IR")}</span>
              </span>
              <span className="font-semibold text-white shrink-0">{formatPrice(product.salePrice * quantity)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-sm text-neutral-400">جمع کل</span>
        <span className="text-xl font-extrabold text-white">{formatPrice(total)}</span>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold text-violet-300 mb-2">اطلاعات گیرنده</legend>
        <div>
          <label htmlFor="customer-name" className={labelClass}>نام و نام خانوادگی</label>
          <input id="customer-name" value={form.customerName} onChange={(e) => update("customerName", e.target.value)}
            maxLength={100} autoComplete="name" className={inputClass} placeholder="مثلاً علی احمدی" />
        </div>
        <div>
          <label htmlFor="customer-phone" className={labelClass}>شماره تماس</label>
          <input id="customer-phone" value={form.customerPhone} onChange={(e) => update("customerPhone", e.target.value)}
            maxLength={20} inputMode="tel" autoComplete="tel" dir="ltr" className={inputClass} placeholder="09123456789" />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold text-violet-300 mb-2">نشانی تحویل</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="province" className={labelClass}>استان</label>
            <input id="province" value={form.province} onChange={(e) => update("province", e.target.value)} maxLength={60} className={inputClass} />
          </div>
          <div>
            <label htmlFor="city" className={labelClass}>شهر</label>
            <input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} maxLength={60} className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="address" className={labelClass}>نشانی کامل</label>
          <textarea id="address" value={form.address} onChange={(e) => update("address", e.target.value)}
            maxLength={300} rows={3} className={`${inputClass} resize-none`} placeholder="خیابان، کوچه، پلاک" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="building" className={labelClass}>ساختمان و واحد <span className="text-neutral-500">(اختیاری)</span></label>
            <input id="building" value={form.buildingUnit} onChange={(e) => update("buildingUnit", e.target.value)} maxLength={60} className={inputClass} />
          </div>
          <div>
            <label htmlFor="postal" className={labelClass}>کد پستی <span className="text-neutral-500">(اختیاری)</span></label>
            <input id="postal" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)}
              maxLength={10} inputMode="numeric" dir="ltr" className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="notes" className={labelClass}>توضیحات تحویل <span className="text-neutral-500">(اختیاری)</span></label>
          <input id="notes" value={form.deliveryNotes} onChange={(e) => update("deliveryNotes", e.target.value)} maxLength={200} className={inputClass} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
          <span className="text-sm text-neutral-400">
            {form.latitude !== null && form.longitude !== null
              ? <span dir="ltr">{form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}</span>
              : "موقعیت روی نقشه ثبت نشده است"}
          </span>
          <button type="button" onClick={captureLocation} disabled={locating}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-neutral-200 hover:bg-white/10 transition disabled:opacity-60">
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
            ثبت موقعیت فعلی
          </button>
        </div>
      </fieldset>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-sm text-rose-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button type="submit" disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 text-white py-3.5 text-sm font-semibold transition hover:bg-violet-500 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed">
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {submitting ? "در حال ثبت سفارش..." : "ثبت سفارش و پرداخت"}
      </button>
    </form>
  );
}
