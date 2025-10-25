import {
  formatMoney,
  minutesBetween,
  calcTimeCharge,
  calcItemsTotal,
  calcTotals,
  formatDateTime,
  formatTime,
  formatDuration,
} from "./calculations"; // đổi đường dẫn nếu cần
import { Bill, BillLine } from "../types";

describe("Bill utility functions", () => {
  // ==== GLOBAL SETUP ====
  const realNow = Date.now;
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });
  afterEach(() => {
    jest.useRealTimers();
    Date.now = realNow;
    jest.restoreAllMocks();
  });

  // =====================================================
  describe("formatMoney()", () => {
    test("should format positive large number", () => {
      expect(formatMoney(1234567)).toEqual("1.234.567 đ");
    });

    test("should round small number correctly", () => {
      expect(formatMoney(999.9)).toEqual("1.000 đ");
    });

    test("should format 0 as '0 đ'", () => {
      expect(formatMoney(0)).toEqual("0 đ");
    });

    test("should show '-' sign for negative", () => {
      expect(formatMoney(-45000)).toEqual("-45.000 đ");
    });

    test("should format very large number", () => {
      expect(formatMoney(9876543210)).toEqual("9.876.543.210 đ");
    });

    test("should fallback to 0 for NaN", () => {
      expect(formatMoney(NaN)).toEqual("0 đ");
    });

    test("should fallback to 0 for Infinity", () => {
      expect(formatMoney(Infinity)).toEqual("0 đ");
    });

    test("should fallback to 0 for undefined (any)", () => {
      expect(formatMoney(undefined as any)).toEqual("0 đ");
    });
  });

  // =====================================================
  describe("minutesBetween()", () => {
    test("should return 60 for 1-hour difference", () => {
      expect(
        minutesBetween("2024-01-01T00:00:00Z", "2024-01-01T01:00:00Z")
      ).toEqual(60);
    });

    test("should use Date.now() when endISO undefined", () => {
      const start = new Date(Date.now() - 60000).toISOString(); // 1 min ago
      const result = minutesBetween(start, undefined);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    test("should return 0 for end before start", () => {
      expect(
        minutesBetween("2024-01-01T02:00:00Z", "2024-01-01T01:00:00Z")
      ).toEqual(0);
    });

    test("should return 0 when both times equal", () => {
      expect(
        minutesBetween("2024-01-01T00:00:00Z", "2024-01-01T00:00:00Z")
      ).toEqual(0);
    });

    test("should handle invalid startISO", () => {
      expect(minutesBetween("invalid", "2024-01-01T01:00:00Z")).toEqual(0);
    });

    test("should handle invalid endISO", () => {
      expect(minutesBetween("2024-01-01T01:00:00Z", "bad")).toEqual(0);
    });

    test("should return 0 if both invalid", () => {
      expect(minutesBetween("bad", "bad")).toEqual(0);
    });
  });

  // =====================================================
  describe("calcTimeCharge()", () => {
    test("should calculate minute-based correctly", () => {
      expect(calcTimeCharge(90, 60000, false)).toEqual(90000);
    });

    test("should round up to nearest hour if roundByHour = true", () => {
      expect(calcTimeCharge(90, 60000, true)).toEqual(120000);
    });

    test("should handle exact hours correctly", () => {
      expect(calcTimeCharge(120, 50000, true)).toEqual(100000);
    });

    test("should return 0 when duration = 0", () => {
      expect(calcTimeCharge(0, 50000, false)).toEqual(0);
    });

    test("should return 0 when rate = 0", () => {
      expect(calcTimeCharge(60, 0, false)).toEqual(0);
    });

    test("should clamp negative duration", () => {
      expect(calcTimeCharge(-30, 50000, false)).toEqual(0);
    });

    test("should clamp negative rate", () => {
      expect(calcTimeCharge(60, -50000, false)).toEqual(0);
    });

    test("should handle NaN duration", () => {
      expect(calcTimeCharge(NaN, 50000, false)).toEqual(0);
    });

    test("should handle Infinity rate", () => {
      expect(calcTimeCharge(60, Infinity, false)).toEqual(0);
    });

    test("should default to minute-based if roundByHour undefined", () => {
      expect(calcTimeCharge(90, 50000, undefined as any)).toEqual(75000);
    });
  });

  // =====================================================
  describe("calcItemsTotal()", () => {
    test("should sum multiple valid items", () => {
      expect(
        calcItemsTotal([
          { lineTotal: 10000 },
          { lineTotal: 20000 },
          { lineTotal: 5000 },
        ] as any)
      ).toEqual(35000);
    });

    test("should handle single item", () => {
      expect(calcItemsTotal([{ lineTotal: 15000 }] as any)).toEqual(15000);
    });

    test("should return 0 for empty array", () => {
      expect(calcItemsTotal([])).toEqual(0);
    });

    test("should ignore invalid lineTotal values", () => {
      expect(
        calcItemsTotal([
          { lineTotal: 10000 },
          { lineTotal: "abc" },
          { lineTotal: NaN },
        ] as any)
      ).toEqual(10000);
    });

    test("should return 0 if input is null", () => {
      expect(calcItemsTotal(null as any)).toEqual(0);
    });

    test("should return 0 if input is not array", () => {
      expect(calcItemsTotal("abc" as any)).toEqual(0);
    });

    test("should ignore undefined elements", () => {
      expect(calcItemsTotal([undefined, { lineTotal: 5000 }] as any)).toEqual(
        5000
      );
    });
  });

  // =====================================================
  describe("calcTotals()", () => {
    test("should compute all totals correctly", () => {
      const bill = {
        openedAt: "2025-10-24T10:00:00Z",
        closedAt: "2025-10-24T12:00:00Z",
        hourlyRate: 100000,
        items: [{ lineTotal: 100000 }],
        discount: 0,
        serviceFee: 0,
        roundByHour: false,
      };
      expect(calcTotals(bill as any)).toEqual({
        timeCharge: 200000,
        itemsTotal: 100000,
        subTotal: 300000,
        grandTotal: 300000,
      });
    });

    test("should apply discount correctly", () => {
      const bill = {
        openedAt: "2025-10-24T10:00:00Z",
        closedAt: "2025-10-24T12:00:00Z",
        hourlyRate: 100000,
        items: [{ lineTotal: 100000 }],
        discount: 50000,
        serviceFee: 0,
        roundByHour: false,
      };
      expect(calcTotals(bill as any).grandTotal).toEqual(250000);
    });

    test("should apply service fee correctly", () => {
      const bill = {
        openedAt: "2025-10-24T10:00:00Z",
        closedAt: "2025-10-24T12:00:00Z",
        hourlyRate: 100000,
        items: [{ lineTotal: 100000 }],
        discount: 0,
        serviceFee: 20000,
        roundByHour: false,
      };
      expect(calcTotals(bill as any).grandTotal).toEqual(320000);
    });

    test("should round up by hour if enabled", () => {
      const bill = {
        openedAt: "2025-10-24T10:00:00Z",
        closedAt: "2025-10-24T10:20:00Z",
        hourlyRate: 100000,
        roundByHour: true,
      };
      expect(calcTotals(bill as any).timeCharge).toEqual(100000);
    });

    test("should handle empty items list", () => {
      const bill = {
        openedAt: "10:00",
        closedAt: "11:00",
        hourlyRate: 50000,
        items: [],
      };
      expect(calcTotals(bill as any).itemsTotal).toEqual(0);
    });

    test("should prevent negative grandTotal", () => {
      const bill = {
        openedAt: "10:00",
        closedAt: "12:00",
        hourlyRate: 100000,
        discount: 999999,
        serviceFee: 0,
      };
      expect(calcTotals(bill as any).grandTotal).toEqual(0);
    });

    test("should handle missing openedAt safely", () => {
      expect(calcTotals({ closedAt: "11:00", hourlyRate: 100000 } as any)).toBeTruthy();
    });

    test("should handle NaN hourlyRate", () => {
      const result = calcTotals({
        openedAt: "10:00",
        closedAt: "11:00",
        hourlyRate: NaN,
      } as any);
      expect(result.timeCharge).toEqual(0);
    });

    test("should handle null items safely", () => {
      const result = calcTotals({
        openedAt: "10:00",
        closedAt: "11:00",
        hourlyRate: 50000,
        items: null,
      } as any);
      expect(result.itemsTotal).toEqual(0);
    });
  });

  // =====================================================
  describe("formatDateTime()", () => {
    test("should format valid ISO correctly", () => {
      expect(formatDateTime("2024-05-10T08:30:00Z")).toContain("10/05/2024");
    });

    test("should pad hour/minute", () => {
      expect(formatDateTime("2024-01-01T02:00:00Z")).toContain("01/01/2024");
    });

    test("should handle milliseconds", () => {
      expect(formatDateTime("2024-07-15T12:45:30.123Z")).toContain("15/07/2024");
    });

    test("should handle invalid string", () => {
      expect(formatDateTime("invalid-date")).toEqual("");
    });

    test("should handle null or undefined", () => {
      expect(formatDateTime(undefined as any)).toEqual("");
      expect(formatDateTime(null as any)).toEqual("");
    });

    test("should handle empty string", () => {
      expect(formatDateTime("")).toEqual("");
    });
  });

  // =====================================================
  describe("formatTime()", () => {
    test("should format valid ISO", () => {
      expect(formatTime("2025-10-24T07:30:00Z")).toMatch(/\d{2}:\d{2}/);
    });

    test("should handle single-digit time", () => {
      expect(formatTime("2025-10-24T03:05:00Z")).toContain("03:05");
    });

    test("should handle invalid string", () => {
      expect(formatTime("invalid-date")).toEqual("");
    });

    test("should handle null/undefined", () => {
      expect(formatTime(null as any)).toEqual("");
      expect(formatTime(undefined as any)).toEqual("");
    });
  });

  // =====================================================
  describe("formatDuration()", () => {
    test("should format <60 minutes", () => {
      expect(formatDuration(45)).toEqual("45p");
    });

    test("should format >60 minutes", () => {
      expect(formatDuration(125)).toEqual("2h 5p");
    });

    test("should format exact hours", () => {
      expect(formatDuration(120)).toEqual("2h 0p");
    });

    test("should handle 0 minutes", () => {
      expect(formatDuration(0)).toEqual("0p");
    });

    test("should clamp negative", () => {
      expect(formatDuration(-30)).toEqual("0p");
    });

    test("should handle decimal minutes", () => {
      expect(formatDuration(89.9)).toEqual("1h 29p");
    });

    test("should handle NaN", () => {
      expect(formatDuration(NaN)).toEqual("0p");
    });

    test("should handle Infinity", () => {
      expect(formatDuration(Infinity)).toEqual("0p");
    });

    test("should handle undefined", () => {
      expect(formatDuration(undefined as any)).toEqual("0p");
    });
  });
});