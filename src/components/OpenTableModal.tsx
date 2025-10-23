import { useState } from "react";
import { BTable } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { formatMoney } from "../utils/calculations";

interface OpenTableModalProps {
  table: BTable | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (tableId: string, roundByHour: boolean) => void;
}

export function OpenTableModal({ table, open, onClose, onConfirm }: OpenTableModalProps) {
  const [roundByHour, setRoundByHour] = useState(true);

  if (!table) return null;

  const handleConfirm = () => {
    onConfirm(table.id, roundByHour);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mở bàn</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-gray-500">Tên bàn</p>
            <p>{table.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Giá thuê</p>
            <p>{formatMoney(table.pricePerHour)}/giờ</p>
          </div>

          <div className="flex items-center justify-between space-x-2 border-t pt-4">
            <Label htmlFor="round-mode" className="flex-1">
              <div>
                <p>Làm tròn theo giờ</p>
                <p className="text-xs text-gray-500">
                  {roundByHour ? "Tính theo block 1 giờ (làm tròn lên)" : "Tính chính xác theo phút"}
                </p>
              </div>
            </Label>
            <Switch
              id="round-mode"
              checked={roundByHour}
              onCheckedChange={setRoundByHour}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleConfirm}>
            Xác nhận mở bàn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
