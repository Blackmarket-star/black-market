import { useState } from "react";
import type { Product, StockMovement } from "@/types";
import { formatPrice, formatDate } from "@/lib/format";
import { uid } from "@/lib/storage";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  Package,
  Warehouse,
} from "lucide-react";

type InventoryProps = {
  products: Product[];
  stockMovements: StockMovement[];
  onProductsChange: (products: Product[]) => void;
  onStockChange: (movements: StockMovement[]) => void;
};

const tp = { color: "var(--text-primary)" };
const ts = { color: "var(--text-secondary)" };
const tm = { color: "var(--text-muted)" };

const inputStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};

export default function Inventory({
  products,
  stockMovements,
  onProductsChange,
  onStockChange,
}: InventoryProps) {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [moveType, setMoveType] = useState<"in" | "out">("in");
  const [quantity, setQuantity] = useState<number>(0);
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search)
  );

  const recentMovements = stockMovements.slice(-20).reverse();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    if (moveType === "out" && quantity > product.stock) return;

    const updatedProducts = products.map((p) =>
      p.id === selectedProduct
        ? { ...p, stock: moveType === "in" ? p.stock + quantity : p.stock - quantity }
        : p
    );

    const movement: StockMovement = {
      id: uid(),
      productId: selectedProduct,
      productName: product.name,
      type: moveType,
      quantity,
      date: Date.now(),
      note: note.trim() || undefined,
    };

    onProductsChange(updatedProducts);
    onStockChange([...stockMovements, movement]);
    setSelectedProduct("");
    setQuantity(0);
    setNote("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="page-enter space-y-5">
      <div>
        <h2 className="text-xl font-bold" style={tp}>انبار</h2>
        <p className="text-sm mt-1" style={ts}>ثبت ورود و خروج کالاها به انبار</p>
      </div>

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 page-enter">
          <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            حرکت کالا با موفقیت ثبت شد و موجودی به‌روزرسانی شد.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Form */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-base font-semibold mb-5" style={tp}>ثبت حرکت کالا</h3>

          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setMoveType("in")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                moveType === "in"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-slate-500 dark:text-slate-400"
              }`}
              style={moveType !== "in" ? { background: "var(--surface)" } : undefined}
            >
              <ArrowDownToLine className="w-5 h-5" />
              ورود به انبار
            </button>
            <button
              onClick={() => setMoveType("out")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                moveType === "out"
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                  : "text-slate-500 dark:text-slate-400"
              }`}
              style={moveType !== "out" ? { background: "var(--surface)" } : undefined}
            >
              <ArrowUpFromLine className="w-5 h-5" />
              خروج از انبار
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={tm}>انتخاب کالا</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                style={inputStyle}
                required
              >
                <option value="">یک کالا انتخاب کنید</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — موجودی: {new Intl.NumberFormat("fa-IR").format(p.stock)} {p.unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={tm}>تعداد / مقدار</label>
              <input
                type="number"
                min={1}
                value={quantity || ""}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="۰"
                className="w-full rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={tm}>توضیحات (اختیاری)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="مثلاً خرید از تامین‌کننده / ضایعات / ..."
                className="w-full rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                style={inputStyle}
              />
            </div>

            {selectedProduct && moveType === "out" && quantity > 0 && (() => {
              const p = products.find((p) => p.id === selectedProduct);
              if (p && quantity > p.stock) {
                return (
                  <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-3 text-sm text-rose-600 dark:text-rose-400">
                    موجودی فعلی این کالا فقط {new Intl.NumberFormat("fa-IR").format(p.stock)} {p.unit} است.
                  </div>
                );
              }
              return null;
            })()}

            <button
              type="submit"
              disabled={
                !selectedProduct ||
                quantity <= 0 ||
                (moveType === "out" && (() => {
                  const p = products.find((p) => p.id === selectedProduct);
                  return p ? quantity > p.stock : false;
                })())
              }
              className={`w-full py-3 rounded-xl text-sm font-medium text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                moveType === "in"
                  ? "bg-gradient-to-l from-emerald-500 to-teal-600 shadow-emerald-500/20"
                  : "bg-gradient-to-l from-rose-500 to-red-600 shadow-rose-500/20"
              }`}
            >
              ثبت {moveType === "in" ? "ورود" : "خروج"} کالا
            </button>
          </form>
        </div>

        {/* Product stock overview */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold" style={tp}>موجودی کالاها</h3>
            <Warehouse className="w-5 h-5" style={tm} />
          </div>
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5" style={tm} />
            <input
              type="text"
              placeholder="جستجو..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl py-2.5 pr-10 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
              style={inputStyle}
            />
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-center py-8" style={tm}>کالایی یافت نشد</p>
            ) : (
              filtered.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl transition-colors" style={{ background: "var(--surface)" }}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={tp}>{p.name}</p>
                    <p className="text-xs" style={tm}>{formatPrice(p.salePrice)}</p>
                  </div>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ${
                      p.stock === 0
                        ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                        : p.stock <= 10
                        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {new Intl.NumberFormat("fa-IR").format(p.stock)} {p.unit}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Movement history */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-base font-semibold mb-4" style={tp}>تاریخچه حرکت‌های انبار</h3>
        {recentMovements.length === 0 ? (
          <p className="text-sm text-center py-8" style={tm}>هنوز حرکتی ثبت نشده است</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs border-b" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
                  <th className="text-right py-3 font-medium">نوع</th>
                  <th className="text-right py-3 font-medium">کالا</th>
                  <th className="text-right py-3 font-medium">تعداد</th>
                  <th className="text-right py-3 font-medium">توضیحات</th>
                  <th className="text-left py-3 font-medium">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {recentMovements.map((m) => (
                  <tr key={m.id} className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                          m.type === "in"
                            ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {m.type === "in" ? <ArrowDownToLine className="w-3.5 h-3.5" /> : <ArrowUpFromLine className="w-3.5 h-3.5" />}
                        {m.type === "in" ? "ورود" : "خروج"}
                      </span>
                    </td>
                    <td className="py-3 font-medium" style={tp}>{m.productName}</td>
                    <td className="py-3" style={ts}>{new Intl.NumberFormat("fa-IR").format(m.quantity)}</td>
                    <td className="py-3 text-xs" style={tm}>{m.note || "—"}</td>
                    <td className="py-3 text-left text-xs" style={tm}>{formatDate(m.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
