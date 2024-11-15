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

      expect(report1.name).toEqual("Relevé 01/2021");
      expect(report2.name).toEqual("Relevé 11/2024");
    });
  });

  describe("countDailyReports", () => {
    it("should return the number of daily reports", () => {
      const report = new MonthlyReport(new Month(1, 2021), []);
      expect(report.countDailyReports).toEqual(0);

      const report2 = new MonthlyReport(new Month(1, 2021), [
        new DailyReport(
          new Day(new Month(1, 2021), 1),
          new ElectricityConsumption(0, 0),
          new ElectricityConsumption(0, 0),
          new ProducedSolarEnergy(0),
          new SoldSolarEnergy(0),
        ),
      ]);
      expect(report2.countDailyReports).toEqual(1);
    });
  });
});
