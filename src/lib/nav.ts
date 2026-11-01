import { LayoutDashboard, Package, ShoppingCart, ClipboardList, Warehouse, Settings } from "lucide-react";

export type PageKey = "dashboard" | "products" | "sales" | "orders" | "inventory" | "settings";

export const NAV_ITEMS: {
  key: PageKey;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { key: "dashboard", label: "داشبورد", icon: LayoutDashboard },
  { key: "products", label: "مدیریت کالاها", icon: Package },
  { key: "sales", label: "ثبت فروش", icon: ShoppingCart },
  { key: "orders", label: "سفارش‌های آنلاین", icon: ClipboardList },
  { key: "inventory", label: "انبار", icon: Warehouse },
];

export const FOOTER_NAV_ITEMS: {
  key: PageKey;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { key: "settings", label: "تنظیمات", icon: Settings },
];
