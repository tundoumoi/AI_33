import { useState } from "react";
import { Bill } from "../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Search } from "lucide-react";
import { formatDateTime, formatMoney, formatDuration, minutesBetween } from "../utils/calculations";

interface BillsListPanelProps {
  bills: Bill[];
  selectedBillId: string | null;
  onSelectBill: (billId: string) => void;
}

export function BillsListPanel({ bills, selectedBillId, onSelectBill }: BillsListPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("open");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const openBills = bills.filter((b) => b.status === "open");
  const closedTodayBills = bills.filter((b) => {
    if (b.status !== "closed" || !b.closedAt) return false;
    const closedDate = new Date(b.closedAt);
    closedDate.setHours(0, 0, 0, 0);
    return closedDate.getTime() === today.getTime();
  });
  const allBills = bills;

  const filterBills = (billsList: Bill[]) => {
    return billsList.filter((bill) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        bill.id.toLowerCase().includes(searchLower) ||
        bill.tableName.toLowerCase().includes(searchLower)
      );
    });
  };

  const getBillsList = () => {
    switch (activeTab) {
      case "open":
        return filterBills(openBills);
      case "closed-today":
        return filterBills(closedTodayBills);
      case "all":
        return filterBills(allBills);
      default:
        return [];
    }
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

  const currentBills = getBillsList();

  return (
    <div className="space-y-4">
      <h2>Danh sách Bill</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm theo mã bill hoặc tên bàn..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="open">
            Đang mở ({openBills.length})
          </TabsTrigger>
          <TabsTrigger value="closed-today">
            Hôm nay ({closedTodayBills.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Tất cả ({allBills.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-2 mt-4">
          {currentBills.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Không có bill nào</p>
          ) : (
            currentBills.map((bill) => {
              const duration = minutesBetween(bill.openedAt, bill.closedAt);
              const isSelected = bill.id === selectedBillId;

              return (
                <Card
                  key={bill.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? "border-blue-500 border-2" : ""
                  }`}
                  onClick={() => onSelectBill(bill.id)}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm">{bill.id}</p>
                        <p className="text-gray-600">{bill.tableName}</p>
                      </div>
                      <Badge variant={statusBadgeVariant(bill.status)}>
                        {statusText(bill.status)}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-500">
                      <p>Mở: {formatDateTime(bill.openedAt)}</p>
                      <p>Thời lượng: {formatDuration(duration)}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-gray-600">
                        {bill.status === "closed" ? "Thành tiền:" : "Tạm tính:"}
                      </span>
                      <span className="text-blue-600">
                        {formatMoney(bill.grandTotal || bill.subTotal)}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
