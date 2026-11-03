import { PRODUCT_CATEGORIES } from "@/lib/productCategories";

export const ALL_CATEGORY = "all";

type CategoryTabsProps = {
  active: string;
  counts: Record<string, number>;
  total: number;
  onSelect: (key: string) => void;
};

export default function CategoryTabs({ active, counts, total, onSelect }: CategoryTabsProps) {
  const tabs = [{ key: ALL_CATEGORY, label: "همه", count: total }, ...PRODUCT_CATEGORIES.map((c) => ({ ...c, count: counts[c.key] ?? 0 }))];

  return (
    <div className="-mx-4 sm:mx-0 overflow-x-auto">
      <div className="flex gap-2 px-4 sm:px-0 pb-1 w-max sm:w-auto sm:flex-wrap">
        {tabs.map((tab) => {
          const selected = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelect(tab.key)}
              aria-pressed={selected}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap border transition ${
                selected
                  ? "bg-violet-600 border-violet-500 text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.7)]"
                  : "bg-neutral-900/80 border-white/10 text-neutral-300 hover:border-violet-400/40 hover:text-white"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs rounded-full px-1.5 min-w-[1.25rem] text-center ${
                  selected ? "bg-white/20 text-white" : "bg-white/10 text-neutral-400"
                }`}
              >
                {new Intl.NumberFormat("fa-IR").format(tab.count)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
