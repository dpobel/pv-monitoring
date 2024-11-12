import { DailyReport } from "../../DailyReport";
import { MonthlyReport } from "../../MonthlyReport";
import { BasePrices, MonthlyReportRepository } from "./MonthlyReportRepository";

export class MemoryMonthlyReportRepository implements MonthlyReportRepository {
  public readonly createData: {
    report: MonthlyReport;
    basePrices: BasePrices;
  }[] = [];

  public readonly dailyReports: DailyReport[] = [];

  async create(report: MonthlyReport, basePrices: BasePrices) {
    this.createData.push({ report, basePrices });
  }

  async store(dailyReport: DailyReport) {
    this.dailyReports.push(dailyReport);
  }
}
