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

    expect(monthlyReportRepository.createData).toHaveLength(1);
    expect(monthlyReportRepository.createData[0].basePrices).toEqual(
      basePrices,
    );

    const report = monthlyReportRepository.createData[0].report;

    expect(report.month).toEqual(month);
    const monthDays = month.days;
    expect(report.dailyReports).toHaveLength(monthDays.length);
    report.dailyReports.forEach((dailyReport, index) => {
      expect(dailyReport.day).toEqual(monthDays[index]);
      expect(dailyReport.electricityConsumption).toEqual({
        offPeakHours: 0,
        peakHours: 0,
      });
      expect(dailyReport.previousYearElectricityConsumption).toEqual({
        offPeakHours: 0,
        peakHours: 0,
      });
      expect(dailyReport.producedSolarEnergy).toEqual({ quantity: 0 });
      expect(dailyReport.soldSolarEnergy).toEqual({ quantity: 0 });
    });
  });
});
