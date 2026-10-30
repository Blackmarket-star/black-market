import DateObject from "react-date-object";
import { persian, persian_fa, todayJalali } from "@/lib/jalali";
import { CalendarHeart } from "lucide-react";

const WD_NAMES = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

/** Small glassmorphism Shamsi date widget for the Dashboard. */
export default function ShamsiCalendarWidget() {
  const today = todayJalali();
  const day = today.day as number;
  const monthName = (today.month as { name?: string; index?: number }).name
    ?? new DateObject({ calendar: persian, locale: persian_fa }).month?.name
    ?? "";
  const year = today.year as number;
  const weekdayIndex = new Date().getDay();
  const weekday = WD_NAMES[(weekdayIndex + 1) % 7];

  return (
    <div
      className="glass rounded-[1.75rem] p-6 relative overflow-hidden min-w-[230px]"
      style={{ boxShadow: "0 10px 40px rgba(59,130,246,0.12), var(--glass-shadow)" }}
    >
      <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <CalendarHeart className="w-5 h-5 text-white" strokeWidth={2.2} />
        </div>
        <div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            تاریخ امروز
          </p>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {weekday}
          </p>
        </div>
      </div>

      <div className="relative flex items-end gap-2">
        <span
          className="text-5xl font-bold leading-none bg-gradient-to-br from-sky-500 to-blue-600 bg-clip-text text-transparent"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {new Intl.NumberFormat("fa-IR").format(day)}
        </span>
        <div className="flex flex-col pb-1">
          <span className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            {monthName}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {new Intl.NumberFormat("fa-IR").format(year)}
          </span>
        </div>
      </div>
    </div>
  );
}
