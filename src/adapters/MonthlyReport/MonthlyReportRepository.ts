import { MonthlyReport } from "../../MonthlyReport";

export type BasePrices = {
  offPeakHours: number;
  peakHours: number;
  solar: number;
};

export interface MonthlyReportRepository {
  create(report: MonthlyReport, basePrices: BasePrices): Promise<void>;
}
