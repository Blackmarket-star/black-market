import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Loader2, MapPin, Store } from "lucide-react";
import type { StoreSettings } from "@/types";
import { EMPTY_STORE_SETTINGS, fetchStoreSettings, saveStoreSettings } from "@/lib/storeSettings";

const tp = { color: "var(--text-primary)" };
const ts = { color: "var(--text-secondary)" };
const tm = { color: "var(--text-muted)" };
const inputStyle = { background: "var(--glass-bg)", borderColor: "var(--border)", color: "var(--text-primary)" };
const inputClass = "w-full border-2 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 transition-all";

export default function StoreAddressCard() {
  const [saved, setSaved] = useState<StoreSettings>(EMPTY_STORE_SETTINGS);
  const [draft, setDraft] = useState<StoreSettings>(EMPTY_STORE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setLoadError(null);
    try {
      const settings = await fetchStoreSettings();
      setSaved(settings);
      setDraft(settings);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "خطا در بارگذاری آدرس فروشگاه");
    } finally {
      setLoading(false);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setSaveError("مرورگر شما امکان تعیین موقعیت را ندارد.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDraft((d) => ({ ...d, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setLocating(false);
      },
      () => {
        setSaveError("دسترسی به موقعیت مکانی داده نشد.");
        setLocating(false);
      }
    );
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaveOk(false);
    try {
      await saveStoreSettings(draft);
      setSaved(draft);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "ذخیره آدرس انجام نشد");
    } finally {
      setSaving(false);
    }
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const canSave = dirty && draft.province.trim() !== "" && draft.city.trim() !== "" && draft.address.trim() !== "" && !saving;

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-700 flex items-center justify-center shadow-md shrink-0">
          <Store className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold mb-1" style={tp}>آدرس فروشگاه</h3>
          <p className="text-sm" style={ts}>
            این آدرس در صفحه فروشگاه آنلاین برای مشتریان نمایش داده می‌شود و جدا از آدرس مشتریان است.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-6" style={ts}>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">در حال بارگذاری...</span>
        </div>
      ) : loadError ? (
        <div className="flex items-start gap-2 rounded-2xl p-4 text-sm font-medium" style={{ background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#e11d48" }}>
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{loadError}</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={tm}>استان</label>
              <input className={inputClass} style={inputStyle} value={draft.province} maxLength={60}
                onChange={(e) => setDraft({ ...draft, province: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={tm}>شهر</label>
              <input className={inputClass} style={inputStyle} value={draft.city} maxLength={60}
                onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={tm}>نشانی کامل</label>
            <textarea className={`${inputClass} min-h-[5rem]`} style={inputStyle} value={draft.address} maxLength={300}
              onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4" style={{ background: "var(--surface)" }}>
            <div className="flex items-center gap-2 text-sm" style={ts}>
              <MapPin className="w-4 h-4" />
              {draft.latitude !== null && draft.longitude !== null
                ? <span dir="ltr">{draft.latitude.toFixed(5)}, {draft.longitude.toFixed(5)}</span>
                : <span>موقعیت روی نقشه ثبت نشده است</span>}
            </div>
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition disabled:opacity-60"
              style={{ background: "var(--glass-bg)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              استفاده از موقعیت فعلی
            </button>
          </div>

          {saveError && (
            <div className="flex items-start gap-2 rounded-2xl p-4 text-sm font-medium" style={{ background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#e11d48" }}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}
          {saveOk && (
            <div className="flex items-center gap-2 rounded-2xl p-4 text-sm font-medium text-emerald-600">
              <CheckCircle className="w-4 h-4" />
              <span>آدرس فروشگاه ذخیره شد.</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 transition disabled:opacity-40"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            ذخیره آدرس
          </button>
        </div>
      )}
    </div>
  );
}
