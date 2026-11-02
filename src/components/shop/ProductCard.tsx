import { Minus, Plus } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";

const numberFormat = new Intl.NumberFormat("fa-IR");

type ProductCardProps = {
  product: Product;
  quantity: number;
  onChange: (quantity: number) => void;
};

export default function ProductCard({ product, quantity, onChange }: ProductCardProps) {
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;

  return (
    <article className="group rounded-3xl bg-neutral-900/80 border border-white/10 p-5 flex flex-col gap-5 transition duration-300 hover:border-violet-400/40 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(139,92,246,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-white leading-snug">{product.name}</h3>
          <p className="text-xs text-neutral-400 mt-1">واحد: {product.unit}</p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
            outOfStock
              ? "bg-rose-500/15 text-rose-300"
              : lowStock
              ? "bg-amber-500/15 text-amber-300"
              : "bg-emerald-500/15 text-emerald-300"
          }`}
        >
          {outOfStock ? "ناموجود" : lowStock ? "موجودی محدود" : "موجود"}
        </span>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-400 mb-1">قیمت</p>
          <p className="text-lg font-extrabold text-white">{formatPrice(product.salePrice)}</p>
        </div>

        {outOfStock ? (
          <span className="text-sm text-neutral-500">فعلاً در دسترس نیست</span>
        ) : (
          <div className="flex items-center rounded-xl border border-white/10 bg-black/40 overflow-hidden">
            <button
              type="button"
              onClick={() => onChange(quantity - 1)}
              disabled={quantity === 0}
              aria-label={`کاهش تعداد ${product.name}`}
              className="w-10 h-10 flex items-center justify-center text-neutral-300 hover:bg-white/10 disabled:text-neutral-700 disabled:hover:bg-transparent transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-sm font-bold text-white">
              {numberFormat.format(quantity)}
            </span>
            <button
              type="button"
              onClick={() => onChange(quantity + 1)}
              disabled={quantity >= product.stock}
              aria-label={`افزایش تعداد ${product.name}`}
              className="w-10 h-10 flex items-center justify-center text-neutral-300 hover:bg-white/10 disabled:text-neutral-700 disabled:hover:bg-transparent transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
