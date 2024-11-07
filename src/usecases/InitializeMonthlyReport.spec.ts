import { MemoryMonthlyReportRepository } from "../adapters/MonthlyReport/MemoryReportRepository";
import { Month } from "../Month";
import {
  InitializeMonthlyReportCommand,
  InitializeMonthlyReport,
} from "./InitializeMonthlyReport";

describe("InitializeMonthlyReportService", () => {
  const monthlyReportRepository = new MemoryMonthlyReportRepository();
  const sut = new InitializeMonthlyReport(monthlyReportRepository);

  it("should initialize a monthly report", async () => {
    const month = new Month(11, 2024);
    await sut.execute(new InitializeMonthlyReportCommand(month));

    expect(monthlyReportRepository.reports).toHaveLength(1);
    const report = monthlyReportRepository.reports[0];

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
      expect(dailyReport.producedSolarEnergy).toEqual({ production: 0 });
      expect(dailyReport.soldSolarEnergy).toEqual({ production: 0 });
    });
  });
});
