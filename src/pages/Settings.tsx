import { useState } from "react";
import { Settings as SettingsIcon, Trash2, Database, Info, CheckCircle, Store, Edit3 } from "lucide-react";

type SettingsProps = {
  onReset: () => void;
  storeName: string;
  onStoreNameChange: (name: string) => void;
};

const tp = { color: "var(--text-primary)" };
const ts = { color: "var(--text-secondary)" };
const tm = { color: "var(--text-muted)" };

export default function Settings({ onReset, storeName, onStoreNameChange }: SettingsProps) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(storeName);
  const [nameSaved, setNameSaved] = useState(false);

  function handleReset() {
    onReset();
    setConfirming(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  }

  function handleSaveName() {
    if (nameInput.trim()) {
      onStoreNameChange(nameInput.trim());
      setEditingName(false);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 3000);
    }
  }

  return (
    <div className="page-enter space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={tp}>تنظیمات</h2>
        <p className="text-sm mt-1" style={ts}>مدیریت داده‌ها و اطلاعات برنامه</p>
      </div>

      {done && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 page-enter">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            داده‌ها با موفقیت پاک شد و داده‌های نمونه مجدداً بارگذاری شد.
          </p>
        </div>
      )}

      {nameSaved && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 page-enter">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            نام فروشگاه با موفقیت تغییر کرد.
          </p>
        </div>
      )}

      {/* Store name card */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md shrink-0">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold mb-1" style={tp}>نام فروشگاه</h3>
            <p className="text-sm" style={ts}>
              این نام در بالای تمام صفحات و منوی کناری نمایش داده می‌شود.
            </p>
          </div>
        </div>

        {!editingName ? (
          <div className="flex items-center justify-between rounded-2xl p-4" style={{ background: "var(--surface)" }}>
            <span className="text-lg font-bold" style={tp}>{storeName}</span>
            <button
              onClick={() => { setNameInput(storeName); setEditingName(true); }}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border"
              style={{ background: "var(--glass-bg)", borderColor: "var(--border)" }}
            >
              <Edit3 className="w-4 h-4" />
              ویرایش
            </button>
          </div>
        ) : (
          <div className="rounded-2xl p-5 page-enter" style={{ background: "var(--surface)" }}>
            <label className="block text-xs font-medium mb-2" style={tm}>نام جدید فروشگاه</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full border-2 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all mb-4"
              style={{ background: "var(--glass-bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveName}
                disabled={!nameInput.trim()}
                className="flex-1 bg-gradient-to-l from-emerald-500 to-teal-600 text-white py-3 rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-40"
              >
                ذخیره
              </button>
              <button
                onClick={() => setEditingName(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors border"
                style={{ background: "var(--glass-bg)", color: "var(--text-secondary)", borderColor: "var(--border)" }}
              >
                انصراف
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md shrink-0">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold mb-1" style={tp}>درباره برنامه</h3>
            <p className="text-sm leading-relaxed" style={ts}>
              این سامانه برای حسابداری و مدیریت سوپرمارکت طراحی شده است. تمام اطلاعات شما در پایگاه‌داده ابری ذخیره می‌شود و بین دستگاه‌های شما هماهنگ است. می‌توانید کالاها را مدیریت کنید، فروش ثبت نمایید و حرکت‌های انبار را پیگیری کنید.
            </p>
          </div>
        </div>
      </div>

      {/* Data management */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-md shrink-0">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold mb-1" style={tp}>مدیریت داده‌ها</h3>
            <p className="text-sm" style={ts}>
              با پاک کردن داده‌ها، تمام کالاها، فروش‌ها و حرکت‌های انبار حذف شده و داده‌های نمونه از نو ساخته می‌شود.
            </p>
          </div>
        </div>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-5 py-3 rounded-xl text-sm font-medium hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            پاک کردن همه داده‌ها
          </button>
        ) : (
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-5 page-enter">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0">
                <SettingsIcon className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">
                آیا مطمئن هستید؟ این عمل قابل بازگشت نیست.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 bg-rose-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors"
              >
                بله، پاک کن
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors border"
                style={{ background: "var(--glass-bg)", color: "var(--text-secondary)", borderColor: "var(--border)" }}
              >
                انصراف
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
