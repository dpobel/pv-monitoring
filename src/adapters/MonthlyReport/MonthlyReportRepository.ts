import { DailyReport } from "../../DailyReport";
import { MonthlyReport } from "../../MonthlyReport";
import { BasePrices } from "../BasePrices/BasePricesFinder";

export interface MonthlyReportRepository {
  create(report: MonthlyReport, basePricesList: BasePrices[]): Promise<void>;

  store(dailyReport: DailyReport, basePrices: BasePrices): Promise<void>;
}
