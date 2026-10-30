import { useMemo } from "react";
import type { Sale } from "@/types";
import { formatPrice, isSameDay } from "@/lib/format";
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
import { X, TrendingUp, Receipt, BarChart3, DollarSign } from "lucide-react";

type TodaySalesModalProps = {
  open: boolean;
  onClose: () => void;
  sales: Sale[];
};

const tp = { color: "var(--text-primary)" };
const ts = { color: "var(--text-secondary)" };
const tm = { color: "var(--text-muted)" };

const BUSINESS_HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8..22

export default function TodaySalesModal({ open, onClose, sales }: TodaySalesModalProps) {
  const todaySales = useMemo(
    () => sales.filter((s) => isSameDay(s.date, Date.now())),
    [sales]
  );

  const hourlyData = useMemo(() => {
    return BUSINESS_HOURS.map((hour) => {
      const hourSales = todaySales.filter((s) => {
        const d = new Date(s.date);
        return d.getHours() === hour;
      });
      const total = hourSales.reduce((sum, s) => sum + s.total, 0);
      return {
        hour: `${new Intl.NumberFormat("fa-IR").format(hour)}:۰۰`,
        total,
        count: hourSales.length,
      };
    });
  }, [todaySales]);

  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const invoiceCount = todaySales.length;
  const avgInvoice = invoiceCount > 0 ? todayTotal / invoiceCount : 0;
  const peakHour = hourlyData.reduce(
    (max, d) => (d.total > max.total ? d : max),
    hourlyData[0] ?? { hour: "—", total: 0, count: 0 }
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
          <div className="absolute -left-8 -top-8 w-40 h-40 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute right-5 top-3 w-28 h-28 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <BarChart3 className="w-6 h-6 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">گزارش فروش امروز</h3>
                <p className="text-sm text-slate-300 mt-0.5">
                  {new Intl.DateTimeFormat("fa-IR", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
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
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h4 className="text-sm font-semibold" style={tp}>نمودار ساعتی فروش</h4>
            </div>
            {peakHour.total > 0 && (
              <span className="text-xs bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-medium">
                اوج فروش: {peakHour.hour}
              </span>
            )}
          </div>

          <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {todayTotal === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-3">
                  <Receipt className="w-7 h-7" style={tm} />
                </div>
                <p className="text-sm font-medium" style={ts}>فروشی برای امروز ثبت نشده است</p>
                <p className="text-xs mt-1" style={tm}>با ثبت اولین فروش، نمودار نمایش داده می‌شود</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity={0.75} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={0}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                    tickFormatter={(v: number) =>
                      v > 0 ? new Intl.NumberFormat("fa-IR").format(Math.round(v / 1000)) + "ه" : "۰"
                    }
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(16,185,129,0.08)" }}
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
                    labelFormatter={(label) => `ساعت ${label}`}
                  />
                  <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={42}>
                    {hourlyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.total > 0 ? "url(#barGradient)" : "rgba(148,163,184,0.12)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <StatCard
              label="جمع کل فروش"
              value={formatPrice(todayTotal)}
              icon={DollarSign}
              gradient="from-emerald-400 to-teal-600"
              glow="rgba(16,185,129,0.12)"
            />
            <StatCard
              label="تعداد فاکتورها"
              value={`${new Intl.NumberFormat("fa-IR").format(invoiceCount)} فاکتور`}
              icon={Receipt}
              gradient="from-sky-400 to-blue-600"
              glow="rgba(59,130,246,0.12)"
            />
            <StatCard
              label="میانگین مبلغ فاکتور"
              value={formatPrice(avgInvoice)}
              icon={TrendingUp}
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
