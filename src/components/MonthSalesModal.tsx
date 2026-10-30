import { useMemo } from "react";
import type { Sale } from "@/types";
import { formatPrice } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { X, TrendingUp, Receipt, BarChart3, CalendarDays } from "lucide-react";

type MonthSalesModalProps = {
  open: boolean;
  onClose: () => void;
  sales: Sale[];
};

const tp = { color: "var(--text-primary)" };
const ts = { color: "var(--text-secondary)" };
const tm = { color: "var(--text-muted)" };

const MONTH_NAMES_FA = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export default function MonthSalesModal({ open, onClose, sales }: MonthSalesModalProps) {
  const sixMonthData = useMemo(() => {
    const now = new Date();
    const data: { label: string; total: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = ref.getFullYear();
      const month = ref.getMonth();
      const monthSales = sales.filter((s) => {
        const d = new Date(s.date);
        return d.getFullYear() === year && d.getMonth() === month;
      });
      const total = monthSales.reduce((sum, s) => sum + s.total, 0);
      const faMonthIdx = getJalaliMonthIndex(ref);
      data.push({
        label: MONTH_NAMES_FA[faMonthIdx],
        total,
        count: monthSales.length,
      });
    }
    return data;
  }, [sales]);

  const currentMonthSales = useMemo(
    () => {
      const now = new Date();
      return sales.filter((s) => {
        const d = new Date(s.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
    },
    [sales]
  );

  const monthTotal = currentMonthSales.reduce((sum, s) => sum + s.total, 0);
  const invoiceCount = currentMonthSales.length;
  const avgInvoice = invoiceCount > 0 ? monthTotal / invoiceCount : 0;
  const peakMonth = sixMonthData.reduce(
    (max, d) => (d.total > max.total ? d : max),
    sixMonthData[0] ?? { label: "—", total: 0, count: 0 }
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass rounded-[1.75rem] w-full max-w-2xl shadow-2xl page-enter max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.4), var(--glass-shadow)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-[1.75rem] bg-gradient-to-l from-slate-900 via-indigo-900 to-slate-900 p-6 sm:p-7">
          <div className="absolute -left-8 -top-8 w-40 h-40 rounded-full bg-sky-500/15 blur-3xl" />
          <div className="absolute right-5 top-3 w-28 h-28 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <CalendarDays className="w-6 h-6 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">گزارش فروش این ماه</h3>
                <p className="text-sm text-slate-300 mt-0.5">
                  {new Intl.DateTimeFormat("fa-IR", {
                    month: "long",
                    year: "numeric",
                  }).format(new Date())}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chart section */}
        <div className="p-6 sm:p-7">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-500" />
              <h4 className="text-sm font-semibold" style={tp}>روند فروش ۶ ماه اخیر</h4>
            </div>
            {peakMonth.total > 0 && (
              <span className="text-xs bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 px-3 py-1 rounded-full font-medium">
                اوج فروش: {peakMonth.label}
              </span>
            )}
          </div>

          <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {monthTotal === 0 && sixMonthData.every((d) => d.total === 0) ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-3">
                  <Receipt className="w-7 h-7" style={tm} />
                </div>
                <p className="text-sm font-medium" style={ts}>هنوز فروشی ثبت نشده است</p>
                <p className="text-xs mt-1" style={tm}>با ثبت فروش، نمودار نمایش داده می‌شود</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sixMonthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="monthBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.75} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                    tickFormatter={(v: number) =>
                      v > 0 ? new Intl.NumberFormat("fa-IR").format(Math.round(v / 1000)) + "ه" : "۰"
                    }
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(59,130,246,0.08)" }}
                    contentStyle={{
                      background: "rgba(15,23,42,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "0.75rem",
                      fontSize: "0.75rem",
                      color: "#fff",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    }}
                    labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                    formatter={(value) => [formatPrice(Number(value)), "فروش"] as [string, string]}
                    labelFormatter={(label) => `ماه ${label}`}
                  />
                  <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={56}>
                    {sixMonthData.map((entry, index) => {
                      const isCurrent = index === sixMonthData.length - 1;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={isCurrent ? "url(#monthBarGradient)" : "rgba(59,130,246,0.35)"}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Stats grid for current month */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <StatCard
              label="جمع کل فروش این ماه"
              value={formatPrice(monthTotal)}
              icon={TrendingUp}
              gradient="from-sky-400 to-blue-600"
              glow="rgba(59,130,246,0.12)"
            />
            <StatCard
              label="تعداد کل فاکتورها"
              value={`${new Intl.NumberFormat("fa-IR").format(invoiceCount)} فاکتور`}
              icon={Receipt}
              gradient="from-emerald-400 to-teal-600"
              glow="rgba(16,185,129,0.12)"
            />
            <StatCard
              label="میانگین مبلغ فاکتور"
              value={formatPrice(avgInvoice)}
              icon={BarChart3}
              gradient="from-amber-400 to-orange-600"
              glow="rgba(249,115,22,0.12)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  glow,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  gradient: string;
  glow: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: `0 6px 20px ${glow}` }}
    >
      <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full blur-3xl opacity-20" style={{ background: glow }} />
      <div className="relative">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-3`}>
          <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
        </div>
        <p className="text-xs mb-1.5" style={tm}>{label}</p>
        <p className="text-base font-bold" style={tp}>{value}</p>
      </div>
    </div>
  );
}

function getJalaliMonthIndex(gregorianDate: Date): number {
  let gy = gregorianDate.getFullYear();
  const gm = gregorianDate.getMonth() + 1;
  const gd = gregorianDate.getDate();
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm =
    days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  return jm - 1;
}
