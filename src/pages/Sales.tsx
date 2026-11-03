import { useMemo, useState } from "react";
import type { Product, Sale, SaleItem } from "@/types";
import { formatPrice } from "@/lib/format";
import { uid } from "@/lib/storage";
import CategoryTabs, { ALL_CATEGORY } from "@/components/shop/CategoryTabs";
import SaleProductCard from "@/components/sales/SaleProductCard";
import SaleCart, { type CartItem } from "@/components/sales/SaleCart";
import { CheckCircle, Package, Search } from "lucide-react";

type SalesProps = {
  products: Product[];
  sales: Sale[];
  onRecordSale: (sale: Sale) => Promise<void>;
};

const numberFormat = new Intl.NumberFormat("fa-IR");

export default function Sales({ products, sales, onRecordSale }: SalesProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = useMemo(() => products.filter((p) => p.stock > 0), [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of available) {
      if (p.category) counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    return counts;
  }, [available]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return available.filter(
      (p) =>
        (activeCategory === ALL_CATEGORY || p.category === activeCategory) &&
        (query === "" || p.name.toLowerCase().includes(query) || p.barcode.includes(query))
    );
  }, [available, activeCategory, search]);

  const totalQuantity = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartTotal = cart.reduce((sum, c) => sum + c.salePrice * c.quantity, 0);

  function addToCart(p: Product) {
    const existing = cart.find((c) => c.productId === p.id);
    if (existing) {
      if (existing.quantity >= p.stock) return;
      setCart(
        cart.map((c) =>
          c.productId === p.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([
        ...cart,
        { productId: p.id, name: p.name, salePrice: p.salePrice, quantity: 1, unit: p.unit, maxStock: p.stock },
      ]);
    }
  }

  function updateQty(productId: string, delta: number) {
    setCart(
      cart
        .map((c) => {
          if (c.productId !== productId) return c;
          const newQty = c.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > c.maxStock) return c;
          return { ...c, quantity: newQty };
        })
        .filter(Boolean) as CartItem[]
    );
  }

  function setQty(productId: string, qty: number) {
    setCart(
      cart
        .map((c) => {
          if (c.productId !== productId) return c;
          if (qty <= 0) return null;
          return { ...c, quantity: Math.min(qty, c.maxStock) };
        })
        .filter(Boolean) as CartItem[]
    );
  }

  function removeFromCart(productId: string) {
    setCart(cart.filter((c) => c.productId !== productId));
  }

  async function handleSubmit() {
    if (cart.length === 0 || submitting) return;

    const saleItems: SaleItem[] = cart.map((c) => ({
      productId: c.productId,
      name: c.name,
      quantity: c.quantity,
      salePrice: c.salePrice,
      total: c.salePrice * c.quantity,
    }));

    const sale: Sale = { id: uid(), items: saleItems, total: cartTotal, date: Date.now() };

    setSubmitting(true);
    setError(null);
    try {
      await onRecordSale(sale);
      setCart([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("ثبت فروش انجام نشد. موجودی کالاها بررسی و دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-enter rounded-3xl bg-neutral-950 text-white p-4 sm:p-6 space-y-5 border border-white/5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">ثبت فروش</h2>
          <p className="text-sm text-neutral-400 mt-1">کالاها را انتخاب کرده و فاکتور را ثبت کنید</p>
        </div>
        <div className="relative sm:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="جستجوی کالا..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-neutral-900 border border-white/10 py-2.5 pr-10 pl-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
          />
        </div>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3 page-enter">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-200 font-medium">
            فروش با موفقیت ثبت شد و موجودی کالاها به‌روزرسانی شد.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <CategoryTabs
            active={activeCategory}
            counts={categoryCounts}
            total={available.length}
            onSelect={setActiveCategory}
          />

          {available.length === 0 ? (
            <div className="rounded-2xl bg-neutral-900/80 border border-white/10 p-12 text-center">
              <Package className="w-10 h-10 mx-auto text-neutral-500 mb-3" />
              <p className="text-sm text-neutral-300">هیچ کالای موجودی برای فروش ثبت نشده است.</p>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="rounded-2xl bg-neutral-900/80 border border-white/10 p-12 text-center">
              <p className="text-sm text-neutral-300">کالایی با این جستجو یا دسته‌بندی یافت نشد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {visibleProducts.map((p) => (
                <SaleProductCard
                  key={p.id}
                  product={p}
                  inCartQuantity={cart.find((c) => c.productId === p.id)?.quantity ?? 0}
                  onAdd={() => addToCart(p)}
                />
              ))}
            </div>
          )}
        </div>

        <SaleCart
          items={cart}
          total={cartTotal}
          totalQuantity={totalQuantity}
          submitting={submitting}
          onChangeQuantity={updateQty}
          onSetQuantity={setQty}
          onRemove={removeFromCart}
          onSubmit={handleSubmit}
        />
      </div>

      {sales.length > 0 && (
        <div className="rounded-2xl bg-neutral-900/80 border border-white/10 p-5">
          <h3 className="text-base font-semibold mb-4">آخرین فروش‌ها</h3>
          <div className="space-y-2">
            {sales.slice(-5).reverse().map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-300 truncate">
                    {s.items.map((i) => `${i.name} (${numberFormat.format(i.quantity)})`).join("، ")}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(s.date))}
                  </p>
                </div>
                <span className="text-sm font-bold mr-3 text-white">{formatPrice(s.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
