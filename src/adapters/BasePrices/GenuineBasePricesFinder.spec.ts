import assert from "node:assert";
import { describe, it } from "node:test";
import { Day } from "../../Day";
import { Month } from "../../Month";
import { GenuineBasePricesFinder } from "./GenuineBasePricesFinder";

describe("GenuineBasePricesFinder", () => {
  const sut = new GenuineBasePricesFinder();

  describe("findForMonth", () => {
    it("should return base prices list for months before February 2025", () => {
      const nov2024 = new Month(11, 2024);
      const jan2025 = new Month(1, 2025);
      const basePricesList1 = sut.findForMonth(nov2024);
      assert.deepEqual(basePricesList1, [
        {
          label: "Avant le 1er février 2025",
          offPeakHours: 0.204,
          peakHours: 0.2672,
          solar: 0.1269,
        },
      ]);
      const basePricesList2 = sut.findForMonth(jan2025);
      assert.deepEqual(basePricesList2, [
        {
          label: "Avant le 1er février 2025",
          offPeakHours: 0.204,
          peakHours: 0.2672,
          solar: 0.1269,
        },
      ]);
    });

    it("should return base prices list for February 2025", () => {
      const feb2025 = new Month(2, 2025);
      const basePricesList = sut.findForMonth(feb2025);
      assert.deepEqual(basePricesList, [
        {
          label: "Entre le 1er février 2025 et le 14 mars 2025",
          offPeakHours: 0.2192,
          peakHours: 0.2825,
          solar: 0.1269,
        },
      ]);
    });

    it("should return base prices list for March 2025", () => {
      const mar2025 = new Month(3, 2025);
      const basePricesList = sut.findForMonth(mar2025);
      assert.deepEqual(basePricesList, [
        {
          label: "Entre le 1er février 2025 et le 14 mars 2025",
          offPeakHours: 0.2192,
          peakHours: 0.2825,
          solar: 0.1269,
        },
        {
          label: "Après le 14 mars 2025",
          offPeakHours: 0.1727,
          peakHours: 0.2124,
          solar: 0.1269,
        },
      ]);
    });

    it("should return base prices list for months after March 2025", () => {
      const apr2025 = new Month(6, 2025);
      const aug2025 = new Month(8, 2025);
      const basePricesList1 = sut.findForMonth(apr2025);
      assert.deepEqual(basePricesList1, [
        {
          label: "Après le 14 mars 2025",
          offPeakHours: 0.1727,
          peakHours: 0.2124,
          solar: 0.1269,
        },
      ]);
      const basePricesList2 = sut.findForMonth(aug2025);
      assert.deepEqual(basePricesList2, [
        {
          label: "Après le 14 mars 2025",
          offPeakHours: 0.1727,
          peakHours: 0.2124,
          solar: 0.1269,
        },
      ]);
    });
  });

  describe("findForDay", () => {
    it("should return base prices for days before 2025-02-01", () => {
      const day1 = new Day(new Month(11, 2024), 12);
      const day2 = new Day(new Month(1, 2025), 31);
      const basePrices1 = sut.findForDay(day1);
      assert.deepEqual(basePrices1, {
        label: "Avant le 1er février 2025",
        offPeakHours: 0.204,
        peakHours: 0.2672,
        solar: 0.1269,
      });
      const basePrices2 = sut.findForDay(day2);
      assert.deepEqual(basePrices2, {
        label: "Avant le 1er février 2025",
        offPeakHours: 0.204,
        peakHours: 0.2672,
        solar: 0.1269,
      });
    });

    it("should return base prices for days between 2025-02-01 and 2025-03-13 included", () => {
      const day1 = new Day(new Month(2, 2025), 1);
      const day2 = new Day(new Month(2, 2025), 18);
      const day3 = new Day(new Month(3, 2025), 13);
      const basePrices1 = sut.findForDay(day1);
      assert.deepEqual(basePrices1, {
        label: "Entre le 1er février 2025 et le 14 mars 2025",
        offPeakHours: 0.2192,
        peakHours: 0.2825,
        solar: 0.1269,
      });
      const basePrices2 = sut.findForDay(day2);
      assert.deepEqual(basePrices2, {
        label: "Entre le 1er février 2025 et le 14 mars 2025",
        offPeakHours: 0.2192,
        peakHours: 0.2825,
        solar: 0.1269,
      });
      const basePrices3 = sut.findForDay(day3);
      assert.deepEqual(basePrices3, {
        label: "Entre le 1er février 2025 et le 14 mars 2025",
        offPeakHours: 0.2192,
        peakHours: 0.2825,
        solar: 0.1269,
      });
    });

    it("should return base prices for days after 2025-03-14", () => {
      const day1 = new Day(new Month(3, 2025), 14);
      const day2 = new Day(new Month(6, 2025), 13);
      const basePrices1 = sut.findForDay(day1);
      assert.deepEqual(basePrices1, {
        label: "Après le 14 mars 2025",
        offPeakHours: 0.1727,
        peakHours: 0.2124,
        solar: 0.1269,
      });
      const basePrices2 = sut.findForDay(day2);
      assert.deepEqual(basePrices2, {
        label: "Après le 14 mars 2025",
        offPeakHours: 0.1727,
        peakHours: 0.2124,
        solar: 0.1269,
      });
    });
  });
});
