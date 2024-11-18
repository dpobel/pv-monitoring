import assert from "node:assert";
import { describe, it } from "node:test";
import { Month } from "../Month";
import { MemoryMonthlyReportRepository } from "../adapters/MonthlyReport/MemoryMonthlyReportRepository";
import {
  InitializeMonthlyReport,
  InitializeMonthlyReportCommand,
} from "./InitializeMonthlyReport";

describe("InitializeMonthlyReportService", () => {
  const monthlyReportRepository = new MemoryMonthlyReportRepository();
  const sut = new InitializeMonthlyReport(monthlyReportRepository);

  it("should initialize a monthly report", async () => {
    const month = new Month(11, 2024);
    const basePrices = {
      offPeakHours: 0.1,
      peakHours: 0.2,
      solar: 0.3,
    };
    await sut.execute(new InitializeMonthlyReportCommand(month, basePrices));

    assert.equal(monthlyReportRepository.createData.length, 1);
    assert.deepEqual(
      monthlyReportRepository.createData[0].basePrices,
      basePrices,
    );

    const report = monthlyReportRepository.createData[0].report;

    assert.deepEqual(report.month, month);

    const monthDays = month.days;
    assert.equal(report.dailyReports.length, monthDays.length);
    report.dailyReports.forEach((dailyReport, index) => {
      assert.deepEqual(dailyReport.day, monthDays[index]);
      assert.deepEqual(dailyReport.electricityConsumption, {
        offPeakHours: 0,
        peakHours: 0,
      });
      assert.deepEqual(dailyReport.previousYearElectricityConsumption, {
        offPeakHours: 0,
        peakHours: 0,
      });
      assert.deepEqual(dailyReport.producedSolarEnergy, { quantity: 0 });
      assert.deepEqual(dailyReport.soldSolarEnergy, { quantity: 0 });
    });
  });
});
