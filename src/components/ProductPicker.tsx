import { useState } from "react";
import { Product } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus } from "lucide-react";
import { formatMoney } from "../utils/calculations";

interface ProductPickerProps {
  products: Product[];
  onAdd: (productId: string, qty: number) => void;
}

export function ProductPicker({ products, onAdd }: ProductPickerProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [qty, setQty] = useState<string>("1");

  const handleAdd = () => {
    if (!selectedProductId || !qty || Number(qty) <= 0) return;
    
    const qtyNum = Math.min(999, Math.max(1, Number(qty)));
    onAdd(selectedProductId, qtyNum);
    setQty("1");
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-3">
      <p className="text-sm">Thêm sản phẩm</p>
      
      <div className="flex gap-2">
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Chọn sản phẩm..." />
          </SelectTrigger>
          <SelectContent>
            {products
              .filter((p) => p.isActive)
              .map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} - {formatMoney(product.unitPrice)}/{product.unit}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          min="1"
          max="999"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-20"
          placeholder="SL"
        />

        <Button onClick={handleAdd} size="icon" disabled={!selectedProductId}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {selectedProduct && (
        <p className="text-xs text-gray-500">
          Đơn giá: {formatMoney(selectedProduct.unitPrice)}/{selectedProduct.unit}
        </p>
      )}
    </div>
  );
}
