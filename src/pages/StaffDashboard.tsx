import { useState, useEffect } from "react";
import type { Product, StaffSalary, StaffLeave, StaffConsumption } from "@/types";
import {
  fetchStaffSalaries,
  insertStaffSalary,
  deleteStaffSalary,
  fetchStaffLeaves,
  insertStaffLeave,
  deleteStaffLeave,
  fetchStaffConsumptions,
  insertStaffConsumption,
  deleteStaffConsumption,
  uid,
} from "@/lib/storage";
import { formatPrice, formatDate } from "@/lib/format";
import {
  jalaliStringToTimestamp,
  timestampToJalaliLong,
  todayJalaliString,
} from "@/lib/jalali";
import JalaliDatePicker from "@/components/JalaliDatePicker";
import {
  ArrowRight,
  Wallet,
  CalendarX,
  ShoppingCart,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

type StaffDashboardProps = {
  products: Product[];
  onBack: () => void;
};

const tp = { color: "var(--text-primary)" };
const ts = { color: "var(--text-secondary)" };
const tm = { color: "var(--text-muted)" };

type Tab = "salaries" | "leaves" | "consumptions";

export default function StaffDashboard({ products, onBack }: StaffDashboardProps) {
  const [tab, setTab] = useState<Tab>("salaries");
  const [salaries, setSalaries] = useState<StaffSalary[]>([]);
  const [leaves, setLeaves] = useState<StaffLeave[]>([]);
  const [consumptions, setConsumptions] = useState<StaffConsumption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffData();
  }, []);

  async function loadStaffData() {
    setLoading(true);
    setError(null);
    try {
      const [s, l, c] = await Promise.all([
        fetchStaffSalaries(),
        fetchStaffLeaves(),
        fetchStaffConsumptions(),
      ]);
      setSalaries(s);
      setLeaves(l);
      setConsumptions(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در بارگذاری داده‌ها");
    } finally {
      setLoading(false);
    }
  }

  async function reloadSalaries() {
    try {
      const s = await fetchStaffSalaries();
      setSalaries(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در بارگذاری حقوق‌ها");
    }
  }

  async function reloadLeaves() {
    try {
      const l = await fetchStaffLeaves();
      setLeaves(l);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در بارگذاری مرخصی‌ها");
    }
  }

  async function reloadConsumptions() {
    try {
      const c = await fetchStaffConsumptions();
      setConsumptions(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در بارگذاری برداشت‌ها");
    }
  }

  const tabs: { key: Tab; label: string; icon: typeof Wallet }[] = [
    { key: "salaries", label: "حقوق و دستمزد", icon: Wallet },
    { key: "leaves", label: "مرخصی‌ها", icon: CalendarX },
    { key: "consumptions", label: "برداشت‌های کارکنان", icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen" style={{ color: "var(--text-primary)" }}>
      {/* Staff header */}
      <header
        className="sticky top-0 z-20 backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center justify-between border-b"
        style={{
          background: "var(--header-bg)",
          borderColor: "var(--header-border)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
            style={{
              color: "var(--text-secondary)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
            title="بازگشت"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">بازگشت به انتخاب</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Users className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold leading-tight" style={tp}>
              داشبورد کارکنان
            </h2>
            <p className="text-xs" style={tm}>مدیریت حقوق، مرخصی و برداشت</p>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        {error && (
          <div
            className="mb-6 rounded-2xl p-4 text-sm font-medium"
            style={{
              background: "rgba(244, 63, 94, 0.1)",
              border: "1px solid rgba(244, 63, 94, 0.2)",
              color: "#e11d48",
            }}
          >
            {error}
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  active
                    ? "bg-gradient-to-l from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "glass"
                }`}
                style={!active ? { color: "var(--text-secondary)" } : undefined}
              >
                <t.icon className="w-4 h-4 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm mt-3" style={tm}>در حال بارگذاری...</p>
          </div>
        ) : (
          <div className="page-enter">
            {tab === "salaries" && (
              <SalariesTab
                salaries={salaries}
                setSalaries={setSalaries}
                setError={setError}
                reloadSalaries={reloadSalaries}
              />
            )}
            {tab === "leaves" && (
              <LeavesTab leaves={leaves} setLeaves={setLeaves} setError={setError} reloadLeaves={reloadLeaves} />
            )}
            {tab === "consumptions" && (
              <ConsumptionsTab
                consumptions={consumptions}
                setConsumptions={setConsumptions}
                products={products}
                setError={setError}
                reloadConsumptions={reloadConsumptions}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Salaries Tab ---------- */

function SalariesTab({
  salaries,
  setSalaries,
  setError,
  reloadSalaries,
}: {
  salaries: StaffSalary[];
  setSalaries: React.Dispatch<React.SetStateAction<StaffSalary[]>>;
  setError: (e: string | null) => void;
  reloadSalaries: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [deductions, setDeductions] = useState("");
  const [month, setMonth] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !baseSalary) return;

    const base = Number(baseSalary) || 0;
    const ded = Number(deductions) || 0;
    const net = Math.max(base - ded, 0);

    const salary: StaffSalary = {
      id: uid(),
      employeeName: name.trim(),
      baseSalary: base,
      deductions: ded,
      netPay: net,
      month: month.trim(),
      createdAt: Date.now(),
    };

    setSubmitting(true);
    setError(null);
    try {
      await insertStaffSalary(salary);
      await reloadSalaries();
      setName("");
      setBaseSalary("");
      setDeductions("");
      setMonth("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "خطا در ثبت حقوق";
      setError(`ثبت حقوق ناموفق بود: ${msg}`);
      setSalaries((prev) => prev.filter((s) => s.id !== salary.id));
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(id: string) {
    setSalaries((prev) => prev.filter((s) => s.id !== id));
    deleteStaffSalary(id).catch((err) =>
      setError(err instanceof Error ? err.message : "خطا در حذف")
    );
  }

  const totalBase = salaries.reduce((s, r) => s + r.baseSalary, 0);
  const totalDed = salaries.reduce((s, r) => s + r.deductions, 0);
  const totalNet = salaries.reduce((s, r) => s + r.netPay, 0);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <SummaryCard label="جمع حقوق پایه" value={formatPrice(totalBase)} color="emerald" />
        <SummaryCard label="جمع کسورات" value={formatPrice(totalDed)} color="amber" />
        <SummaryCard label="جمع خالص پرداختی" value={formatPrice(totalNet)} color="blue" />
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="glass rounded-[1.5rem] p-5 sm:p-6">
        <h3 className="text-sm font-semibold mb-4" style={tp}>ثبت حقوق جدید</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام کارمند"
            className="px-4 py-3 rounded-xl text-sm bg-transparent border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
          <input
            type="number"
            value={baseSalary}
            onChange={(e) => setBaseSalary(e.target.value)}
            placeholder="حقوق پایه (تومان)"
            className="px-4 py-3 rounded-xl text-sm bg-transparent border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
          <input
            type="number"
            value={deductions}
            onChange={(e) => setDeductions(e.target.value)}
            placeholder="کسورات (تومان)"
            className="px-4 py-3 rounded-xl text-sm bg-transparent border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
          <input
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="ماه (مثلاً ۱۴۰۳/۰۷)"
            className="px-4 py-3 rounded-xl text-sm bg-transparent border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim() || !baseSalary || submitting}
          className="mt-4 flex items-center gap-2 bg-gradient-to-l from-sky-500 to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              در حال ثبت...
            </span>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              افزودن
            </>
          )}
        </button>
        {success && <SuccessBanner />}
      </form>

      {/* Table */}
      <div className="glass rounded-[1.5rem] overflow-hidden">
        {salaries.length === 0 ? (
          <EmptyState text="هنوز حقوقی ثبت نشده است" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th className="text-right py-3 px-4 font-medium text-xs" style={tm}>نام کارمند</th>
                  <th className="text-right py-3 px-4 font-medium text-xs" style={tm}>ماه</th>
                  <th className="text-right py-3 px-4 font-medium text-xs" style={tm}>حقوق پایه</th>
                  <th className="text-right py-3 px-4 font-medium text-xs" style={tm}>کسورات</th>
                  <th className="text-right py-3 px-4 font-medium text-xs" style={tm}>خالص پرداختی</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {salaries.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 transition-colors hover:bg-white/30 dark:hover:bg-white/5" style={{ borderColor: "var(--border)" }}>
                    <td className="py-3 px-4 font-medium" style={tp}>{s.employeeName}</td>
                    <td className="py-3 px-4 text-xs" style={ts}>{s.month || "—"}</td>
                    <td className="py-3 px-4" style={ts}>{formatPrice(s.baseSalary)}</td>
                    <td className="py-3 px-4 text-amber-600 dark:text-amber-400" style={ts}>
                      {s.deductions > 0 ? `−${formatPrice(s.deductions)}` : "—"}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(s.netPay)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
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

/* ---------- Leaves Tab ---------- */

function LeavesTab({
  leaves,
  setLeaves,
  setError,
  reloadLeaves,
}: {
  leaves: StaffLeave[];
  setLeaves: React.Dispatch<React.SetStateAction<StaffLeave[]>>;
  setError: (e: string | null) => void;
  reloadLeaves: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState<string>(() => todayJalaliString());
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !date) return;

    const leave: StaffLeave = {
      id: uid(),
      employeeName: name.trim(),
      leaveDate: jalaliStringToTimestamp(date),
      reason: reason.trim(),
      createdAt: Date.now(),
    };

    setSubmitting(true);
    setError(null);
    try {
      await insertStaffLeave(leave);
      await reloadLeaves();
      setName("");
      setDate(todayJalaliString());
      setReason("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "خطا در ثبت مرخصی";
      setError(`ثبت مرخصی ناموفق بود: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(id: string) {
    setLeaves((prev) => prev.filter((l) => l.id !== id));
    deleteStaffLeave(id).catch((err) =>
      setError(err instanceof Error ? err.message : "خطا در حذف")
    );
  }

  return (
    <div className="space-y-5">
      {/* Add form */}
      <form onSubmit={handleAdd} className="glass rounded-[1.5rem] p-5 sm:p-6">
        <h3 className="text-sm font-semibold mb-4" style={tp}>ثبت مرخصی جدید</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام کارمند"
            className="px-4 py-3 rounded-xl text-sm bg-transparent border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
          <JalaliDatePicker
            value={date}
            onChange={setDate}
            placeholder="انتخاب تاریخ"
            disabled={submitting}
          />
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="علت مرخصی"
            className="px-4 py-3 rounded-xl text-sm bg-transparent border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim() || !date || submitting}
          className="mt-4 flex items-center gap-2 bg-gradient-to-l from-sky-500 to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              در حال ثبت...
            </span>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              افزودن
            </>
          )}
        </button>
        {success && <SuccessBanner />}
      </form>
      <div className="glass rounded-[1.5rem] overflow-hidden">
        {leaves.length === 0 ? (
          <EmptyState text="هنوز مرخصی ثبت نشده است" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th className="text-right py-3 px-4 font-medium text-xs" style={tm}>نام کارمند</th>
                  <th className="text-right py-3 px-4 font-medium text-xs" style={tm}>تاریخ</th>
                  <th className="text-right py-3 px-4 font-medium text-xs" style={tm}>علت</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id} className="border-b last:border-0 transition-colors hover:bg-white/30 dark:hover:bg-white/5" style={{ borderColor: "var(--border)" }}>
                    <td className="py-3 px-4 font-medium" style={tp}>{l.employeeName}</td>
                    <td className="py-3 px-4 text-xs" style={ts}>
                      {timestampToJalaliLong(l.leaveDate)}
                    </td>
                    <td className="py-3 px-4" style={ts}>{l.reason || "—"}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
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

/* ---------- Consumptions Tab ---------- */

function ConsumptionsTab({
  consumptions,
  setConsumptions,
  products,
  setError,
  reloadConsumptions,
}: {
  consumptions: StaffConsumption[];
  setConsumptions: React.Dispatch<React.SetStateAction<StaffConsumption[]>>;
  products: Product[];
  setError: (e: string | null) => void;
  reloadConsumptions: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !productId || !quantity) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const consumption: StaffConsumption = {
      id: uid(),
      employeeName: name.trim(),
      productId,
      productName: product.name,
      quantity: Number(quantity) || 1,
      date: date ? new Date(date).getTime() : Date.now(),
      createdAt: Date.now(),
    };

    setSubmitting(true);
    setError(null);
    try {
      await insertStaffConsumption(consumption);
      await reloadConsumptions();
      setName("");
      setProductId("");
      setQuantity("");
      setDate("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "خطا در ثبت برداشت";
      setError(`ثبت برداشت ناموفق بود: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(id: string) {
    setConsumptions((prev) => prev.filter((c) => c.id !== id));
    deleteStaffConsumption(id).catch((err) =>
      setError(err instanceof Error ? err.message : "خطا در حذف")
    );
  }

  return (
    <div className="space-y-5">
      {/* Add form */}
      <form onSubmit={handleAdd} className="glass rounded-[1.5rem] p-5 sm:p-6">
        <h3 className="text-sm font-semibold mb-4" style={tp}>ثبت برداشت جدید</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام کارمند"
            className="px-4 py-3 rounded-xl text-sm bg-transparent border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="px-4 py-3 rounded-xl text-sm bg-transparent border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            <option value="">انتخاب کالا</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="تعداد"
            className="px-4 py-3 rounded-xl text-sm bg-transparent border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-3 rounded-xl text-sm bg-transparent border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim() || !productId || !quantity || submitting}
          className="mt-4 flex items-center gap-2 bg-gradient-to-l from-sky-500 to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              در حال ثبت...
            </span>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              افزودن
            </>
          )}
        </button>
        {success && <SuccessBanner />}
      </form>

      {/* Table */}
      <div className="glass rounded-[1.5rem] overflow-hidden">
        {consumptions.length === 0 ? (
          <EmptyState text="هنوز برداشتی ثبت نشده است" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th className="text-right py-3 px-4 font-medium text-xs" style={tm}>نام کارمند</th>
                  <th className="text-right py-3 px-4 font-medium text-xs" style={tm}>کالا</th>
                  <th className="text-right py-3 px-4 font-medium text-xs" style={tm}>تعداد</th>
                  <th className="text-right py-3 px-4 font-medium text-xs" style={tm}>تاریخ</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {consumptions.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 transition-colors hover:bg-white/30 dark:hover:bg-white/5" style={{ borderColor: "var(--border)" }}>
                    <td className="py-3 px-4 font-medium" style={tp}>{c.employeeName}</td>
                    <td className="py-3 px-4" style={ts}>{c.productName}</td>
                    <td className="py-3 px-4" style={ts}>
                      {new Intl.NumberFormat("fa-IR").format(c.quantity)}
                    </td>
                    <td className="py-3 px-4 text-xs" style={ts}>
                      {new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(c.date))}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
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

/* ---------- Shared helpers ---------- */

function SuccessBanner() {
  return (
    <div
      className="mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium page-enter"
      style={{
        background: "rgba(16,185,129,0.12)",
        border: "1px solid rgba(16,185,129,0.25)",
        color: "#059669",
      }}
    >
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.854 3.853 7.146-9.397a.75.75 0 011.05-.143z" clipRule="evenodd" />
      </svg>
      <span>با موفقیت ثبت شد</span>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: "emerald" | "amber" | "blue" }) {
  const colorMap = {
    emerald: "from-emerald-400 to-teal-600 shadow-emerald-500/25",
    amber: "from-amber-400 to-orange-600 shadow-amber-500/25",
    blue: "from-sky-400 to-blue-600 shadow-blue-500/25",
  };
  return (
    <div className="glass rounded-2xl p-4 sm:p-5 relative overflow-hidden">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg mb-3`}>
        <Wallet className="w-5 h-5 text-white" strokeWidth={2.2} />
      </div>
      <p className="text-xs mb-1" style={tm}>{label}</p>
      <p className="text-sm font-bold" style={tp}>{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-3">
        <Users className="w-7 h-7" style={{ color: "var(--text-muted)" }} />
      </div>
      <p className="text-sm font-medium" style={ts}>{text}</p>
    </div>
  );
}
