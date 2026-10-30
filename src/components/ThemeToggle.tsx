import { Moon, Sun } from "lucide-react";

type ThemeToggleProps = {
  isDark: boolean;
  onToggle: () => void;
};

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="theme-toggle w-10 h-10 rounded-xl flex items-center justify-center border"
      style={{
        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.6)",
        borderColor: isDark ? "rgba(148,163,184,0.2)" : "rgba(255,255,255,0.8)",
      }}
      title={isDark ? "حالت روز" : "حالت شب"}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600" />
      )}
    </button>
  );
}
