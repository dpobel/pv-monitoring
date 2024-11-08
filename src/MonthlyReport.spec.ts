import { Day } from "./Day";
import { Month } from "./Month";
import {
  DailyReport,
  ElectricityConsumption,
  MonthlyReport,
  ProducedSolarEnergy,
  SoldSolarEnergy,
} from "./MonthlyReport";

describe("MonthlyReport", () => {
  describe("name", () => {
    it("should return the name of the report", () => {
      const report1 = new MonthlyReport(new Month(1, 2021), []);
      const report2 = new MonthlyReport(new Month(11, 2024), []);

      expect(report1.name).toEqual("Relevé 01/2021");
      expect(report2.name).toEqual("Relevé 11/2024");
    });
  });
});

describe("ElectricityConsumption", () => {
  describe("total", () => {
    it("should return the sum of off peak and peak hours", () => {
      const electricityConsumption = new ElectricityConsumption(2, 3);
      expect(electricityConsumption.total).toEqual(5);
    });
  });
});

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
