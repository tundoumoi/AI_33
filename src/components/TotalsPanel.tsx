import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { formatMoney } from "../utils/calculations";
import { Separator } from "./ui/separator";

interface TotalsPanelProps {
  timeCharge: number;
  itemsTotal: number;
  subTotal: number;
  discount: number;
  serviceFee: number;
  grandTotal: number;
  onDiscountChange: (value: number) => void;
  onServiceFeeChange: (value: number) => void;
  readonly?: boolean;
}

export function TotalsPanel({
  timeCharge,
  itemsTotal,
  subTotal,
  discount,
  serviceFee,
  grandTotal,
  onDiscountChange,
  onServiceFeeChange,
  readonly = false,
}: TotalsPanelProps) {
  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Phí giờ chơi:</span>
          <span>{formatMoney(timeCharge)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tổng đồ uống:</span>
          <span>{formatMoney(itemsTotal)}</span>
        </div>
        
        <Separator />
        
        <div className="flex justify-between">
          <span className="text-gray-600">Tạm tính:</span>
          <span>{formatMoney(subTotal)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="discount" className="text-sm text-gray-600">
            Giảm giá
          </Label>
          {readonly ? (
            <p className="mt-1">{formatMoney(discount)}</p>
          ) : (
            <Input
              id="discount"
              type="number"
              min="0"
              max="2000000"
              value={discount}
              onChange={(e) => {
                const val = Math.min(2000000, Math.max(0, Number(e.target.value) || 0));
                onDiscountChange(val);
              }}
              className="mt-1"
            />
          )}
        </div>

        <div>
          <Label htmlFor="serviceFee" className="text-sm text-gray-600">
            Phụ thu
          </Label>
          {readonly ? (
            <p className="mt-1">{formatMoney(serviceFee)}</p>
          ) : (
            <Input
              id="serviceFee"
              type="number"
              min="0"
              max="2000000"
              value={serviceFee}
              onChange={(e) => {
                const val = Math.min(2000000, Math.max(0, Number(e.target.value) || 0));
                onServiceFeeChange(val);
              }}
              className="mt-1"
            />
          )}
        </div>
      </div>

      <Separator />

      <div className="flex justify-between items-center">
        <span>Thành tiền:</span>
        <span className="text-2xl text-blue-600">{formatMoney(grandTotal)}</span>
      </div>
    </div>
  );
}
