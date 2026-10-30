import type { Product, Sale, SaleItem, StockMovement, StaffSalary, StaffLeave, StaffConsumption } from "@/types";
import { supabase } from "@/lib/supabase";

/* ---------- LocalStorage helpers (theme + store name only) ---------- */

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ---------- Theme & store name (stay in localStorage — UI prefs) ---------- */

export function getTheme(): "light" | "dark" {
  return readLocal<"light" | "dark">("sm_theme", "light");
}

export function saveTheme(theme: "light" | "dark"): void {
  writeLocal("sm_theme", theme);
}

export function getStoreName(): string | null {
  return readLocal<string | null>("sm_store_name", null);
}

export function saveStoreName(name: string): void {
  writeLocal("sm_store_name", name);
}

/* ---------- Products (Supabase) ---------- */

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    barcode: r.barcode ?? "",
    purchasePrice: Number(r.purchase_price),
    salePrice: Number(r.sale_price),
    stock: r.stock,
    unit: r.unit,
    createdAt: r.created_at,
  }));
}

export async function upsertProduct(product: Product): Promise<void> {
  const { error } = await supabase.from("products").upsert({
    id: product.id,
    name: product.name,
    barcode: product.barcode,
    purchase_price: product.purchasePrice,
    sale_price: product.salePrice,
    stock: product.stock,
    unit: product.unit,
    created_at: product.createdAt,
  });
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Sales + sale items (Supabase) ---------- */

export async function fetchSales(): Promise<Sale[]> {
  const { data: saleRows, error: saleErr } = await supabase
    .from("sales")
    .select("*")
    .order("date", { ascending: true });

  if (saleErr) throw saleErr;
  if (!saleRows || saleRows.length === 0) return [];

  const saleIds = saleRows.map((s) => s.id);
  const { data: itemRows, error: itemErr } = await supabase
    .from("sale_items")
    .select("*")
    .in("sale_id", saleIds);

  if (itemErr) throw itemErr;

  const itemsBySale: Record<string, SaleItem[]> = {};
  for (const r of itemRows ?? []) {
    if (!itemsBySale[r.sale_id]) itemsBySale[r.sale_id] = [];
    itemsBySale[r.sale_id].push({
      productId: r.product_id,
      name: r.name,
      quantity: r.quantity,
      salePrice: Number(r.sale_price),
      total: Number(r.total),
    });
  }

  return saleRows.map((s) => ({
    id: s.id,
    items: itemsBySale[s.id] ?? [],
    total: Number(s.total),
    date: s.date,
  }));
}

export async function insertSale(sale: Sale): Promise<void> {
  const { error: saleErr } = await supabase.from("sales").insert({
    id: sale.id,
    total: sale.total,
    date: sale.date,
  });
  if (saleErr) throw saleErr;

  const rows = sale.items.map((it) => ({
    sale_id: sale.id,
    product_id: it.productId,
    name: it.name,
    quantity: it.quantity,
    sale_price: it.salePrice,
    total: it.total,
  }));

  const { error: itemErr } = await supabase.from("sale_items").insert(rows);
  if (itemErr) throw itemErr;
}

/* ---------- Stock movements (Supabase) ---------- */

export async function fetchStockMovements(): Promise<StockMovement[]> {
  const { data, error } = await supabase
    .from("stock_movements")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    productId: r.product_id,
    productName: r.product_name,
    type: r.type as "in" | "out",
    quantity: r.quantity,
    date: r.date,
    note: r.note ?? undefined,
  }));
}

export async function insertStockMovement(movement: StockMovement): Promise<void> {
  const { error } = await supabase.from("stock_movements").insert({
    id: movement.id,
    product_id: movement.productId,
    product_name: movement.productName,
    type: movement.type,
    quantity: movement.quantity,
    date: movement.date,
    note: movement.note ?? null,
  });
  if (error) throw error;
}

/* ---------- Batch save helpers ---------- */

export async function saveProducts(products: Product[]): Promise<void> {
  for (const p of products) {
    await upsertProduct(p);
  }
}

export async function saveStockMovements(movements: StockMovement[]): Promise<void> {
  for (const m of movements) {
    await insertStockMovement(m);
  }
}

/* ---------- Reset + seed ---------- */

