import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Minus, PackageOpen, Plus, RotateCcw, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { fetchProducts } from "@/lib/storage";
import { placeOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import CheckoutPanel, { type CartLine } from "@/components/shop/CheckoutPanel";

const numberFormat = new Intl.NumberFormat("fa-IR");

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orderCode, setOrderCode] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    setLoadError(null);
    try {
      setProducts(await fetchProducts());
    } catch {
      setLoadError("بارگذاری کالاها انجام نشد. لطفاً صفحه را دوباره باز کنید.");
    } finally {
      setLoading(false);
    }
  }

  const lines: CartLine[] = products
    .map((product) => ({ product, quantity: Math.min(cart[product.id] ?? 0, product.stock) }))
    .filter((line) => line.quantity > 0);
  const total = lines.reduce((sum, l) => sum + l.product.salePrice * l.quantity, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  function setQuantity(product: Product, quantity: number) {
    const clamped = Math.max(0, Math.min(quantity, product.stock));
    setCart((prev) => {
      const next = { ...prev };
      if (clamped === 0) {
        delete next[product.id];
      } else {
        next[product.id] = clamped;
      }
      return next;
    });
  }

  async function handleSubmit(customerName: string, customerPhone: string) {
    const orderId = await placeOrder({
      customerName,
      customerPhone,
      items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
    });
    setCart({});
    setOrderCode(orderId.slice(0, 8).toUpperCase());
  }

  if (orderCode) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-sm p-8 text-center space-y-5">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-extrabold">سفارش شما ثبت شد</h1>
            <p className="text-sm text-slate-500">کد پیگیری سفارش</p>
            <p className="text-2xl font-extrabold tracking-widest text-slate-900" dir="ltr">{orderCode}</p>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            فروشگاه سفارش شما را بررسی می‌کند و در صورت نیاز با شماره تماس ثبت‌شده هماهنگ می‌شود.
          </p>
          <button
            onClick={() => setOrderCode(null)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white py-3.5 text-sm font-semibold hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-4 h-4" />
            ثبت سفارش جدید
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="Black-Market" className="w-10 h-10 rounded-xl object-cover shrink-0" />
            <div className="min-w-0">
              <p className="font-extrabold leading-tight">فروشگاه آنلاین</p>
              <p className="text-xs text-slate-500">ثبت سفارش سریع و آسان</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 px-4 py-2.5 text-sm font-medium hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت</span>
            </a>
            <a
              href="#checkout"
              className="flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-slate-800 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>سبد خرید</span>
              {itemCount > 0 && (
                <span className="min-w-[1.5rem] h-6 px-1.5 rounded-full bg-emerald-400 text-slate-900 text-xs font-bold flex items-center justify-center">
                  {numberFormat.format(itemCount)}
                </span>
              )}
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-28 lg:pb-8">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <section className="lg:col-span-2 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold">کالاهای فروشگاه</h1>
              <p className="text-sm text-slate-500 mt-1">تعداد مورد نظر را انتخاب کنید و سفارش خود را ثبت کنید.</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="text-sm">در حال بارگذاری کالاها...</p>
              </div>
            ) : loadError ? (
              <div className="flex items-start gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <span>{loadError}</span>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
                <PackageOpen className="w-10 h-10 text-slate-400" />
                <p className="text-sm">در حال حاضر کالایی برای فروش موجود نیست.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={Math.min(cart[product.id] ?? 0, product.stock)}
                    onChange={(qty) => setQuantity(product, qty)}
                  />
                ))}
              </div>
            )}
          </section>

          <aside id="checkout" className="scroll-mt-24 lg:sticky lg:top-24">
            <CheckoutPanel lines={lines} total={total} onSubmit={handleSubmit} />
          </aside>
        </div>
      </main>

      {itemCount > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">{numberFormat.format(itemCount)} قلم انتخاب شده</p>
            <p className="font-extrabold truncate">{formatPrice(total)}</p>
          </div>
          <a
            href="#checkout"
            className="rounded-xl bg-slate-900 text-white px-5 py-3 text-sm font-semibold shrink-0"
          >
            ادامه و ثبت سفارش
          </a>
        </div>
      )}
    </div>
  );
}

type ProductCardProps = {
  product: Product;
  quantity: number;
  onChange: (quantity: number) => void;
};

function ProductCard({ product, quantity, onChange }: ProductCardProps) {
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;

  return (
    <article className="rounded-3xl bg-white border border-slate-200 p-5 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 leading-snug">{product.name}</h3>
          <p className="text-xs text-slate-500 mt-1">واحد: {product.unit}</p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
            outOfStock
              ? "bg-rose-50 text-rose-600"
              : lowStock
              ? "bg-amber-50 text-amber-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {outOfStock ? "ناموجود" : lowStock ? "موجودی محدود" : "موجود"}
        </span>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 mb-1">قیمت</p>
          <p className="text-lg font-extrabold text-slate-900">{formatPrice(product.salePrice)}</p>
        </div>

        {outOfStock ? (
          <span className="text-sm text-slate-400">فعلاً در دسترس نیست</span>
        ) : (
          <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => onChange(quantity - 1)}
              disabled={quantity === 0}
              aria-label={`کاهش تعداد ${product.name}`}
              className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-sm font-bold text-slate-900">
              {numberFormat.format(quantity)}
            </span>
            <button
              type="button"
              onClick={() => onChange(quantity + 1)}
              disabled={quantity >= product.stock}
              aria-label={`افزایش تعداد ${product.name}`}
              className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
