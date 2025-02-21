import { DailyReport } from "./DailyReport";
import { ElectricityConsumption } from "./ElectricityConsumption";
import { Month } from "./Month";
import { ProducedSolarEnergy } from "./ProducedSolarEnergy";
import { SoldSolarEnergy } from "./SoldSolarEnergy";

export class InconsistentMonthlyReportError extends Error {
  constructor(
    public readonly month: Month,
    public readonly dailyReports: DailyReport[],
  ) {
    super(
      `Inconsistent monthly report: number of daily report does not match the number of days in the month (${month.name} has ${month.dayNumber} days, but ${dailyReports.length} daily reports were provided)`,
    );
  }
}

export class MonthlyReport {
  constructor(
    public readonly month: Month,
    public readonly dailyReports: DailyReport[],
  ) {
    if (month.dayNumber !== dailyReports.length) {
      throw new InconsistentMonthlyReportError(month, dailyReports);
    }
  }

  get name() {
    return this.month.reportName;
  }

  get countDailyReports() {
    return this.dailyReports.length;
  }

  static fromMonth(month: Month) {
    const dayReports = month.days.map((day) => {
      return new DailyReport(
        day,
        new ElectricityConsumption(0, 0),
        new ElectricityConsumption(0, 0),
        new ProducedSolarEnergy(0),
        new SoldSolarEnergy(0),
      );
    });
    return new MonthlyReport(month, dayReports);
  }
}
