import { useState, useEffect } from "react";
import { Bill, Product, BillLine } from "../types";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { ProductPicker } from "./ProductPicker";
import { BillItemsTable } from "./BillItemsTable";
import { TotalsPanel } from "./TotalsPanel";
import { DurationTicker } from "./DurationTicker";
import { formatDateTime, formatMoney, calcTotals, minutesBetween } from "../utils/calculations";
import { ArrowRightLeft, Save, Pause, CheckCircle, XCircle } from "lucide-react";

interface BillDetailPanelProps {
  bill: Bill | null;
  products: Product[];
  onUpdateBill: (updates: Partial<Bill>) => void;
  onCloseBill: () => void;
  onVoidBill: () => void;
  onMoveTable: () => void;
}

export function BillDetailPanel({
  bill,
  products,
  onUpdateBill,
  onCloseBill,
  onVoidBill,
  onMoveTable,
}: BillDetailPanelProps) {
  const [localBill, setLocalBill] = useState<Bill | null>(bill);

  useEffect(() => {
    setLocalBill(bill);
  }, [bill]);

  if (!localBill) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Chọn một bill để xem chi tiết</p>
      </div>
    );
  }

  const readonly = localBill.status !== "open";
  const totals = calcTotals(localBill);

  const handleAddProduct = (productId: string, qty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = localBill.items.find((i) => i.productId === productId);
    let newItems: BillLine[];

    if (existingItem) {
      newItems = localBill.items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              qty: item.qty + qty,
              lineTotal: (item.qty + qty) * item.unitPrice,
            }
          : item
      );
    } else {
      newItems = [
        ...localBill.items,
        {
          productId: product.id,
          productName: product.name,
          qty,
          unitPrice: product.unitPrice,
          lineTotal: qty * product.unitPrice,
        },
      ];
    }

    const updated = { ...localBill, items: newItems };
    setLocalBill(updated);
    onUpdateBill({ items: newItems });
  };

  const handleUpdateQty = (productId: string, newQty: number) => {
    const newItems = localBill.items.map((item) =>
      item.productId === productId
        ? {
            ...item,
            qty: newQty,
            lineTotal: newQty * item.unitPrice,
          }
        : item
    );
    const updated = { ...localBill, items: newItems };
    setLocalBill(updated);
    onUpdateBill({ items: newItems });
  };

  const handleRemoveItem = (productId: string) => {
    const newItems = localBill.items.filter((i) => i.productId !== productId);
    const updated = { ...localBill, items: newItems };
    setLocalBill(updated);
    onUpdateBill({ items: newItems });
  };

  const handleDiscountChange = (value: number) => {
    const updated = { ...localBill, discount: value };
    setLocalBill(updated);
    onUpdateBill({ discount: value });
  };

  const handleServiceFeeChange = (value: number) => {
    const updated = { ...localBill, serviceFee: value };
    setLocalBill(updated);
    onUpdateBill({ serviceFee: value });
  };

  const handleNoteChange = (note: string) => {
    const updated = { ...localBill, note };
    setLocalBill(updated);
  };

  const handleSaveNote = () => {
    onUpdateBill({ note: localBill.note });
  };

  const handleToggleRoundMode = (checked: boolean) => {
    const updated = { ...localBill, roundByHour: checked };
    setLocalBill(updated);
    onUpdateBill({ roundByHour: checked });
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "closed":
        return "secondary";
      case "void":
        return "destructive";
      default:
        return "outline";
    }
  };

  const statusText = (status: string) => {
    switch (status) {
      case "open":
        return "Đang mở";
      case "closed":
        return "Đã đóng";
      case "void":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2>{localBill.tableName}</h2>
              <Badge variant={statusBadgeVariant(localBill.status)}>
                {statusText(localBill.status)}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">Bill: {localBill.id}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Mở lúc:</span>
            <span>{formatDateTime(localBill.openedAt)}</span>
          </div>
          
          {localBill.closedAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Đóng lúc:</span>
              <span>{formatDateTime(localBill.closedAt)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">Thời gian chơi:</span>
            <span>
              <DurationTicker openedAt={localBill.openedAt} closedAt={localBill.closedAt} />
            </span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-gray-600">Giá thuê:</span>
            <span>{formatMoney(localBill.hourlyRate)}/giờ</span>
          </div>

          {!readonly && (
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="round-toggle" className="text-sm">
                Làm tròn theo giờ
              </Label>
              <Switch
                id="round-toggle"
                checked={localBill.roundByHour}
                onCheckedChange={handleToggleRoundMode}
              />
            </div>
          )}

          {readonly && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Chế độ tính:</span>
              <span>{localBill.roundByHour ? "Làm tròn theo giờ" : "Theo phút"}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Products */}
      {!readonly && (
        <Card className="p-4">
          <ProductPicker products={products} onAdd={handleAddProduct} />
        </Card>
      )}

      {/* Items Table */}
      <div>
        <h3 className="mb-3">Sản phẩm đã order</h3>
        <BillItemsTable
          items={localBill.items}
          onUpdateQty={handleUpdateQty}
          onRemove={handleRemoveItem}
          readonly={readonly}
        />
      </div>

      {/* Totals */}
      <TotalsPanel
        timeCharge={totals.timeCharge}
        itemsTotal={totals.itemsTotal}
        subTotal={totals.subTotal}
        discount={localBill.discount}
        serviceFee={localBill.serviceFee}
        grandTotal={totals.grandTotal}
        onDiscountChange={handleDiscountChange}
        onServiceFeeChange={handleServiceFeeChange}
        readonly={readonly}
      />

      {/* Note */}
      <div>
        <Label htmlFor="note" className="text-sm text-gray-600">
          Ghi chú
        </Label>
        <Textarea
          id="note"
          value={localBill.note || ""}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="Thêm ghi chú cho bill..."
          className="mt-1"
          disabled={readonly}
          rows={3}
        />
        {!readonly && (
          <Button onClick={handleSaveNote} variant="outline" size="sm" className="mt-2">
            <Save className="h-4 w-4 mr-2" />
            Lưu ghi chú
          </Button>
        )}
      </div>

      {/* Actions */}
      {localBill.status === "open" && (
        <div className="space-y-2">
          <Button onClick={onMoveTable} variant="outline" className="w-full">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Chuyển bàn
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={onCloseBill} className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Đóng bill
            </Button>
            <Button onClick={onVoidBill} variant="destructive" className="w-full">
              <XCircle className="h-4 w-4 mr-2" />
              Hủy bill
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
