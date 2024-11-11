import { MonthlyReport } from "../../MonthlyReport";
import { BasePrices, MonthlyReportRepository } from "./MonthlyReportRepository";

export class MemoryMonthlyReportRepository implements MonthlyReportRepository {
  public readonly createData: {
    report: MonthlyReport;
    basePrices: BasePrices;
  }[] = [];

  async create(report: MonthlyReport, basePrices: BasePrices) {
    this.createData.push({ report, basePrices });
  }
}
