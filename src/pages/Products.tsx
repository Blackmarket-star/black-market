import { useState, useEffect } from "react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { uid } from "@/lib/storage";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Package,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

type ProductsProps = {
  products: Product[];
  onChange: (products: Product[]) => void;
};

const emptyForm: Omit<Product, "id" | "createdAt"> = {
  name: "",
  barcode: "",
  purchasePrice: 0,
  salePrice: 0,
  stock: 0,
  unit: "عدد",
};

const UNITS = ["عدد", "کیلوگرم", "لیتر", "بسته", "جعبه", "گوشی"];

const tp = { color: "var(--text-primary)" };
const ts = { color: "var(--text-secondary)" };
const tm = { color: "var(--text-muted)" };

export default function Products({ products, onChange }: ProductsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Product, "id" | "createdAt">>(emptyForm);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!modalOpen) {
      setEditingId(null);
      setForm(emptyForm);
    }
  }, [modalOpen]);

  const LOW_STOCK_THRESHOLD = 10;
  const isLowStock = (p: Product) => p.stock === 0 || p.stock <= LOW_STOCK_THRESHOLD;

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search)
  );

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      barcode: p.barcode,
      purchasePrice: p.purchasePrice,
      salePrice: p.salePrice,
      stock: p.stock,
      unit: p.unit,
    });
    setEditingId(p.id);
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      onChange(
        products.map((p) =>
          p.id === editingId ? { ...p, ...form, name: form.name.trim() } : p
        )
      );
    } else {
      const newProduct: Product = {
        ...form,
        name: form.name.trim(),
        id: uid(),
        createdAt: Date.now(),
      };
      onChange([newProduct, ...products]);
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    onChange(products.filter((p) => p.id !== id));
    setConfirmDelete(null);
  }

  return (
    <div className="page-enter space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold" style={tp}>مدیریت کالاها</h2>
          <p className="text-sm mt-1" style={ts}>
            {new Intl.NumberFormat("fa-IR").format(products.length)} کالا ثبت شده
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gradient-to-l from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          افزودن کالا
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5" style={tm} />
        <input
          type="text"
          placeholder="جستجو بر اساس نام یا بارکد..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all glass"
          style={{ color: "var(--text-primary)" }}
        />
      </div>

      {/* Product list */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface)" }}>
            <Package className="w-8 h-8" style={tm} />
          </div>
          <p className="text-sm" style={ts}>
            {products.length === 0
              ? "هنوز کالایی ثبت نشده است. روی «افزودن کالا» بزنید."
              : "نتیجه‌ای یافت نشد."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs" style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>
                  <th className="text-right py-3.5 px-4 font-medium">نام کالا</th>
                  <th className="text-right py-3.5 px-4 font-medium">بارکد</th>
                  <th className="text-right py-3.5 px-4 font-medium">قیمت خرید</th>
                  <th className="text-right py-3.5 px-4 font-medium">قیمت فروش</th>
                  <th className="text-right py-3.5 px-4 font-medium">موجودی</th>
                  <th className="text-center py-3.5 px-4 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const low = isLowStock(p);
                  return (
                  <tr
                    key={p.id}
                    className={`border-t transition-colors ${low ? "bg-red-50/60 dark:bg-red-500/8" : ""} hover:bg-white/30 dark:hover:bg-white/5`}
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="py-3 px-4 font-medium" style={low ? { color: "#e11d48" } : tp}>
                      <div className="flex items-center gap-2">
                        {low && <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />}
                        {p.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs" style={tm}>
                      {p.barcode || "—"}
                    </td>
                    <td className="py-3 px-4" style={ts}>{formatPrice(p.purchasePrice)}</td>
                    <td className="py-3 px-4 font-medium" style={tp}>{formatPrice(p.salePrice)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          p.stock === 0
                            ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                            : p.stock <= 10
                            ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {new Intl.NumberFormat("fa-IR").format(p.stock)} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-lg transition-colors hover:bg-sky-50 dark:hover:bg-sky-500/15 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400"
                          title="ویرایش"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p.id)}
                          className="p-2 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-500/15 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((p) => {
              const low = isLowStock(p);
              return (
              <div
                key={p.id}
                className={`glass rounded-2xl p-4 ${low ? "ring-2 ring-red-400/50 dark:ring-red-500/40" : ""}`}
                style={low ? { background: "rgba(244,63,94,0.06)" } : undefined}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium flex items-center gap-1.5" style={low ? { color: "#e11d48" } : tp}>
                      {low && <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />}
                      {p.name}
                    </p>
                    <p className="text-xs font-mono mt-1" style={tm}>
                      {p.barcode || "بدون بارکد"}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
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
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span style={ts}>فروش: </span>
                    <span className="font-medium" style={tp}>{formatPrice(p.salePrice)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDelete(p.id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl page-enter">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingId ? "ویرایش کالا" : "افزودن کالای جدید"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="نام کالا" className="col-span-2">
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثلاً شیر پاستوریزه" className="form-input" required autoFocus />
                </Field>
                <Field label="بارکد">
                  <input type="text" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="اختیاری" className="form-input" />
                </Field>
                <Field label="واحد">
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="form-input">
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </Field>
                <Field label="قیمت خرید (تومان)">
                  <input type="number" min={0} value={form.purchasePrice || ""} onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })} placeholder="۰" className="form-input" />
                </Field>
                <Field label="قیمت فروش (تومان)">
                  <input type="number" min={0} value={form.salePrice || ""} onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })} placeholder="۰" className="form-input" />
                </Field>
                <Field label={editingId ? "موجودی (غیرقابل ویرایش)" : "موجودی اولیه"} className="col-span-2">
                  <input type="number" min={0} value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} placeholder="۰" className="form-input" disabled={!!editingId} />
                  {editingId && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      موجودی از بخش انبار تغییر می‌کند
                    </p>
                  )}
                </Field>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-l from-emerald-500 to-teal-600 text-white py-3 rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all">
                  {editingId ? "ذخیره تغییرات" : "افزودن کالا"}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center page-enter">
            <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/15 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">حذف کالا</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              آیا از حذف این کالا مطمئن هستید؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-red-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">حذف</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">انصراف</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .form-input {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #334155;
          outline: none;
          transition: all 0.2s;
        }
        .form-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
          background: white;
        }
        .form-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .dark .form-input {
          background: rgba(51, 65, 85, 0.5);
          border-color: rgba(148, 163, 184, 0.15);
          color: #e2e8f0;
        }
        .dark .form-input:focus {
          background: rgba(30, 41, 59, 0.8);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
