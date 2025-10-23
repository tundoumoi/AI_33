import { BTable, Product, Bill } from "../types";

const STORAGE_KEYS = {
  TABLES: "billiard_tables",
  PRODUCTS: "billiard_products",
  BILLS: "billiard_bills",
};

// Seed data
const INITIAL_TABLES: BTable[] = [
  { id: "T01", name: "Bàn 1", status: "available", pricePerHour: 60000 },
  { id: "T02", name: "Bàn 2", status: "available", pricePerHour: 60000 },
  { id: "T03", name: "Bàn 3", status: "occupied", pricePerHour: 70000 },
  { id: "T04", name: "Bàn 4", status: "available", pricePerHour: 70000 },
  { id: "T05", name: "Bàn 5", status: "reserved", pricePerHour: 80000 },
  { id: "T06", name: "Bàn 6", status: "available", pricePerHour: 80000 },
  { id: "T07", name: "Bàn 7", status: "available", pricePerHour: 90000 },
  { id: "T08", name: "Bàn 8", status: "available", pricePerHour: 90000 },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: "P01", name: "Nước suối", unitPrice: 10000, unit: "chai", isActive: true },
  { id: "P02", name: "7Up", unitPrice: 15000, unit: "lon", isActive: true },
  { id: "P03", name: "Sting", unitPrice: 15000, unit: "lon", isActive: true },
  { id: "P04", name: "Khăn lạnh", unitPrice: 5000, unit: "cái", isActive: true },
  { id: "P05", name: "Snack", unitPrice: 20000, unit: "gói", isActive: true },
];

const INITIAL_BILLS: Bill[] = [
  {
    id: "BILL-2025-0001",
    tableId: "T03",
    tableName: "Bàn 3",
    status: "open",
    openedAt: new Date(Date.now() - 45 * 60000).toISOString(), // 45 phút trước
    hourlyRate: 70000,
    items: [
      { productId: "P02", productName: "7Up", qty: 2, unitPrice: 15000, lineTotal: 30000 },
      { productId: "P04", productName: "Khăn lạnh", qty: 1, unitPrice: 5000, lineTotal: 5000 },
    ],
    subTotal: 0,
    discount: 0,
    serviceFee: 0,
    grandTotal: 0,
    roundByHour: true,
  },
];

// Initialize data
export function initializeData() {
  if (!localStorage.getItem(STORAGE_KEYS.TABLES)) {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(INITIAL_TABLES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BILLS)) {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(INITIAL_BILLS));
  }
}

// Tables
export function getTables(): BTable[] {
  const data = localStorage.getItem(STORAGE_KEYS.TABLES);
  return data ? JSON.parse(data) : [];
}

export function saveTables(tables: BTable[]) {
  localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
}

export function updateTable(id: string, updates: Partial<BTable>) {
  const tables = getTables();
  const index = tables.findIndex((t) => t.id === id);
  if (index !== -1) {
    tables[index] = { ...tables[index], ...updates };
    saveTables(tables);
  }
}

// Products
export function getProducts(): Product[] {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

// Bills
export function getBills(): Bill[] {
  const data = localStorage.getItem(STORAGE_KEYS.BILLS);
  return data ? JSON.parse(data) : [];
}

export function saveBills(bills: Bill[]) {
  localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
}

export function addBill(bill: Bill) {
  const bills = getBills();
  bills.push(bill);
  saveBills(bills);
}

export function updateBill(id: string, updates: Partial<Bill>) {
  const bills = getBills();
  const index = bills.findIndex((b) => b.id === id);
  if (index !== -1) {
    bills[index] = { ...bills[index], ...updates };
    saveBills(bills);
  }
}

export function deleteBill(id: string) {
  const bills = getBills().filter((b) => b.id !== id);
  saveBills(bills);
}

// Generate Bill ID
export function generateBillId(): string {
  const bills = getBills();
  const year = new Date().getFullYear();
  const billsThisYear = bills.filter((b) => b.id.startsWith(`BILL-${year}`));
  const nextNumber = billsThisYear.length + 1;
  return `BILL-${year}-${String(nextNumber).padStart(4, "0")}`;
}

// Reset all data
export function resetAllData() {
  localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(INITIAL_TABLES));
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(INITIAL_BILLS));
}
