import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, MapPin, PackageOpen, RotateCcw, Search, ShoppingBag, XCircle } from "lucide-react";
import type { Product, StoreSettings } from "@/types";
import { fetchProducts } from "@/lib/storage";
import { fetchOrderNumber, placeOrder, requestOnlinePayment } from "@/lib/orders";
import { fetchStoreSettings, EMPTY_STORE_SETTINGS } from "@/lib/storeSettings";
import { formatPrice } from "@/lib/format";
import CheckoutPanel, { type CartLine, type CheckoutFormValues } from "@/components/shop/CheckoutPanel";
import ProductCard from "@/components/shop/ProductCard";
import CategoryTabs, { ALL_CATEGORY } from "@/components/shop/CategoryTabs";

const numberFormat = new Intl.NumberFormat("fa-IR");

function normalizeSearch(value: string): string {
  return value.toLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک").trim();
}

type PaymentReturn = { status: "paid" | "failed"; orderNumber: string | null };

type PlacedOrder = { orderNumber: number | null };

function readPaymentReturn(): PaymentReturn | null {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("payment");
  if (status !== "paid" && status !== "failed") return null;
  const orderNumber = params.get("order");
  return { status, orderNumber: orderNumber && /^\d+$/.test(orderNumber) ? orderNumber : null };
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [paymentReturn] = useState<PaymentReturn | null>(readPaymentReturn);
  const [store, setStore] = useState<StoreSettings>(EMPTY_STORE_SETTINGS);
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadProducts();
    fetchStoreSettings()
      .then(setStore)
      .catch(() => setStore(EMPTY_STORE_SETTINGS));
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

  const categoryCounts = products.reduce<Record<string, number>>((acc, p) => {
    if (p.category) acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  const normalizedQuery = normalizeSearch(query);
  const visibleProducts = products.filter(
    (p) =>
      (activeCategory === ALL_CATEGORY || p.category === activeCategory) &&
      (normalizedQuery === "" || normalizeSearch(p.name).includes(normalizedQuery))
  );

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

  async function handleSubmit(values: CheckoutFormValues) {
    const orderId = await placeOrder({
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      delivery: {
        province: values.province,
        city: values.city,
        address: values.address,
        buildingUnit: values.buildingUnit,
        postalCode: values.postalCode,
        deliveryNotes: values.deliveryNotes,
        latitude: values.latitude,
        longitude: values.longitude,
      },
    });
    setCart({});

    const orderNumber = await fetchOrderNumber(orderId);
    try {
      const paymentUrl = await requestOnlinePayment(orderId);
      window.location.assign(paymentUrl);
      return;
    } catch {
      setPlacedOrder({ orderNumber });
    }
  }

  if (paymentReturn || placedOrder) {
    return (
      <OrderOutcome
        paymentReturn={paymentReturn}
        placedOrder={placedOrder}
        onNewOrder={() => {
          setPlacedOrder(null);
          window.history.replaceState(null, "", "/shop");
        }}
      />
    );
  }

  const storeAddress = [store.province, store.city, store.address].filter(Boolean).join("، ");

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.18),transparent_70%)]"
      />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="Black-Market" className="w-10 h-10 rounded-xl object-cover shrink-0" />
            <div className="min-w-0">
              <p className="font-extrabold leading-tight text-white">فروشگاه آنلاین</p>
              <p className="text-xs text-neutral-400">Black-Market</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/"
              className="flex items-center gap-2 rounded-xl border border-white/10 px-3 sm:px-4 py-2.5 text-sm font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">بازگشت</span>
            </a>
            <a
              href="#checkout"
              className="flex items-center gap-2 rounded-xl bg-violet-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-violet-500 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>سبد خرید</span>
              {itemCount > 0 && (
                <span className="min-w-[1.5rem] h-6 px-1.5 rounded-full bg-white text-violet-700 text-xs font-bold flex items-center justify-center">
                  {numberFormat.format(itemCount)}
                </span>
              )}
            </a>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-32 lg:pb-12">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold text-violet-300 mb-2">ثبت سفارش آنلاین</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">کالاهای فروشگاه</h1>
          <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
            تعداد مورد نظر را انتخاب کنید، نشانی تحویل را وارد کنید و سفارش خود را ثبت کنید.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <section className="lg:col-span-2 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                <p className="text-sm">در حال بارگذاری کالاها...</p>
              </div>
            ) : loadError ? (
              <div className="flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-sm text-rose-300">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <span>{loadError}</span>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
                <PackageOpen className="w-10 h-10 text-neutral-500" />
                <p className="text-sm">در حال حاضر کالایی برای فروش موجود نیست.</p>
              </div>
            ) : (
              <>
                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="جستجوی نام کالا..."
                      className="w-full rounded-2xl border border-white/10 bg-neutral-900/80 py-3 pr-12 pl-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400/60 transition"
                    />
                  </div>
                  <CategoryTabs
                    active={activeCategory}
                    counts={categoryCounts}
                    total={products.length}
                    onSelect={setActiveCategory}
                  />
                </div>

                {visibleProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-400 rounded-3xl border border-dashed border-white/10">
                    <PackageOpen className="w-10 h-10 text-neutral-500" />
                    <p className="text-sm">کالایی با این جستجو یا دسته‌بندی پیدا نشد.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {visibleProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        quantity={Math.min(cart[product.id] ?? 0, product.stock)}
                        onChange={(qty) => setQuantity(product, qty)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {storeAddress && (
              <div className="mt-10 flex items-start gap-3 rounded-2xl border border-white/10 bg-neutral-900/60 p-5">
                <MapPin className="w-5 h-5 text-violet-300 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white mb-1">آدرس فروشگاه</p>
                  <p className="text-sm text-neutral-400 leading-relaxed">{storeAddress}</p>
                </div>
              </div>
            )}
          </section>

          <aside id="checkout" className="scroll-mt-24 lg:sticky lg:top-24">
            <CheckoutPanel lines={lines} total={total} onSubmit={handleSubmit} />
          </aside>
        </div>
      </main>

      {itemCount > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-white/10 bg-neutral-950/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-neutral-400">{numberFormat.format(itemCount)} قلم انتخاب شده</p>
            <p className="font-extrabold text-white truncate">{formatPrice(total)}</p>
          </div>
          <a href="#checkout" className="rounded-xl bg-violet-600 text-white px-5 py-3 text-sm font-semibold shrink-0 hover:bg-violet-500 transition">
            ادامه و ثبت سفارش
          </a>
        </div>
      )}
    </div>
  );
}

type OrderOutcomeProps = {
  paymentReturn: PaymentReturn | null;
  placedOrder: PlacedOrder | null;
  onNewOrder: () => void;
};

function OrderOutcome({ paymentReturn, placedOrder, onNewOrder }: OrderOutcomeProps) {
  const paid = paymentReturn?.status === "paid";
  const failed = paymentReturn?.status === "failed";
  const orderNumber = paymentReturn ? paymentReturn.orderNumber : placedOrder?.orderNumber?.toString() ?? null;

  const title = paid ? "پرداخت با موفقیت انجام شد" : failed ? "پرداخت انجام نشد" : "سفارش شما ثبت شد";
  const message = paid
    ? "سفارش شما پرداخت شد و برای پردازش به فروشگاه ارسال شد."
    : failed
    ? "سفارش شما ثبت شده اما پرداخت تأیید نشد. لطفاً برای هماهنگی با فروشگاه تماس بگیرید."
    : "پرداخت آنلاین در حال حاضر انجام نشد. فروشگاه سفارش شما را بررسی می‌کند و با شماره تماس ثبت‌شده هماهنگ می‌شود.";

  const Icon = failed ? XCircle : CheckCircle2;
  const iconClass = failed ? "text-rose-400" : "text-emerald-400";
  const iconBg = failed ? "bg-rose-500/10" : "bg-emerald-500/10";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900/80 p-8 text-center space-y-6">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-9 h-9 ${iconClass}`} />
        </div>
        <div className="space-y-3">
          <h1 className="text-xl font-extrabold text-white">{title}</h1>
          {orderNumber && (
            <div>
              <p className="text-xs text-neutral-400 mb-1">شماره سفارش</p>
              <p className="text-2xl font-extrabold tracking-widest text-violet-300" dir="ltr">
                {numberFormat.format(Number(orderNumber))}
              </p>
            </div>
          )}
          <p className="text-sm text-neutral-400 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onNewOrder}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 text-white py-3.5 text-sm font-semibold hover:bg-violet-500 transition"
        >
          <RotateCcw className="w-4 h-4" />
          بازگشت به فروشگاه
        </button>
      </div>
    </div>
  );
}
