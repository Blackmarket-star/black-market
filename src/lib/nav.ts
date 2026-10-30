import { LayoutDashboard, Package, ShoppingCart, Warehouse, Settings } from "lucide-react";

export type PageKey = "dashboard" | "products" | "sales" | "inventory" | "settings";

export const NAV_ITEMS: {
  key: PageKey;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { key: "dashboard", label: "داشبورد", icon: LayoutDashboard },
  { key: "products", label: "مدیریت کالاها", icon: Package },
  { key: "sales", label: "ثبت فروش", icon: ShoppingCart },
  { key: "inventory", label: "انبار", icon: Warehouse },
];

export const FOOTER_NAV_ITEMS: {
  key: PageKey;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { key: "settings", label: "تنظیمات", icon: Settings },
];
