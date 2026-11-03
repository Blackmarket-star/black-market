export type Product = {
  id: string;
  name: string;
  barcode: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  unit: string;
  category: string | null;
  categorySource: "auto" | "manual";
  imageUrl: string | null;
  imageSource: "auto" | "manual" | "none";
  createdAt: number;
};

export type SaleItem = {
  productId: string;
  name: string;
  quantity: number;
  salePrice: number;
  total: number;
};

export type Sale = {
  id: string;
  items: SaleItem[];
  total: number;
  date: number;
};

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  type: "in" | "out";
  quantity: number;
  date: number;
  note?: string;
};

export type OrderStatus = "pending" | "completed" | "canceled";

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed";

export type Order = {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  province: string;
  city: string;
  address: string;
  buildingUnit: string | null;
  postalCode: string | null;
  deliveryNotes: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: number;
};

export type StoreSettings = {
  province: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

export type StaffSalary = {
  id: string;
  employeeName: string;
  baseSalary: number;
  deductions: number;
  netPay: number;
  month: string;
  createdAt: number;
};

export type StaffLeave = {
  id: string;
  employeeName: string;
  leaveDate: number;
  reason: string;
  createdAt: number;
};

export type StaffConsumption = {
  id: string;
  employeeName: string;
  productId: string;
  productName: string;
  quantity: number;
  date: number;
  createdAt: number;
};
