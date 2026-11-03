import { useState } from "react";
import { ImageOff, Minus, Plus, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { categoryLabel } from "@/lib/productCategories";

const numberFormat = new Intl.NumberFormat("fa-IR");

type ProductCardProps = {
  product: Product;
  quantity: number;
  onChange: (quantity: number) => void;
};

export default function ProductCard({ product, quantity, onChange }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;
  const showImage = !!product.imageUrl && !imageFailed;

  return (
    <article className="group rounded-3xl bg-neutral-900/80 border border-white/10 overflow-hidden flex flex-col transition duration-300 hover:border-violet-400/40 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(139,92,246,0.35)]">
      <div className="relative h-28 bg-neutral-800 overflow-hidden">
        {showImage ? (
          <img
            src={product.imageUrl ?? undefined}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-contain p-2 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-neutral-500">
            <ImageOff className="w-8 h-8" />
            <span className="text-xs">بدون تصویر</span>
          </div>
        )}
        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md ${
            outOfStock
              ? "bg-rose-500/20 text-rose-200"
              : lowStock
              ? "bg-amber-500/20 text-amber-200"
              : "bg-emerald-500/20 text-emerald-200"
          }`}
        >
          {outOfStock ? "ناموجود" : lowStock ? "موجودی محدود" : "موجود"}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="min-w-0">
          <h3 className="font-bold text-white leading-snug line-clamp-2">{product.name}</h3>
          <p className="text-xs text-neutral-400 mt-1">
            {categoryLabel(product.category)} · واحد: {product.unit}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-neutral-400 mb-1">قیمت</p>
            <p className="text-lg font-extrabold text-white">{formatPrice(product.salePrice)}</p>
          </div>

          {outOfStock ? (
            <span className="text-sm text-neutral-500">فعلاً در دسترس نیست</span>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={() => onChange(1)}
              aria-label={`افزودن ${product.name} به سبد`}
              className="flex items-center gap-2 rounded-xl bg-violet-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-violet-500 active:scale-95 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              افزودن به سبد
            </button>
          ) : (
            <div className="flex items-center rounded-xl border border-white/10 bg-black/40 overflow-hidden">
              <button
                type="button"
                onClick={() => onChange(quantity - 1)}
                aria-label={`کاهش تعداد ${product.name}`}
                className="w-10 h-10 flex items-center justify-center text-neutral-300 hover:bg-white/10 transition"
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
      </div>
    </article>
  );
}
