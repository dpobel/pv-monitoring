import { DailyReport } from "./DailyReport";
import { Month } from "./Month";

export class MonthlyReport {
  constructor(
    public readonly month: Month,
    public readonly dailyReports: DailyReport[],
  ) {}

  get name() {
    return `Relevé ${this.month.name}`;
  }

  get countDailyReports() {
    return this.dailyReports.length;
  }
}
