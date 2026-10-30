import { useState } from "react";
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
import type { Product, Sale } from "@/types";
import { formatPrice, formatRial, isSameDay, isSameMonth, dayLabel } from "@/lib/format";
import TodaySalesModal from "@/components/TodaySalesModal";
import MonthSalesModal from "@/components/MonthSalesModal";
import ShamsiCalendarWidget from "@/components/ShamsiCalendarWidget";
import {
  TrendingUp,
  CalendarDays,
  AlertTriangle,
  Package,
  ArrowLeft,
  ShoppingBag,
  Receipt,
  DollarSign,
  Boxes,
  Sparkles,
} from "lucide-react";

type DashboardProps = {
  products: Product[];
  sales: Sale[];
  onNavigate: (key: "products" | "sales" | "inventory") => void;
};

const tp = { color: "var(--text-primary)" };
const ts = { color: "var(--text-secondary)" };
const tm = { color: "var(--text-muted)" };

export default function Dashboard({ products, sales, onNavigate }: DashboardProps) {
  const now = Date.now();
  const [showTodayModal, setShowTodayModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);

  const todaySales = sales.filter((s) => isSameDay(s.date, now));
  const monthSales = sales.filter((s) => isSameMonth(s.date, now));
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const monthTotal = monthSales.reduce((sum, s) => sum + s.total, 0);

  const lowStockThreshold = 10;
  const lowStockProducts = products.filter((p) => p.stock <= lowStockThreshold);

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
    const dayEnd = dayStart + 86400000;
    const daySalesList = sales.filter((s) => s.date >= dayStart && s.date < dayEnd);
    const total = daySalesList.reduce((sum, s) => sum + s.total, 0);
    const count = daySalesList.length;
    return { label: dayLabel(6 - i), total, count, dayStart };
  });

  const totalWeekSales = weekData.reduce((sum, d) => sum + d.total, 0);
  const totalWeekCount = weekData.reduce((sum, d) => sum + d.count, 0);

  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const s of sales.filter((s) => s.date >= now - 7 * 86400000)) {
    for (const item of s.items) {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.name, qty: 0, revenue: 0 };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].revenue += item.total;
    }
  }
  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const weekChartData = weekData.map((d, i) => ({
    label: d.label,
    total: Number(d.total) || 0,
    count: d.count,
    isToday: i === 6,
  }));

  const rialFormatter = (value: number) => formatRial(value);
  const rialAxisFormatter = (value: number) => {
    if (value >= 1000000) {
      return new Intl.NumberFormat("fa-IR").format(Math.round(value / 1000000)) + "م ریال";
    }
    if (value >= 1000) {
      return new Intl.NumberFormat("fa-IR").format(Math.round(value / 1000)) + "ه ریال";
    }
    return new Intl.NumberFormat("fa-IR").format(value) + " ریال";
  };

  const stats = [
    {
      label: "فروش امروز",
      value: formatPrice(todayTotal),
      sub: `${todaySales.length} فاکتور`,
      icon: DollarSign,
      gradient: "from-emerald-400 via-teal-500 to-teal-600",
      shadow: "shadow-emerald-500/30",
      glow: "rgba(16, 185, 129, 0.12)",
      onClick: () => setShowTodayModal(true),
    },
    {
      label: "فروش این ماه",
      value: formatPrice(monthTotal),
      sub: `${monthSales.length} فاکتور`,
      icon: CalendarDays,
      gradient: "from-sky-400 via-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/30",
      glow: "rgba(59, 130, 246, 0.12)",
      onClick: () => setShowMonthModal(true),
    },
    {
      label: "تعداد کالاها",
      value: new Intl.NumberFormat("fa-IR").format(products.length),
      sub: `${products.filter((p) => p.stock > 0).length} کالای موجود`,
      icon: Boxes,
      gradient: "from-amber-400 via-orange-500 to-orange-600",
      shadow: "shadow-orange-500/30",
      glow: "rgba(249, 115, 22, 0.12)",
    },
    {
      label: "کالاهای رو به اتمام",
      value: new Intl.NumberFormat("fa-IR").format(lowStockProducts.length),
      sub: lowStockProducts.length > 0 ? "نیاز به خرید" : "همه چیز مرتب است",
      icon: AlertTriangle,
      gradient: "from-rose-400 via-red-500 to-red-600",
      shadow: "shadow-red-500/30",
      glow: "rgba(244, 63, 94, 0.12)",
      onClick: () => onNavigate("products"),
    },
  ];

  return (
    <div className="page-enter space-y-6">
      {/* Welcome banner + Shamsi calendar */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-l from-slate-900 via-indigo-900 to-slate-900 p-7 sm:p-10 shadow-2xl shadow-indigo-500/15 flex-1">
          <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute -left-20 bottom-0 w-56 h-56 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute right-10 top-5 w-32 h-32 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <p className="text-emerald-400 text-sm font-medium">خوش آمدید</p>
              </div>
              <h2 className="text-white text-2xl sm:text-3xl font-bold">نمای کلی فروشگاه</h2>
              <p className="text-slate-400 text-sm mt-2">
                {new Intl.DateTimeFormat("fa-IR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }).format(new Date())}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onNavigate("sales")}
                className="flex items-center gap-2 bg-gradient-to-l from-emerald-500 to-teal-600 text-white px-6 py-3.5 rounded-2xl text-sm font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.03] transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                ثبت فروش جدید
              </button>
              <button
                onClick={() => onNavigate("products")}
                className="flex items-center gap-2 bg-white/10 text-white px-6 py-3.5 rounded-2xl text-sm font-medium hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10"
              >
                <Package className="w-5 h-5" />
                مدیریت کالاها
              </button>
            </div>
          </div>
        </div>
        <ShamsiCalendarWidget />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const clickable = stat.onClick !== undefined;
          return (
            <button
              key={i}
              onClick={stat.onClick}
              disabled={!clickable}
              className={`glass rounded-[1.75rem] p-7 relative overflow-hidden text-right transition-all duration-200 ${
                clickable
                  ? "cursor-pointer hover:scale-[1.02] hover:shadow-2xl"
                  : "cursor-default"
              }`}
              style={{ boxShadow: `0 10px 40px ${stat.glow}, var(--glass-shadow)` }}
            >
              <div
                className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-3xl opacity-30"
                style={{ background: stat.glow }}
              />
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-xl ${stat.shadow} mb-5`}
                >
                  <stat.icon className="w-8 h-8 text-white" strokeWidth={2.2} />
                </div>
                <p className="text-sm mb-2" style={ts}>{stat.label}</p>
                <p className="text-2xl font-bold mb-1.5" style={tp}>{stat.value}</p>
                <p className="text-xs" style={tm}>{stat.sub}</p>
                {clickable && (
                  <p className="text-xs mt-2 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    {stat.label === "کالاهای رو به اتمام" ? "مشاهده کالاها" : "مشاهده جزئیات"}
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Weekly chart */}
        <div className="lg:col-span-2 glass rounded-[1.75rem] p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold" style={tp}>نمودار فروش هفته اخیر</h3>
              <p className="text-xs mt-1" style={tm}>
                مجموع: {formatPrice(totalWeekSales)} در {new Intl.NumberFormat("fa-IR").format(totalWeekCount)} فاکتور
              </p>
            </div>
          </div>
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--text-muted)", fontSize: 12, fontFamily: "Vazirmatn" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis
                  domain={[0, "auto"]}
                  tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "Vazirmatn" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => rialAxisFormatter(Number(value))}
                  width={90}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148,163,184,0.12)" }}
                  contentStyle={{
                    background: "rgba(15,23,42,0.92)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontFamily: "Vazirmatn",
                    fontSize: "13px",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                  formatter={(value) => [rialFormatter(Number(value)), "فروش"]}
                  labelFormatter={(label) => `روز: ${String(label)}`}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={56}>
                  {weekChartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isToday ? "#10b981" : "url(#weekBarGradient)"}
                    />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="weekBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0.55} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low stock list */}
        <div className="glass rounded-[1.75rem] p-7">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold" style={tp}>کالاهای رو به اتمام</h3>
            <span className="text-xs bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full font-medium">
              {new Intl.NumberFormat("fa-IR").format(lowStockProducts.length)} مورد
            </span>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
                <Package className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-sm font-medium" style={ts}>همه کالاها موجود هستند</p>
              <p className="text-xs mt-1" style={tm}>موجودی همه کالاها بالای حد هشدار است</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl transition-colors cursor-pointer"
                  style={{ background: "var(--surface)" }}
                  onClick={() => onNavigate("products")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-10 rounded-full ${
                        p.stock === 0 ? "bg-red-500" : p.stock <= 5 ? "bg-amber-500" : "bg-slate-400"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium" style={tp}>{p.name}</p>
                      <p className="text-xs mt-0.5" style={tm}>
                        موجودی: {new Intl.NumberFormat("fa-IR").format(p.stock)} {p.unit}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      p.stock === 0
                        ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 pulse-soft"
                        : p.stock <= 5
                        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-slate-100 dark:bg-slate-500/20 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {p.stock === 0 ? "ناموجود" : p.stock <= 5 ? "بحرانی" : "کم"}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => onNavigate("inventory")}
            className="w-full mt-4 flex items-center justify-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors py-2"
          >
            ثبت ورود کالا
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Top selling products */}
        <div className="lg:col-span-1 glass rounded-[1.75rem] p-7">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-semibold" style={tp}>پرفروش‌ترین کالاها</h3>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-center py-8" style={tm}>داده‌ای موجود نیست</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 0
                        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : i === 1
                        ? "bg-slate-100 dark:bg-slate-500/20 text-slate-500 dark:text-slate-400"
                        : i === 2
                        ? "bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400"
                        : "bg-slate-50 dark:bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    {new Intl.NumberFormat("fa-IR").format(i + 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={tp}>{p.name}</p>
                    <p className="text-xs" style={tm}>
                      {new Intl.NumberFormat("fa-IR").format(p.qty)} عدد فروخته شده
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    {new Intl.NumberFormat("fa-IR").format(Math.round(p.revenue / 1000))}ه ت
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent sales */}
        <div className="lg:col-span-2 glass rounded-[1.75rem] p-7">
          <div className="flex items-center gap-2 mb-5">
            <Receipt className="w-5 h-5" style={ts} />
            <h3 className="text-base font-semibold" style={tp}>آخرین فروش‌ها</h3>
          </div>
          {sales.length === 0 ? (
            <div className="text-center py-8 text-sm" style={tm}>
              هنوز فروشی ثبت نشده است
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs border-b" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
                    <th className="text-right py-3 font-medium">تاریخ</th>
                    <th className="text-right py-3 font-medium">اقلام</th>
                    <th className="text-right py-3 font-medium">تعداد</th>
                    <th className="text-left py-3 font-medium">مبلغ کل</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.slice(-8).reverse().map((s) => (
                    <tr key={s.id} className="border-b last:border-0 transition-colors hover:bg-white/30 dark:hover:bg-white/5" style={{ borderColor: "var(--border)" }}>
                      <td className="py-3 text-xs" style={ts}>
                        {new Intl.DateTimeFormat("fa-IR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(s.date))}
                      </td>
                      <td className="py-3 text-xs max-w-xs truncate" style={ts}>
                        {s.items.map((i) => i.name).join("، ")}
                      </td>
                      <td className="py-3" style={tm}>
                        {new Intl.NumberFormat("fa-IR").format(s.items.length)} قلم
                      </td>
                      <td className="py-3 text-left font-bold" style={tp}>
                        {formatPrice(s.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <TodaySalesModal open={showTodayModal} onClose={() => setShowTodayModal(false)} sales={sales} />
      <MonthSalesModal open={showMonthModal} onClose={() => setShowMonthModal(false)} sales={sales} />
    </div>
  );
}
