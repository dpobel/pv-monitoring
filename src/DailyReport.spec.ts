import { DailyReport } from "./DailyReport";
import { Day } from "./Day";
import { ElectricityConsumption } from "./ElectricityConsumption";
import { Month } from "./Month";
import { ProducedSolarEnergy } from "./ProducedSolarEnergy";
import { SoldSolarEnergy } from "./SoldSolarEnergy";

describe("DailyReport", () => {
  describe("electricityConsumptionEvolution", () => {
    it("should compute the evolution", () => {
      const dailyReport = new DailyReport(
        new Day(new Month(1, 2021), 1),
        new ElectricityConsumption(10, 20),
        new ElectricityConsumption(8, 15),
        new ProducedSolarEnergy(4),
        new SoldSolarEnergy(5),
      );

      expect(dailyReport.electricityConsumptionEvolution).toEqual("-23,33%");
    });

    it("should handle a previous year consumption without values", () => {
      const dailyReport = new DailyReport(
        new Day(new Month(2, 2023), 3),
        new ElectricityConsumption(0, 0),
        new ElectricityConsumption(8, 15),
        new ProducedSolarEnergy(4),
        new SoldSolarEnergy(5),
      );

      expect(dailyReport.electricityConsumptionEvolution).toEqual("∞");
    });
  });
});
