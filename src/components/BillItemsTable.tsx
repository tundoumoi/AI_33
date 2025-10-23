import { BillLine } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Trash2 } from "lucide-react";
import { formatMoney } from "../utils/calculations";

interface BillItemsTableProps {
  items: BillLine[];
  onUpdateQty: (productId: string, newQty: number) => void;
  onRemove: (productId: string) => void;
  readonly?: boolean;
}

export function BillItemsTable({ items, onUpdateQty, onRemove, readonly = false }: BillItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-gray-500">
        Chưa có sản phẩm nào
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sản phẩm</TableHead>
            <TableHead className="w-24">SL</TableHead>
            <TableHead className="text-right">Đơn giá</TableHead>
            <TableHead className="text-right">Thành tiền</TableHead>
            {!readonly && <TableHead className="w-12"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.productId}>
              <TableCell>{item.productName}</TableCell>
              <TableCell>
                {readonly ? (
                  <span>{item.qty}</span>
                ) : (
                  <Input
                    type="number"
                    min="1"
                    max="999"
                    value={item.qty}
                    onChange={(e) => {
                      const newQty = Math.min(999, Math.max(1, Number(e.target.value) || 1));
                      onUpdateQty(item.productId, newQty);
                    }}
                    className="w-full"
                  />
                )}
              </TableCell>
              <TableCell className="text-right text-sm text-gray-600">
                {formatMoney(item.unitPrice)}
              </TableCell>
              <TableCell className="text-right">
                {formatMoney(item.lineTotal)}
              </TableCell>
              {!readonly && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(item.productId)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
