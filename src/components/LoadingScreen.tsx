import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const remaining = 100 - prev;
        const step = Math.max(1, Math.round(remaining * 0.06));
        return Math.min(prev + step, 100);
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative flex flex-col items-center gap-8 px-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl"
            style={{
              background: "linear-gradient(145deg, #0a0a0a, #1c1c1c)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 40px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: "2.5rem",
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
          <h1 className="text-xl font-bold text-white tracking-wide">سامانه مدیریت فروشگاه</h1>
        </div>

        {/* Progress bar */}
        <div className="w-64 flex flex-col items-center gap-3">
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-emerald-400 via-teal-500 to-blue-500 transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-400 tabular-nums">
            {new Intl.NumberFormat("fa-IR").format(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}
