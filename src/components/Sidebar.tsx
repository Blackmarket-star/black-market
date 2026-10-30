import { NAV_ITEMS, FOOTER_NAV_ITEMS, type PageKey } from "@/lib/nav";
import { X, LogOut } from "lucide-react";

type SidebarProps = {
  current: PageKey;
  onNavigate: (key: PageKey) => void;
  onLogout: () => void;
  open: boolean;
  onClose: () => void;
  storeName: string;
  isDark: boolean;
};

export default function Sidebar({ current, onNavigate, onLogout, open, onClose, storeName, isDark }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 right-0 z-40 h-screen w-72 text-slate-200 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
        style={{
          background: isDark
            ? "linear-gradient(to bottom, #0c1322, #111827, #0a0f1c)"
            : "linear-gradient(to bottom, #1e293b, #1e293b, #0f172a)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-black/40"
              style={{
                background: "linear-gradient(145deg, #0a0a0a, #1c1c1c)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.625rem",
                  lineHeight: 1,
                  letterSpacing: "-0.05em",
                  background: "linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                B
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{storeName}</h1>
              <p className="text-xs text-slate-400">سامانه مدیریت و حسابداری</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = current === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-l from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 transition-transform ${active ? "scale-110" : ""}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer nav (settings) */}
        <div className="px-4 pb-4 space-y-1.5">
          {FOOTER_NAV_ITEMS.map((item) => {
            const active = current === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-l from-slate-600 to-slate-700 text-white shadow-lg"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logout + Footer */}
        <div className="px-4 pb-4 space-y-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>خروج</span>
          </button>
          <p className="text-xs text-slate-500 text-center pt-2">
            نسخه ۱.۰ — ذخیره‌سازی ابری
          </p>
        </div>
      </aside>
    </>
  );
}
