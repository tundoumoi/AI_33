import { useState } from "react";
import { BTable, TableStatus } from "../types";
import { TableCard } from "./TableCard";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search } from "lucide-react";

interface TableGridProps {
  tables: BTable[];
  onOpenTable: (tableId: string) => void;
  onViewBill: (tableId: string) => void;
}

export function TableGrid({ tables, onOpenTable, onViewBill }: TableGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TableStatus | "all">("all");

  const filteredTables = tables.filter((table) => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || table.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-4">Danh sách bàn</h2>
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm bàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TableStatus | "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="available">Trống</SelectItem>
              <SelectItem value="occupied">Đang chơi</SelectItem>
              <SelectItem value="reserved">Đã đặt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredTables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onOpenTable={onOpenTable}
            onViewBill={onViewBill}
          />
        ))}
      </div>

      {filteredTables.length === 0 && (
        <p className="text-center text-gray-500 py-8">Không tìm thấy bàn nào</p>
      )}
    </div>
  );
}
