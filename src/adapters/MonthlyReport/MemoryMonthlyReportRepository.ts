import { MonthlyReport } from "../../MonthlyReport";
import { MonthlyReportRepository } from "./MonthlyReportRepository";

export class MemoryMonthlyReportRepository implements MonthlyReportRepository {
  public readonly reports: MonthlyReport[] = [];

  async create(report: MonthlyReport) {
    this.reports.push(report);
  }
}
