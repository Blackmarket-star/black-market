import { useRef, useState } from "react";
import { AlertCircle, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { removeProductImage, replaceProductImage } from "@/lib/storage";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

type ProductImageFieldProps = {
  productId: string;
  imageUrl: string | null;
  onReload: () => Promise<void>;
};

export default function ProductImageField({ productId, imageUrl, onReload }: ProductImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("فقط فایل‌های JPG، PNG یا WEBP مجاز است.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await replaceProductImage(productId, imageUrl, file);
      await onReload();
    } catch {
      setError("ذخیره تصویر انجام نشد. دوباره تلاش کنید.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setBusy(true);
    setError(null);
    try {
      await removeProductImage(productId, imageUrl);
      await onReload();
    } catch {
      setError("حذف تصویر انجام نشد. دوباره تلاش کنید.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">تصویر کالا</label>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-700 shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/25 transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
              {imageUrl ? "جایگزینی تصویر" : "افزودن تصویر"}
            </button>
            {imageUrl && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleRemove()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/25 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                حذف تصویر
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400">JPG، PNG یا WEBP تا ۵ مگابایت. تصویر بلافاصله ذخیره می‌شود.</p>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
