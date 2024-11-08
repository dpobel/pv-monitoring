import { DailyReport } from "./DailyReport";
import { Day } from "./Day";
import { ElectricityConsumption } from "./ElectricityConsumption";
import { Month } from "./Month";
import { ProducedSolarEnergy } from "./ProducedSolarEnergy";
import { SoldSolarEnergy } from "./SoldSolarEnergy";

describe("DailyReport", () => {
  describe("buildRow", () => {
    it("should return a row", () => {
      const dailyReport = new DailyReport(
        new Day(new Month(1, 2021), 1),
        new ElectricityConsumption(10, 20),
        new ElectricityConsumption(8, 15),
        new ProducedSolarEnergy(4),
        new SoldSolarEnergy(5),
      );

      expect(dailyReport.buildRow()).toEqual([
        "01/01/2021",
        10,
        20,
        30,
        8,
        15,
        23,
        "-23,33%",
        4,
        5,
      ]);
    });

    it("should handle a report without values for previous year consumption", () => {
      const dailyReport = new DailyReport(
        new Day(new Month(2, 2023), 3),
        new ElectricityConsumption(0, 0),
        new ElectricityConsumption(8, 15),
        new ProducedSolarEnergy(4),
        new SoldSolarEnergy(5),
      );

      expect(dailyReport.buildRow()).toEqual([
        "03/02/2023",
        0,
        0,
        0,
        8,
        15,
        23,
        "∞",
        4,
        5,
      ]);
    });
  });
});
