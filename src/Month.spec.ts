import assert from "node:assert";
import { describe, it } from "node:test";
import { Month } from "./Month";

describe("Month", () => {
  describe("reportName", () => {
    it("should build a human readable report name", () => {
      const month = new Month(1, 2024);
      assert.equal(month.reportName, "Relevé 01/2024");
    });
  });

  describe("name", () => {
    it("should build a human readable name", () => {
      const month1 = new Month(11, 2024);
      const month2 = new Month(1, 2024);
      assert.equal(month1.name, "11/2024");
      assert.equal(month2.name, "01/2024");
    });
  });

  describe("days", () => {
    it("should return an array with the days of the month", () => {
      const month = new Month(11, 2024);
      const days = month.days;
      assert.equal(days.length, 30);
      assert.deepEqual(
        days.map((day) => {
          return day.name;
        }),
        [
          "01/11/2024",
          "02/11/2024",
          "03/11/2024",
          "04/11/2024",
          "05/11/2024",
          "06/11/2024",
          "07/11/2024",
          "08/11/2024",
          "09/11/2024",
          "10/11/2024",
          "11/11/2024",
          "12/11/2024",
          "13/11/2024",
          "14/11/2024",
          "15/11/2024",
          "16/11/2024",
          "17/11/2024",
          "18/11/2024",
          "19/11/2024",
          "20/11/2024",
          "21/11/2024",
          "22/11/2024",
          "23/11/2024",
          "24/11/2024",
          "25/11/2024",
          "26/11/2024",
          "27/11/2024",
          "28/11/2024",
          "29/11/2024",
          "30/11/2024",
        ],
      );
    });

    it("should detect February of non leap year", () => {
      const month = new Month(2, 2025);
      const days = month.days;
      assert.equal(days.length, 28);
      assert.deepEqual(
        days.map((day) => {
          return day.name;
        }),
        [
          "01/02/2025",
          "02/02/2025",
          "03/02/2025",
          "04/02/2025",
          "05/02/2025",
          "06/02/2025",
          "07/02/2025",
          "08/02/2025",
          "09/02/2025",
          "10/02/2025",
          "11/02/2025",
          "12/02/2025",
          "13/02/2025",
          "14/02/2025",
          "15/02/2025",
          "16/02/2025",
          "17/02/2025",
          "18/02/2025",
          "19/02/2025",
          "20/02/2025",
          "21/02/2025",
          "22/02/2025",
          "23/02/2025",
          "24/02/2025",
          "25/02/2025",
          "26/02/2025",
          "27/02/2025",
          "28/02/2025",
        ],
      );
    });

    it("should detect February of leap year", () => {
      const month = new Month(2, 2024);
      const days = month.days;
      assert.equal(days.length, 29);
      assert.deepEqual(
        days.map((day) => {
          return day.name;
        }),
        [
          "01/02/2024",
          "02/02/2024",
          "03/02/2024",
          "04/02/2024",
          "05/02/2024",
          "06/02/2024",
          "07/02/2024",
          "08/02/2024",
          "09/02/2024",
          "10/02/2024",
          "11/02/2024",
          "12/02/2024",
          "13/02/2024",
          "14/02/2024",
          "15/02/2024",
          "16/02/2024",
          "17/02/2024",
          "18/02/2024",
          "19/02/2024",
          "20/02/2024",
          "21/02/2024",
          "22/02/2024",
          "23/02/2024",
          "24/02/2024",
          "25/02/2024",
          "26/02/2024",
          "27/02/2024",
          "28/02/2024",
          "29/02/2024",
        ],
      );
    });
  });

  describe("minusAYear", () => {
    it("should return the month of the previous year", () => {
      const month = new Month(11, 2024);
      assert.deepEqual(month.minusAYear, new Month(11, 2023));
    });
  });

  describe("next", () => {
    it("should return the next month", () => {
      const march = new Month(3, 2024);
      assert.deepEqual(march.next, new Month(4, 2024));

      const december = new Month(12, 2024);
      assert.deepEqual(december.next, new Month(1, 2025));
    });
  });

  describe("dayNumber", () => {
    it("should return the number of day", () => {
      const february = new Month(2, 2024);
      assert.deepEqual(february.dayNumber, 29);
      const march = new Month(3, 2024);
      assert.deepEqual(march.dayNumber, 31);
      const april = new Month(4, 2024);
      assert.deepEqual(april.dayNumber, 30);
    });
  });
});
