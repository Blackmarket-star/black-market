export type Product = {
  id: string;
  name: string;
  barcode: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  unit: string;
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
