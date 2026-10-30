import { useState } from "react";
import { Store, ArrowLeft } from "lucide-react";

type WelcomeModalProps = {
  open: boolean;
  onSave: (name: string) => void;
};

export default function WelcomeModal({ open, onSave }: WelcomeModalProps) {
  const [name, setName] = useState("");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden page-enter">
        {/* Top gradient banner */}
        <div className="relative h-32 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 overflow-hidden">
          <div className="absolute -left-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute left-20 bottom-0 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
          <div className="relative h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-7">
          <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
            به سامانه مدیریت سوپرمارکت خوش آمدید
          </h2>
          <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
            برای شروع، لطفاً نام فروشگاه خود را وارد کنید. این نام در بالای تمام صفحات نمایش داده خواهد شد.
          </p>

          <div className="mb-5">
            <label className="block text-xs font-medium text-slate-500 mb-2">
              نام فروشگاه
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً سوپرمارکت آرمان"
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3.5 px-4 text-sm text-slate-700 text-center font-medium focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-l from-emerald-500 to-teal-600 text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            ذخیره و شروع
            <ArrowLeft className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
