import assert from "node:assert";
import { describe, it } from "node:test";
import { DailyReport } from "../DailyReport";
import { Day } from "../Day";
import { ElectricityConsumption } from "../ElectricityConsumption";
import { Month } from "../Month";
import { ProducedSolarEnergy } from "../ProducedSolarEnergy";
import { SoldSolarEnergy } from "../SoldSolarEnergy";
import { TestBasePricesFinder } from "../adapters/BasePrices/TestBasePricesFinder";
import { MemoryElectricityConsumptionFetcher } from "../adapters/ElectricityConsumption/MemoryElectricityConsumptionFetcher";
import { MemoryMonthlyReportRepository } from "../adapters/MonthlyReport/MemoryMonthlyReportRepository";
import { MemoryProducedSolarEnergyFetcher } from "../adapters/ProducedSolarEnergy/MemoryProducedSolarEnergyFetcher";
import { MemorySoldSolarEnergyFetcher } from "../adapters/SoldSolarEnergy/MemorySoldSolarEnergyFetcher";
import { FillDailyReport, FillDailyReportCommand } from "./FillDailyReport";

describe("FillDailyReport", () => {
  const day = new Day(new Month(11, 2024), 11);
  const previousYearDay = day.minusAYear;

  const previousYearConsumption = new ElectricityConsumption(40, 50);
  const consumption = new ElectricityConsumption(60, 70);
  const producedSolarEnergy = new ProducedSolarEnergy(120);
  const soldSolarEnergy = new SoldSolarEnergy(100);

  const repository = new MemoryMonthlyReportRepository();
  const basePricesFinder = new TestBasePricesFinder();
  const sut = new FillDailyReport(
    new MemoryElectricityConsumptionFetcher(
      new Map<string, ElectricityConsumption>([
        [previousYearDay.name, previousYearConsumption],
        [day.name, consumption],
      ]),
    ),
    new MemoryProducedSolarEnergyFetcher(producedSolarEnergy),
    new MemorySoldSolarEnergyFetcher(soldSolarEnergy),
    repository,
    basePricesFinder,
  );

  it("should build and store the daily report", async () => {
    await sut.execute(new FillDailyReportCommand(day));

    assert.equal(repository.dailyReports.length, 1);
    assert.deepEqual(repository.dailyReports[0], {
      dailyReport: new DailyReport(
        day,
        previousYearConsumption,
        consumption,
        producedSolarEnergy,
        soldSolarEnergy,
      ),
      basePrices: {
        month: basePricesFinder.findForMonth(day.month),
        day: basePricesFinder.findForDay(day),
      },
    });
  });
});
