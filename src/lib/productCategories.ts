export const PRODUCT_CATEGORIES = [
  { key: "drinks", label: "نوشیدنی" },
  { key: "snacks", label: "تنقلات" },
  { key: "ice-cream", label: "بستنی" },
  { key: "dairy", label: "لبنیات" },
  { key: "detergents", label: "شوینده" },
  { key: "personal-care", label: "بهداشت شخصی" },
  { key: "groceries", label: "خواربار" },
] as const;

export type ProductCategoryKey = (typeof PRODUCT_CATEGORIES)[number]["key"];

export function categoryLabel(key: string | null): string {
  return PRODUCT_CATEGORIES.find((c) => c.key === key)?.label ?? "بدون دسته";
}
