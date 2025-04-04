import { DailyReport } from "../../DailyReport";
import { MonthlyReport } from "../../MonthlyReport";
import { BasePrices } from "../BasePrices/BasePricesFinder";
import { MonthlyReportRepository } from "./MonthlyReportRepository";

export class MemoryMonthlyReportRepository implements MonthlyReportRepository {
  public readonly createData: {
    report: MonthlyReport;
    basePricesList: BasePrices[];
  }[] = [];

  public readonly dailyReports: {
    dailyReport: DailyReport;
    basePrices: { month: BasePrices[]; day: BasePrices };
  }[] = [];

  async create(report: MonthlyReport, basePricesList: BasePrices[]) {
    this.createData.push({ report, basePricesList });
  }

  async store(
    dailyReport: DailyReport,
    basePrices: { month: BasePrices[]; day: BasePrices },
  ) {
    this.dailyReports.push({ dailyReport, basePrices });
  }
}
