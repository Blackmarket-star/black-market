import { Store, Users, ArrowLeft, Sparkles } from "lucide-react";

type SelectionScreenProps = {
  onSelect: (mode: "store" | "staff") => void;
  storeName: string;
};

export default function SelectionScreen({ onSelect, storeName }: SelectionScreenProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 overflow-y-auto">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
      <div className="absolute -top-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-blue-500/15 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-[28rem] h-[28rem] rounded-full bg-emerald-500/12 blur-3xl" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative w-full max-w-3xl page-enter py-8">
        {/* Welcome message */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-400 text-sm font-medium">خوش آمدید</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {storeName ? storeName : "سامانه مدیریت فروشگاه"}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">یک بخش را برای ادامه انتخاب کنید</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Store Management */}
          <button
            onClick={() => onSelect("store")}
            className="group relative overflow-hidden rounded-[2rem] p-8 sm:p-10 text-right transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
            style={{
              background: "rgba(15,23,42,0.6)",
              backdropFilter: "blur(30px) saturate(1.5)",
              WebkitBackdropFilter: "blur(30px) saturate(1.5)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 15px 50px rgba(16,185,129,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-emerald-500/15 blur-3xl group-hover:bg-emerald-500/25 transition-all duration-500" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Store className="w-8 h-8 text-white" strokeWidth={2.2} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">مدیریت فروشگاه</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                مدیریت کالاها، ثبت فروش، انبار و گزارش‌های فروشگاه
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 group-hover:gap-2.5 transition-all">
                ورود به فروشگاه
                <ArrowLeft className="w-4 h-4" />
              </span>
            </div>
          </button>

          {/* Staff Dashboard */}
          <button
            onClick={() => onSelect("staff")}
            className="group relative overflow-hidden rounded-[2rem] p-8 sm:p-10 text-right transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
            style={{
              background: "rgba(15,23,42,0.6)",
              backdropFilter: "blur(30px) saturate(1.5)",
              WebkitBackdropFilter: "blur(30px) saturate(1.5)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 15px 50px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-blue-500/15 blur-3xl group-hover:bg-blue-500/25 transition-all duration-500" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" strokeWidth={2.2} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">داشبورد کارکنان</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                مدیریت حقوق و دستمزد، مرخصی‌ها و برداشت‌های کارکنان
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 group-hover:gap-2.5 transition-all">
                ورود به کارکنان
                <ArrowLeft className="w-4 h-4" />
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