export async function resetAllData(): Promise<void> {
  await supabase.from("stock_movements").delete().neq("id", "__none__");
  await supabase.from("sale_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("sales").delete().neq("id", "__none__");
  await supabase.from("products").delete().neq("id", "__none__");
}

export async function seedSampleData(): Promise<{
  products: Product[];
  sales: Sale[];
  stockMovements: StockMovement[];
}> {
  const now = Date.now();
  const day = 86400000;

  const products: Product[] = [
    { id: "p1", name: "برنج طارم", barcode: "6220101", purchasePrice: 450000, salePrice: 520000, stock: 35, unit: "کیلوگرم", createdAt: now - day * 30 },
    { id: "p2", name: "روغن مایع آفتاب", barcode: "6220102", purchasePrice: 78000, salePrice: 95000, stock: 8, unit: "عدد", createdAt: now - day * 28 },
    { id: "p3", name: "ماکارونی پاک", barcode: "6220103", purchasePrice: 12000, salePrice: 16000, stock: 60, unit: "بسته", createdAt: now - day * 25 },
    { id: "p4", name: "رب گوجه فراوری", barcode: "6220104", purchasePrice: 65000, salePrice: 85000, stock: 4, unit: "عدد", createdAt: now - day * 22 },
    { id: "p5", name: "چای گلستان ۵۰۰گ", barcode: "6220105", purchasePrice: 180000, salePrice: 230000, stock: 22, unit: "عدد", createdAt: now - day * 20 },
    { id: "p6", name: "شکر سفید", barcode: "6220106", purchasePrice: 28000, salePrice: 36000, stock: 50, unit: "کیلوگرم", createdAt: now - day * 18 },
    { id: "p7", name: "شیر پاستوریزه", barcode: "6220107", purchasePrice: 16000, salePrice: 22000, stock: 6, unit: "عدد", createdAt: now - day * 15 },
    { id: "p8", name: "تخم مرغ بسته ۳۰تایی", barcode: "6220108", purchasePrice: 130000, salePrice: 165000, stock: 14, unit: "بسته", createdAt: now - day * 12 },
    { id: "p9", name: "ماست کاله ۹۰۰گ", barcode: "6220109", purchasePrice: 26000, salePrice: 34000, stock: 0, unit: "عدد", createdAt: now - day * 10 },
    { id: "p10", name: "پنیر لیقوان ۴۰۰گ", barcode: "6220110", purchasePrice: 95000, salePrice: 125000, stock: 18, unit: "عدد", createdAt: now - day * 8 },
  ];

  await saveProducts(products);

  const sales: Sale[] = [];
  const stockMovements: StockMovement[] = [];

  const saleScenarios: { daysAgo: number; items: { pid: string; qty: number }[] }[] = [
    { daysAgo: 6, items: [{ pid: "p1", qty: 2 }, { pid: "p2", qty: 3 }] },
    { daysAgo: 6, items: [{ pid: "p3", qty: 5 }, { pid: "p6", qty: 1 }] },
    { daysAgo: 5, items: [{ pid: "p5", qty: 1 }, { pid: "p8", qty: 1 }] },
    { daysAgo: 5, items: [{ pid: "p2", qty: 2 }] },
    { daysAgo: 4, items: [{ pid: "p4", qty: 2 }, { pid: "p3", qty: 3 }] },
    { daysAgo: 4, items: [{ pid: "p1", qty: 5 }, { pid: "p6", qty: 3 }, { pid: "p10", qty: 1 }] },
    { daysAgo: 3, items: [{ pid: "p7", qty: 4 }, { pid: "p9", qty: 2 }] },
    { daysAgo: 3, items: [{ pid: "p2", qty: 1 }, { pid: "p5", qty: 2 }] },
    { daysAgo: 2, items: [{ pid: "p3", qty: 10 }, { pid: "p8", qty: 2 }] },
    { daysAgo: 2, items: [{ pid: "p1", qty: 3 }, { pid: "p4", qty: 1 }, { pid: "p6", qty: 2 }] },
    { daysAgo: 1, items: [{ pid: "p5", qty: 1 }, { pid: "p7", qty: 3 }, { pid: "p10", qty: 2 }] },
    { daysAgo: 1, items: [{ pid: "p2", qty: 2 }, { pid: "p3", qty: 4 }] },
    { daysAgo: 0, items: [{ pid: "p1", qty: 2 }, { pid: "p8", qty: 1 }] },
    { daysAgo: 0, items: [{ pid: "p6", qty: 3 }, { pid: "p4", qty: 1 }, { pid: "p10", qty: 1 }] },
  ];

  for (const scenario of saleScenarios) {
    const items = scenario.items.map((it) => {
      const product = products.find((p) => p.id === it.pid)!;
      return {
        productId: it.pid,
        name: product.name,
        quantity: it.qty,
        salePrice: product.salePrice,
        total: product.salePrice * it.qty,
      };
    });
    const total = items.reduce((sum, i) => sum + i.total, 0);
    const date = now - scenario.daysAgo * day + Math.floor(Math.random() * 36000000);

    const sale: Sale = { id: uid(), items, total, date };
    sales.push(sale);
    await insertSale(sale);

    for (const it of scenario.items) {
      const p = products.find((p) => p.id === it.pid)!;
      p.stock = Math.max(0, p.stock - it.qty);
    }
  }

  // Update product stock after sales
  await saveProducts(products);

  // Stock-in movements
  const sm1: StockMovement = {
    id: uid(),
    productId: "p1",
    productName: "برنج طارم",
    type: "in",
    quantity: 20,
    date: now - day * 5,
    note: "خرید از عمده‌فروشی",
  };
  const sm2: StockMovement = {
    id: uid(),
    productId: "p3",
    productName: "ماکارونی پاک",
    type: "in",
    quantity: 30,
    date: now - day * 3,
    note: "خرید از تامین‌کننده",
  };
  stockMovements.push(sm1, sm2);
  await insertStockMovement(sm1);
  await insertStockMovement(sm2);

  return { products, sales, stockMovements };
}

/* ---------- Staff Salaries (Supabase) ---------- */

export async function fetchStaffSalaries(): Promise<StaffSalary[]> {
  const { data, error } = await supabase
    .from("staff_salaries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    employeeName: r.employee_name,
    baseSalary: Number(r.base_salary),
    deductions: Number(r.deductions),
    netPay: Number(r.net_pay),
    month: r.month ?? "",
    createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function insertStaffSalary(salary: StaffSalary): Promise<void> {
  const { error } = await supabase.from("staff_salaries").insert({
    employee_name: salary.employeeName,
    base_salary: Number(salary.baseSalary),
    deductions: Number(salary.deductions),
    net_pay: Number(salary.netPay),
    month: salary.month || null,
  });
  if (error) {
    console.error("[staff_salaries insert]", error);
    throw error;
  }
}

export async function deleteStaffSalary(id: string): Promise<void> {
  const { error } = await supabase.from("staff_salaries").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Staff Leaves (Supabase) ---------- */

export async function fetchStaffLeaves(): Promise<StaffLeave[]> {
  const { data, error } = await supabase
    .from("staff_leaves")
    .select("*")
    .order("leave_date", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    employeeName: r.employee_name,
    leaveDate: new Date(r.leave_date).getTime(),
    reason: r.reason ?? "",
    createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function insertStaffLeave(leave: StaffLeave): Promise<void> {
  const { error } = await supabase.from("staff_leaves").insert({
    employee_name: leave.employeeName,
    leave_date: new Date(leave.leaveDate).toISOString(),
    reason: leave.reason || null,
  });
  if (error) {
    console.error("[staff_leaves insert]", error);
    throw error;
  }
}

export async function deleteStaffLeave(id: string): Promise<void> {
  const { error } = await supabase.from("staff_leaves").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Staff Consumptions (Supabase) ---------- */

export async function fetchStaffConsumptions(): Promise<StaffConsumption[]> {
  const { data, error } = await supabase
    .from("staff_consumptions")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    employeeName: r.employee_name,
    productId: r.product_id ?? "",
    productName: r.product_name,
    quantity: r.quantity,
    date: new Date(r.date).getTime(),
    createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function insertStaffConsumption(consumption: StaffConsumption): Promise<void> {
  const { error } = await supabase.from("staff_consumptions").insert({
    employee_name: consumption.employeeName,
    product_name: consumption.productName,
    quantity: Number(consumption.quantity),
    date: new Date(consumption.date).toISOString(),
  });
  if (error) {
    console.error("[staff_consumptions insert]", error);
    throw error;
  }
}

export async function deleteStaffConsumption(id: string): Promise<void> {
  const { error } = await supabase.from("staff_consumptions").delete().eq("id", id);
  if (error) throw error;
}
