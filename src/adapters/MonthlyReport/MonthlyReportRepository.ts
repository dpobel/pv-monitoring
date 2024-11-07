import { MonthlyReport } from "../../MonthlyReport";

export interface MonthlyReportRepository {
  create(report: MonthlyReport): Promise<void>;
}
