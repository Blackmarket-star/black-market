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
    category: r.category ?? null,
    categorySource: r.category_source === "manual" ? "manual" : "auto",
    imageUrl: r.image_url ?? null,
    imageSource: r.image_source === "manual" || r.image_source === "none" ? r.image_source : "auto",
    createdAt: r.created_at,
  }));
}

export async function insertProduct(product: Product): Promise<void> {
  const { error } = await supabase.from("products").insert({
    id: product.id,
    name: product.name,
    barcode: product.barcode,
    purchase_price: product.purchasePrice,
    sale_price: product.salePrice,
    stock: product.stock,
    unit: product.unit,
    category: product.category,
    category_source: product.categorySource,
    created_at: product.createdAt,
  });
  if (error) throw error;
}

/* Stock is never written from the browser for existing products; it only changes through sales and stock movements. */
export async function updateProductDetails(product: Product): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({
      name: product.name,
      barcode: product.barcode,
      purchase_price: product.purchasePrice,
      sale_price: product.salePrice,
      unit: product.unit,
    })
    .eq("id", product.id);
  if (error) throw error;
}

/* Manual categories are stored with their source so automatic categorization never overwrites them. */
export async function setProductCategory(
  productId: string,
  choice: { source: "auto" } | { source: "manual"; category: string | null }
): Promise<void> {
  const payload =
    choice.source === "auto"
      ? { category_source: "auto" }
      : { category_source: "manual", category: choice.category };
  const { error } = await supabase.from("products").update(payload).eq("id", productId);
  if (error) throw error;
}

const PRODUCT_IMAGE_BUCKET = "product-images";

function productImagePath(imageUrl: string): string | null {
  const marker = `/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(imageUrl.slice(index + marker.length));
}

export async function removeStoredProductImage(imageUrl: string | null): Promise<void> {
  if (!imageUrl) return;
  const path = productImagePath(imageUrl);
  if (!path) return;
  await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
}

export async function replaceProductImage(
  productId: string,
  previousUrl: string | null,
  file: File
): Promise<string> {
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${productId}/${Date.now()}.${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "3600" });
  if (uploadErr) throw uploadErr;

  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  const { error: updateErr } = await supabase
    .from("products")
    .update({ image_url: data.publicUrl, image_source: "manual" })
    .eq("id", productId);
  if (updateErr) {
    await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
    throw updateErr;
  }

  await removeStoredProductImage(previousUrl);
  return data.publicUrl;
}

export async function removeProductImage(productId: string, previousUrl: string | null): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ image_url: null, image_source: "none" })
    .eq("id", productId);
  if (error) throw error;

  await removeStoredProductImage(previousUrl);
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

export async function recordSale(sale: Sale): Promise<void> {
  const { error } = await supabase.rpc("record_sale", {
    p_sale_id: sale.id,
    p_items: sale.items.map((it) => ({
      productId: it.productId,
      name: it.name,
      quantity: it.quantity,
    })),
    p_date: sale.date,
  });
  if (error) throw error;
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

export async function recordStockMovement(movement: StockMovement): Promise<void> {
  const { error } = await supabase.rpc("record_stock_movement", {
    p_product_id: movement.productId,
    p_type: movement.type,
    p_quantity: movement.quantity,
    p_movement_id: movement.id,
    p_note: movement.note ?? null,
    p_date: movement.date,
  });
  if (error) throw error;
}

/* ---------- Reset ---------- */

export async function resetAllData(): Promise<void> {
  await supabase.from("stock_movements").delete().neq("id", "__none__");
  await supabase.from("sale_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("sales").delete().neq("id", "__none__");
  await supabase.from("products").delete().neq("id", "__none__");
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
