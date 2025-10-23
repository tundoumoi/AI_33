import { useState } from "react";
import { BTable } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { formatMoney } from "../utils/calculations";

interface MoveTableModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newTableId: string) => void;
  availableTables: BTable[];
  currentTableName: string;
}

export function MoveTableModal({
  open,
  onClose,
  onConfirm,
  availableTables,
  currentTableName,
}: MoveTableModalProps) {
  const [selectedTableId, setSelectedTableId] = useState<string>("");

  const handleConfirm = () => {
    if (!selectedTableId) return;
    onConfirm(selectedTableId);
    onClose();
    setSelectedTableId("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chuyển bàn</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-500 mb-4">
            Đang chơi tại: <span className="text-gray-900">{currentTableName}</span>
          </p>

          {availableTables.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Không có bàn trống để chuyển
            </p>
          ) : (
            <RadioGroup value={selectedTableId} onValueChange={setSelectedTableId}>
              <div className="space-y-3">
                {availableTables.map((table) => (
                  <div key={table.id} className="flex items-center space-x-2 border p-3 rounded-lg">
                    <RadioGroupItem value={table.id} id={table.id} />
                    <Label htmlFor={table.id} className="flex-1 cursor-pointer">
                      <div>
                        <p>{table.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatMoney(table.pricePerHour)}/giờ
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedTableId}>
            Xác nhận chuyển
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
