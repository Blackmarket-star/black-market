import { useState } from "react";
import { Lock, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";

type LoginScreenProps = {
  onSuccess: () => void;
};

const CORRECT_PASSWORD = "100";

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (password === CORRECT_PASSWORD) {
        onSuccess();
      } else {
        setError("رمز عبور اشتباه است");
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
      <div className="absolute -top-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-blue-500/15 blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-[28rem] h-[28rem] rounded-full bg-emerald-500/12 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Login card */}
      <div
        className="relative w-full max-w-md rounded-[2rem] p-8 sm:p-10 page-enter"
        style={{
          background: "rgba(15,23,42,0.6)",
          backdropFilter: "blur(30px) saturate(1.5)",
          WebkitBackdropFilter: "blur(30px) saturate(1.5)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl mb-4"
            style={{
              background: "linear-gradient(145deg, #0a0a0a, #1c1c1c)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: "2rem",
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
          <h1 className="text-xl font-bold text-white">ورود به سامانه</h1>
          <p className="text-sm text-slate-400 mt-1.5">رمز عبور را وارد کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">رمز عبور</label>
            <div className="relative">
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                autoFocus
                className="w-full pr-12 pl-12 py-3.5 rounded-2xl text-white text-base font-medium tracking-wider bg-white/5 border border-white/10 focus:border-blue-400/50 focus:bg-white/8 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="•••"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium page-enter"
              style={{
                background: "rgba(244,63,94,0.12)",
                border: "1px solid rgba(244,63,94,0.25)",
                color: "#fda4af",
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-l from-emerald-500 to-teal-600 text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                در حال ورود...
              </span>
            ) : (
              <>
                ورود
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
