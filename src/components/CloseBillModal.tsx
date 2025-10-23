import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { formatMoney, formatDuration, minutesBetween } from "../utils/calculations";
import { Separator } from "./ui/separator";

interface CloseBillModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  billData: {
    tableName: string;
    openedAt: string;
    durationMinutes: number;
    timeCharge: number;
    itemsTotal: number;
    subTotal: number;
    discount: number;
    serviceFee: number;
    grandTotal: number;
  } | null;
}

export function CloseBillModal({ open, onClose, onConfirm, billData }: CloseBillModalProps) {
  if (!billData) return null;

  const handleConfirm = () => {
    if (billData.durationMinutes <= 0) {
      const confirmed = window.confirm(
        "Thời gian chơi chưa có (0 phút). Bạn có chắc muốn đóng bill không?"
      );
      if (!confirmed) return;
    }
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đóng bill & In tạm</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-gray-500">Bàn</p>
            <p>{billData.tableName}</p>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Thời gian chơi:</span>
              <span>{formatDuration(billData.durationMinutes)} ({billData.durationMinutes} phút)</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Phí giờ chơi:</span>
              <span>{formatMoney(billData.timeCharge)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng đồ uống:</span>
              <span>{formatMoney(billData.itemsTotal)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính:</span>
              <span>{formatMoney(billData.subTotal)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Giảm giá:</span>
              <span className="text-red-600">-{formatMoney(billData.discount)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Phụ thu:</span>
              <span>+{formatMoney(billData.serviceFee)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center pt-2">
              <span>Thành tiền:</span>
              <span className="text-2xl text-blue-600">{formatMoney(billData.grandTotal)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleConfirm}>
            Xác nhận đóng bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
