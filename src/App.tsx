import { useEffect, useState } from "react";
import { BTable, Product, Bill } from "./types";
import {
  initializeData,
  getTables,
  getProducts,
  getBills,
  updateTable,
  addBill,
  updateBill as updateBillStorage,
  generateBillId,
  resetAllData,
} from "./services/storage";
import { calcTotals, minutesBetween } from "./utils/calculations";
import { TableGrid } from "./components/TableGrid";
import { BillDetailPanel } from "./components/BillDetailPanel";
import { BillsListPanel } from "./components/BillsListPanel";
import { OpenTableModal } from "./components/OpenTableModal";
import { CloseBillModal } from "./components/CloseBillModal";
import { MoveTableModal } from "./components/MoveTableModal";
import { ConfirmVoidModal } from "./components/ConfirmVoidModal";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { RotateCcw } from "lucide-react";

export default function App() {
  const [tables, setTables] = useState<BTable[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

  // Modals
  const [openTableModalData, setOpenTableModalData] = useState<BTable | null>(null);
  const [closeBillModalData, setCloseBillModalData] = useState<any>(null);
  const [moveTableModalOpen, setMoveTableModalOpen] = useState(false);
  const [voidBillModalOpen, setVoidBillModalOpen] = useState(false);

  // Load data
  const loadData = () => {
    setTables(getTables());
    setProducts(getProducts());
    setBills(getBills());
  };

  useEffect(() => {
    initializeData();
    loadData();

    // Auto-select first open bill if available
    const bills = getBills();
    const openBill = bills.find((b) => b.status === "open");
    if (openBill) {
      setSelectedBillId(openBill.id);
    }
  }, []);

  const selectedBill = bills.find((b) => b.id === selectedBillId) || null;

  // Handle open table
  const handleOpenTable = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;
    setOpenTableModalData(table);
  };

  const handleConfirmOpenTable = (tableId: string, roundByHour: boolean) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || table.status !== "available") {
      toast.error("Bàn không khả dụng");
      return;
    }

    const newBill: Bill = {
      id: generateBillId(),
      tableId: table.id,
      tableName: table.name,
      status: "open",
      openedAt: new Date().toISOString(),
      hourlyRate: table.pricePerHour,
      items: [],
      subTotal: 0,
      discount: 0,
      serviceFee: 0,
      grandTotal: 0,
      roundByHour,
    };

    addBill(newBill);
    updateTable(table.id, { status: "occupied" });
    loadData();
    setSelectedBillId(newBill.id);
    toast.success(`Đã mở ${table.name} thành công`);
  };

  // Handle view bill
  const handleViewBill = (tableId: string) => {
    const bill = bills.find((b) => b.tableId === tableId && b.status === "open");
    if (bill) {
      setSelectedBillId(bill.id);
    }
  };

  // Handle select bill
  const handleSelectBill = (billId: string) => {
    setSelectedBillId(billId);
  };

  // Handle update bill
  const handleUpdateBill = (updates: Partial<Bill>) => {
    if (!selectedBillId) return;
    updateBillStorage(selectedBillId, updates);
    loadData();
  };

  // Handle close bill
  const handleCloseBill = () => {
    if (!selectedBill || selectedBill.status !== "open") return;

    const durationMinutes = minutesBetween(selectedBill.openedAt);
    const totals = calcTotals({ ...selectedBill, closedAt: new Date().toISOString(), durationMinutes });

    setCloseBillModalData({
      tableName: selectedBill.tableName,
      openedAt: selectedBill.openedAt,
      durationMinutes,
      timeCharge: totals.timeCharge,
      itemsTotal: totals.itemsTotal,
      subTotal: totals.subTotal,
      discount: selectedBill.discount,
      serviceFee: selectedBill.serviceFee,
      grandTotal: totals.grandTotal,
    });
  };

  const handleConfirmCloseBill = () => {
    if (!selectedBill) return;

    const closedAt = new Date().toISOString();
    const durationMinutes = minutesBetween(selectedBill.openedAt, closedAt);
    const totals = calcTotals({ ...selectedBill, closedAt, durationMinutes });

    updateBillStorage(selectedBill.id, {
      status: "closed",
      closedAt,
      durationMinutes,
      timeCharge: totals.timeCharge,
      subTotal: totals.subTotal,
      grandTotal: totals.grandTotal,
    });

    updateTable(selectedBill.tableId, { status: "available" });
    loadData();
    setCloseBillModalData(null);
    toast.success("Đã đóng bill thành công");
  };

  // Handle void bill
  const handleVoidBill = () => {
    if (!selectedBill || selectedBill.status !== "open") return;
    setVoidBillModalOpen(true);
  };

  const handleConfirmVoidBill = () => {
    if (!selectedBill) return;

    updateBillStorage(selectedBill.id, { status: "void" });
    updateTable(selectedBill.tableId, { status: "available" });
    loadData();
    setVoidBillModalOpen(false);
    toast.success("Đã hủy bill");
  };

  // Handle move table
  const handleMoveTable = () => {
    if (!selectedBill || selectedBill.status !== "open") return;
    setMoveTableModalOpen(true);
  };

  const handleConfirmMoveTable = (newTableId: string) => {
    if (!selectedBill) return;

    const newTable = tables.find((t) => t.id === newTableId);
    if (!newTable || newTable.status !== "available") {
      toast.error("Bàn không khả dụng");
      return;
    }

    // Update old table to available
    updateTable(selectedBill.tableId, { status: "available" });
    
    // Update new table to occupied
    updateTable(newTable.id, { status: "occupied" });
    
    // Update bill
    updateBillStorage(selectedBill.id, {
      tableId: newTable.id,
      tableName: newTable.name,
    });

    loadData();
    toast.success(`Đã chuyển sang ${newTable.name}`);
  };

  // Handle reset data
  const handleResetData = () => {
    if (window.confirm("Bạn có chắc muốn reset toàn bộ dữ liệu về mặc định không?")) {
      resetAllData();
      loadData();
      setSelectedBillId(null);
      toast.success("Đã reset dữ liệu thành công");
    }
  };

  const availableTables = tables.filter((t) => t.status === "available");

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1>Quản lý Billiard</h1>
            <Button onClick={handleResetData} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset dữ liệu
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Tables */}
          <div className="lg:col-span-3">
            <ScrollArea className="h-[calc(100vh-140px)]">
              <TableGrid
                tables={tables}
                onOpenTable={handleOpenTable}
                onViewBill={handleViewBill}
              />
            </ScrollArea>
          </div>

          {/* Middle: Bill Detail */}
          <div className="lg:col-span-5">
            <ScrollArea className="h-[calc(100vh-140px)]">
              <BillDetailPanel
                bill={selectedBill}
                products={products}
                onUpdateBill={handleUpdateBill}
                onCloseBill={handleCloseBill}
                onVoidBill={handleVoidBill}
                onMoveTable={handleMoveTable}
              />
            </ScrollArea>
          </div>

          {/* Right: Bills List */}
          <div className="lg:col-span-4">
            <ScrollArea className="h-[calc(100vh-140px)]">
              <BillsListPanel
                bills={bills}
                selectedBillId={selectedBillId}
                onSelectBill={handleSelectBill}
              />
            </ScrollArea>
          </div>
        </div>
      </main>

      {/* Modals */}
      <OpenTableModal
        table={openTableModalData}
        open={!!openTableModalData}
        onClose={() => setOpenTableModalData(null)}
        onConfirm={handleConfirmOpenTable}
      />

      <CloseBillModal
        open={!!closeBillModalData}
        onClose={() => setCloseBillModalData(null)}
        onConfirm={handleConfirmCloseBill}
        billData={closeBillModalData}
      />

      <MoveTableModal
        open={moveTableModalOpen}
        onClose={() => setMoveTableModalOpen(false)}
        onConfirm={handleConfirmMoveTable}
        availableTables={availableTables}
        currentTableName={selectedBill?.tableName || ""}
      />

      <ConfirmVoidModal
        open={voidBillModalOpen}
        onClose={() => setVoidBillModalOpen(false)}
        onConfirm={handleConfirmVoidBill}
        billId={selectedBill?.id || ""}
        tableName={selectedBill?.tableName || ""}
      />
    </div>
  );
}
