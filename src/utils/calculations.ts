import { Bill, BillLine } from "../types";

/**
 * Định dạng tiền VND an toàn cho hiển thị hoá đơn.
 * Giữ nguyên chữ ký: (amount: number) => string
 * - Làm tròn về đồng
 * - Hỗ trợ số âm
 * - Chống NaN/±Infinity
 */
export function formatMoney(amount: number): string {
  const n = Number.isFinite(amount) ? Math.round(amount) : 0;
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);

  const formatted = new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abs);

  return `${sign}${formatted} đ`;
}

/**
 * Tính số phút giữa 2 thời điểm ISO.
 * Giữ nguyên chữ ký: (startISO: string, endISO?: string) => number
 * - endISO bỏ trống sẽ dùng thời điểm hiện tại
 * - Mọi giá trị không hợp lệ sẽ trả về 0
 * - Không trả âm; floor xuống phút
 */
export function minutesBetween(startISO: string, endISO?: string): number {
  const startMs = Date.parse(startISO);
  const endMs = endISO === undefined ? Date.now() : Date.parse(endISO);

  if (!Number.isFinite(startMs) || Number.isNaN(startMs)) return 0;
  if (!Number.isFinite(endMs) || Number.isNaN(endMs)) return 0;

  const diff = Math.max(0, endMs - startMs);
  return Math.floor(diff / 60000);
}

/**
 * Tính phí thời gian dựa trên phút sử dụng và đơn giá theo giờ.
 * Giữ nguyên chữ ký: (durationMinutes: number, hourlyRate: number, roundByHour: boolean) => number
 * - Nếu roundByHour: làm tròn lên theo giờ (ceil)
 * - Ngược lại: tính theo phút và làm tròn tiền về đồng
 * - Âm/NaN -> clamp về 0
 */
export function calcTimeCharge(
  durationMinutes: number,
  hourlyRate: number,
  roundByHour: boolean
): number {
  const minutes = Number.isFinite(durationMinutes) ? Math.max(0, durationMinutes) : 0;
  const rate = Number.isFinite(hourlyRate) ? Math.max(0, hourlyRate) : 0;

  if (minutes === 0 || rate === 0) return 0;

  if (roundByHour) {
    const hours = Math.ceil(minutes / 60);
    return Math.round(hours * rate);
  }

  const amount = (minutes / 60) * rate;
  return Math.round(amount);
}

/**
 * Tính tổng tiền items.
 * Giữ nguyên chữ ký: (items: BillLine[]) => number
 * - An toàn khi mảng rỗng / null (TS cho phép truyền [])
 * - Dòng thiếu/NaN lineTotal sẽ được coi như 0
 */
export function calcItemsTotal(items: BillLine[]): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    const v = (item as any)?.lineTotal;
    const n = Number.isFinite(v) ? Number(v) : 0;
    return sum + n;
  }, 0);
}

/**
 * Tính toàn bộ totals cho bill.
 * Giữ nguyên chữ ký/kiểu trả về như bản gốc.
 */
export function calcTotals(bill: Bill): {
  timeCharge: number;
  itemsTotal: number;
  subTotal: number;
  grandTotal: number;
} {
  // Lấy dữ liệu an toàn với mặc định 0
  const openedAt = (bill as any)?.openedAt as string;
  const closedAt = (bill as any)?.closedAt as string | undefined;
  const hourlyRate = Number.isFinite((bill as any)?.hourlyRate)
    ? Number((bill as any)?.hourlyRate)
    : 0;
  const roundByHour = Boolean((bill as any)?.roundByHour);
  const discount = Number.isFinite((bill as any)?.discount)
    ? Number((bill as any)?.discount)
    : 0;
  const serviceFee = Number.isFinite((bill as any)?.serviceFee)
    ? Number((bill as any)?.serviceFee)
    : 0;
  const items = (bill as any)?.items as BillLine[] | undefined;

  const durationMinutes = minutesBetween(openedAt, closedAt);
  const timeCharge = calcTimeCharge(durationMinutes, hourlyRate, roundByHour);
  const itemsTotal = calcItemsTotal(items || []);
  const subTotal = timeCharge + itemsTotal;

  // grandTotal = subTotal - discount + serviceFee, nhưng không âm
  const grandTotal = Math.max(0, Math.round(subTotal - discount + serviceFee));

  return { timeCharge, itemsTotal, subTotal, grandTotal };
}

/**
 * Format thời gian đầy đủ: "HH:mm DD/MM/YYYY"
 * Giữ nguyên chữ ký: (isoString: string) => string
 */
export function formatDateTime(isoString: string): string {
  const t = Date.parse(isoString);
  if (!Number.isFinite(t) || Number.isNaN(t)) return "";
  const date = new Date(t);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

/**
 * Format chỉ giờ: "HH:mm"
 * Giữ nguyên chữ ký: (isoString: string) => string
 */
export function formatTime(isoString: string): string {
  const t = Date.parse(isoString);
  if (!Number.isFinite(t) || Number.isNaN(t)) return "";
  const date = new Date(t);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Format thời lượng (phút) sang chuỗi "Xh Yp" hoặc "Zp".
 * Giữ nguyên chữ ký: (minutes: number) => string
 */
export function formatDuration(minutes: number): string {
  const m = Number.isFinite(minutes) ? Math.max(0, Math.floor(minutes)) : 0;
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  return hours > 0 ? `${hours}h ${mins}p` : `${mins}p`;
}
