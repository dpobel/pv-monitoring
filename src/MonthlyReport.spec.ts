import assert from "node:assert";
import { describe, it } from "node:test";
import { DailyReport } from "./DailyReport";
import { Day } from "./Day";
import { ElectricityConsumption } from "./ElectricityConsumption";
import { Month } from "./Month";
import { MonthlyReport } from "./MonthlyReport";
import { ProducedSolarEnergy } from "./ProducedSolarEnergy";
import { SoldSolarEnergy } from "./SoldSolarEnergy";

describe("MonthlyReport", () => {
  describe("name", () => {
    it("should return the name of the report", () => {
      const report1 = new MonthlyReport(new Month(1, 2021), []);
      const report2 = new MonthlyReport(new Month(11, 2024), []);

      assert.equal(report1.name, "Relevé 01/2021");
      assert.equal(report2.name, "Relevé 11/2024");
    });
  });

  describe("countDailyReports", () => {
    it("should return the number of daily reports", () => {
      const report = new MonthlyReport(new Month(1, 2021), []);
      assert.equal(report.countDailyReports, 0);

      const report2 = new MonthlyReport(new Month(1, 2021), [
        new DailyReport(
          new Day(new Month(1, 2021), 1),
          new ElectricityConsumption(0, 0),
          new ElectricityConsumption(0, 0),
          new ProducedSolarEnergy(0),
          new SoldSolarEnergy(0),
        ),
      ]);
      assert.equal(report2.countDailyReports, 1);
    });
  });
});
