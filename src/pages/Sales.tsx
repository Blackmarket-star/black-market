import { useState } from "react";
import type { Product, Sale, SaleItem, StockMovement } from "@/types";
import { formatPrice } from "@/lib/format";
import { uid } from "@/lib/storage";
import {
  Plus,
  Minus,
  Trash2,
  Search,
  ShoppingCart,
  CheckCircle,
  Package,
} from "lucide-react";

type SalesProps = {
  products: Product[];
  sales: Sale[];
  onAddSale: (sale: Sale) => void;
  onProductsChange: (products: Product[]) => void;
  onStockChange: (movements: StockMovement[]) => void;
  stockMovements: StockMovement[];
};

type CartItem = {
  productId: string;
  name: string;
  salePrice: number;
  quantity: number;
  unit: string;
  maxStock: number;
};

const tp = { color: "var(--text-primary)" };
const ts = { color: "var(--text-secondary)" };
const tm = { color: "var(--text-muted)" };

export default function Sales({
  products,
  sales,
  onAddSale,
  onProductsChange,
  onStockChange,
  stockMovements,
}: SalesProps) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [success, setSuccess] = useState(false);

  const available = products.filter((p) => p.stock > 0);
  const filtered = available.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search)
  );

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

  const cartTotal = cart.reduce((sum, c) => sum + c.salePrice * c.quantity, 0);

  function handleSubmit() {
    if (cart.length === 0) return;

    const saleItems: SaleItem[] = cart.map((c) => ({
      productId: c.productId,
      name: c.name,
      quantity: c.quantity,
      salePrice: c.salePrice,
      total: c.salePrice * c.quantity,
    }));

    const sale: Sale = { id: uid(), items: saleItems, total: cartTotal, date: Date.now() };

    const updatedProducts = products.map((p) => {
      const cartItem = cart.find((c) => c.productId === p.id);
      if (!cartItem) return p;
      return { ...p, stock: p.stock - cartItem.quantity };
    });

    const newMovements: StockMovement[] = cart.map((c) => ({
      id: uid(),
      productId: c.productId,
      productName: c.name,
      type: "out",
      quantity: c.quantity,
      date: Date.now(),
      note: "فروش",
    }));

    onAddSale(sale);
    onProductsChange(updatedProducts);
    onStockChange([...stockMovements, ...newMovements]);
    setCart([]);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="page-enter space-y-5">
      <div>
        <h2 className="text-xl font-bold" style={tp}>ثبت فروش</h2>
        <p className="text-sm mt-1" style={ts}>کالاها را انتخاب کرده و فاکتور را ثبت کنید</p>
      </div>

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 page-enter">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            فروش با موفقیت ثبت شد و موجودی کالاها به‌روزرسانی شد.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Product selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5" style={tm} />
            <input
              type="text"
              placeholder="جستجوی کالا..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all glass"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          {available.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface)" }}>
                <Package className="w-8 h-8" style={tm} />
              </div>
              <p className="text-sm" style={ts}>هیچ کالای موجودی برای فروش ثبت نشده است.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((p) => {
                const inCart = cart.find((c) => c.productId === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className={`text-right glass rounded-xl p-4 border transition-all card-hover ${
                      inCart ? "border-emerald-400 ring-2 ring-emerald-500/20" : ""
                    }`}
                    style={!inCart ? { borderColor: "var(--border)" } : undefined}
                  >
                    <p className="text-sm font-medium mb-1 line-clamp-1" style={tp}>{p.name}</p>
                    <p className="text-xs mb-2" style={tm}>
                      موجودی: {new Intl.NumberFormat("fa-IR").format(p.stock)} {p.unit}
                    </p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(p.salePrice)}
                    </p>
                    {inCart && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                        {new Intl.NumberFormat("fa-IR").format(inCart.quantity)} عدد در سبد
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
              <ShoppingCart className="w-5 h-5" style={ts} />
              <h3 className="text-base font-semibold" style={tp}>سبد فروش</h3>
              {cart.length > 0 && (
                <span className="text-xs bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                  {new Intl.NumberFormat("fa-IR").format(cart.length)} قلم
                </span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm" style={tm}>سبد خالی است</p>
                  <p className="text-xs mt-1" style={tm}>کالاها را از سمت راست اضافه کنید</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {cart.map((c) => (
                    <div key={c.productId} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: "var(--surface)" }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={tp}>{c.name}</p>
                        <p className="text-xs" style={tm}>{formatPrice(c.salePrice)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQty(c.productId, -1)} className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors" style={{ background: "var(--glass-bg)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          value={c.quantity}
                          onChange={(e) => setQty(c.productId, Number(e.target.value))}
                          className="w-10 text-center text-sm font-medium border rounded-lg py-1"
                          style={{ background: "var(--glass-bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                        />
                        <button onClick={() => updateQty(c.productId, 1)} disabled={c.quantity >= c.maxStock} className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed" style={{ background: "var(--glass-bg)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => removeFromCart(c.productId)} className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/15 border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-500/25 transition-colors mr-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="px-5 py-4 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={ts}>جمع کل</span>
                  <span className="text-lg font-bold" style={tp}>{formatPrice(cartTotal)}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-l from-emerald-500 to-teal-600 text-white py-3 rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
                >
                  ثبت فاکتور فروش
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent sales */}
      {sales.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-base font-semibold mb-4" style={tp}>آخرین فروش‌ها</h3>
          <div className="space-y-2">
            {sales.slice(-5).reverse().map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--surface)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={ts}>
                    {s.items.map((i) => `${i.name} (${i.quantity})`).join("، ")}
                  </p>
                  <p className="text-xs mt-0.5" style={tm}>
                    {new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(s.date))}
                  </p>
                </div>
                <span className="text-sm font-bold mr-3" style={tp}>{formatPrice(s.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
