import assert from "node:assert";
import { describe, it } from "node:test";
import { Month } from "./Month";
import { InconsistentMonthlyReportError, MonthlyReport } from "./MonthlyReport";

describe("MonthlyReport", () => {
  describe("constructor", () => {
    it("should throw an error if the number of daily reports does not match the number of days in the month", () => {
      const month = new Month(1, 2021);

      assert.throws(() => {
        new MonthlyReport(month, []);
      }, InconsistentMonthlyReportError);
    });
  });

  describe("fromMonth", () => {
    it("should create a monthly report with daily reports for each day of the month", () => {
      const month = new Month(1, 2021);
      const report = MonthlyReport.fromMonth(month);

      assert.equal(report.countDailyReports, 31);
      assert.equal(report.month, month);
    });
  });

  describe("name", () => {
    it("should return the name of the report", () => {
      const report1 = MonthlyReport.fromMonth(new Month(1, 2021));
      const report2 = MonthlyReport.fromMonth(new Month(11, 2024));

      assert.equal(report1.name, "Relevé 01/2021");
      assert.equal(report2.name, "Relevé 11/2024");
    });
  });

  describe("countDailyReports", () => {
    it("should return the number of daily reports", () => {
      const report = MonthlyReport.fromMonth(new Month(1, 2021));

      assert.equal(report.countDailyReports, 31);
    });
  });
});
