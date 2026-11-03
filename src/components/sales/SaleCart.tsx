import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";

export type CartItem = {
  productId: string;
  name: string;
  salePrice: number;
  quantity: number;
  unit: string;
  maxStock: number;
};

const numberFormat = new Intl.NumberFormat("fa-IR");

type SaleCartProps = {
  items: CartItem[];
  total: number;
  totalQuantity: number;
  submitting: boolean;
  onChangeQuantity: (productId: string, delta: number) => void;
  onSetQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onSubmit: () => void;
};

export default function SaleCart({
  items,
  total,
  totalQuantity,
  submitting,
  onChangeQuantity,
  onSetQuantity,
  onRemove,
  onSubmit,
}: SaleCartProps) {
  return (
    <aside className="rounded-3xl bg-neutral-900/80 border border-white/10 overflow-hidden flex flex-col lg:sticky lg:top-24 max-h-[calc(100vh-7rem)]">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-violet-300" />
          <h3 className="font-bold text-white">سبد فروش</h3>
        </div>
        {totalQuantity > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-200">
            {numberFormat.format(totalQuantity)} عدد
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-[8rem]">
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-neutral-300">سبد خالی است</p>
            <p className="text-xs text-neutral-500 mt-1">کالاها را از سمت راست انتخاب کنید</p>
          </div>
        ) : (
          <ul className="p-3 space-y-2">
            {items.map((item) => (
              <li key={item.productId} className="rounded-2xl bg-black/40 border border-white/5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{formatPrice(item.salePrice)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.productId)}
                    aria-label={`حذف ${item.name} از سبد`}
                    className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500/15 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center rounded-xl border border-white/10 bg-neutral-950 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onChangeQuantity(item.productId, -1)}
                      aria-label={`کاهش تعداد ${item.name}`}
                      className="w-8 h-8 flex items-center justify-center text-neutral-300 hover:bg-white/10 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={item.maxStock}
                      value={item.quantity}
                      onChange={(e) => onSetQuantity(item.productId, Number(e.target.value))}
                      aria-label={`تعداد ${item.name}`}
                      className="w-12 h-8 text-center text-sm font-bold text-white bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => onChangeQuantity(item.productId, 1)}
                      disabled={item.quantity >= item.maxStock}
                      aria-label={`افزایش تعداد ${item.name}`}
                      className="w-8 h-8 flex items-center justify-center text-neutral-300 hover:bg-white/10 disabled:text-neutral-700 disabled:hover:bg-transparent transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-white">{formatPrice(item.salePrice * item.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className="px-5 py-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">تعداد کل</span>
            <span className="font-semibold text-white">{numberFormat.format(totalQuantity)} عدد</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">جمع کل</span>
            <span className="text-lg font-extrabold text-white">{formatPrice(total)}</span>
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-violet-600 text-white py-3 text-sm font-semibold hover:bg-violet-500 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_12px_32px_-12px_rgba(139,92,246,0.7)]"
          >
            {submitting ? "در حال ثبت..." : "ثبت فاکتور فروش"}
          </button>
        </div>
      )}
    </aside>
  );
}
