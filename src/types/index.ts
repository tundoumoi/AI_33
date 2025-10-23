export type TableStatus = "available" | "occupied" | "reserved";

export type BTable = {
  id: string;
  name: string;
  status: TableStatus;
  pricePerHour: number;
  note?: string;
};

export type Product = {
  id: string;
  name: string;
  unitPrice: number;
  unit: string;
  isActive: boolean;
};

export type BillLine = {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type BillStatus = "open" | "closed" | "void";

export type Bill = {
  id: string;
  tableId: string;
  tableName: string;
  status: BillStatus;
  openedAt: string;
  closedAt?: string;
  durationMinutes?: number;
  hourlyRate: number;
  timeCharge?: number;
  items: BillLine[];
  subTotal: number;
  discount: number;
  serviceFee: number;
  grandTotal: number;
  note?: string;
  roundByHour: boolean; // true = làm tròn theo giờ, false = theo phút
};
