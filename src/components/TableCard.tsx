import { BTable } from "../types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { formatMoney } from "../utils/calculations";

interface TableCardProps {
  table: BTable;
  onOpenTable: (tableId: string) => void;
  onViewBill: (tableId: string) => void;
}

export function TableCard({ table, onOpenTable, onViewBill }: TableCardProps) {
  const statusColors = {
    available: "bg-green-100 border-green-300",
    occupied: "bg-orange-100 border-orange-300",
    reserved: "bg-purple-100 border-purple-300",
  };

  const statusTexts = {
    available: "Trống",
    occupied: "Đang chơi",
    reserved: "Đã đặt",
  };

  const statusTextColors = {
    available: "text-green-700",
    occupied: "text-orange-700",
    reserved: "text-purple-700",
  };

  return (
    <Card className={`p-4 border-2 ${statusColors[table.status]}`}>
      <div className="space-y-3">
        <div>
          <h3 className="mb-1">{table.name}</h3>
          <p className={`text-sm ${statusTextColors[table.status]}`}>
            {statusTexts[table.status]}
          </p>
        </div>
        
        <p className="text-sm text-gray-600">
          {formatMoney(table.pricePerHour)}/giờ
        </p>

        {table.note && (
          <p className="text-xs text-gray-500 italic">{table.note}</p>
        )}

        <div className="flex gap-2">
          {table.status === "available" && (
            <Button 
              onClick={() => onOpenTable(table.id)}
              className="w-full"
              size="sm"
            >
              Mở bàn
            </Button>
          )}
          
          {table.status === "occupied" && (
            <Button 
              onClick={() => onViewBill(table.id)}
              variant="outline"
              className="w-full"
              size="sm"
            >
              Xem bill
            </Button>
          )}
          
          {table.status === "reserved" && (
            <Button 
              variant="secondary"
              className="w-full"
              size="sm"
              disabled
            >
              Đã đặt trước
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
