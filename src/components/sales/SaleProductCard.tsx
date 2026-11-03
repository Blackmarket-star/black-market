import { useState } from "react";
import { ImageOff, Plus } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";

const numberFormat = new Intl.NumberFormat("fa-IR");

type SaleProductCardProps = {
  product: Product;
  inCartQuantity: number;
  onAdd: () => void;
};

export default function SaleProductCard({ product, inCartQuantity, onAdd }: SaleProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!product.imageUrl && !imageFailed;
  const selected = inCartQuantity > 0;

  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={`افزودن ${product.name} به سبد`}
      className={`group text-right rounded-2xl bg-neutral-900/80 border p-3 flex flex-col gap-2 transition duration-200 hover:-translate-y-0.5 hover:border-violet-400/50 active:scale-[0.98] ${
        selected ? "border-violet-500 ring-1 ring-violet-500/40" : "border-white/10"
      }`}
    >
      <div className="relative w-full h-20 rounded-xl bg-neutral-800 overflow-hidden flex items-center justify-center">
        {showImage ? (
          <img
            src={product.imageUrl ?? undefined}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-contain p-1.5 transition duration-300 group-hover:scale-105"
          />
        ) : (
          <ImageOff className="w-6 h-6 text-neutral-600" />
        )}
        {selected && (
          <span className="absolute top-1.5 left-1.5 min-w-[1.5rem] h-6 px-1.5 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
            {numberFormat.format(inCartQuantity)}
          </span>
        )}
      </div>

      <p className="text-sm font-semibold text-white leading-snug line-clamp-2 min-h-[2.5rem]">{product.name}</p>

      <div className="flex items-end justify-between gap-2 mt-auto">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-violet-300">{formatPrice(product.salePrice)}</p>
          <p className="text-[11px] text-neutral-400">
            موجودی: {numberFormat.format(product.stock)} {product.unit}
          </p>
        </div>
        <span className="shrink-0 w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center group-hover:bg-violet-500 transition">
          <Plus className="w-4 h-4" />
        </span>
      </div>
    </button>
  );
}
