import assert from "node:assert";
import { describe, it } from "node:test";
import { Day } from "./Day";
import { Month } from "./Month";

describe("Day", () => {
  describe("name", () => {
    it("should return the name of the day", () => {
      const day1 = new Day(new Month(1, 2024), 1);
      const day2 = new Day(new Month(11, 2024), 12);
      assert.equal(day1.name, "01/01/2024");
      assert.equal(day2.name, "12/11/2024");
    });
  });

  describe("YYYYMMDD", () => {
    it('should format the day as "YYYY-MM-DD"', () => {
      const day = new Day(new Month(11, 2024), 12);
      assert.equal(day.YYYYMMDD, "2024-11-12");

      const day2 = new Day(new Month(2, 2024), 1);
      assert.equal(day2.YYYYMMDD, "2024-02-01");
    });
  });

  describe("minusAYear", () => {
    it("should return the day of the previous year", () => {
      const day = new Day(new Month(11, 2024), 3);
      assert.deepEqual(day.minusAYear, new Day(new Month(11, 2023), 3));
    });
  });

  describe("tomorrow", () => {
    it("should return the previous day", () => {
      const day = new Day(new Month(11, 2024), 12);
      assert.deepEqual(day.tomorrow, new Day(new Month(11, 2024), 13));
    });

    it("should handle the end of the month", () => {
      const day = new Day(new Month(11, 2024), 30);
      assert.deepEqual(day.tomorrow, new Day(new Month(12, 2024), 1));
    });

    it("should handle the end of the year", () => {
      const day = new Day(new Month(12, 2024), 31);
      assert.deepEqual(day.tomorrow, new Day(new Month(1, 2025), 1));
    });
  });
});
