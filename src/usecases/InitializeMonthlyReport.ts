import { DailyReport } from "../DailyReport";
import { ElectricityConsumption } from "../ElectricityConsumption";
import { Month } from "../Month";
import { MonthlyReport } from "../MonthlyReport";
import { ProducedSolarEnergy } from "../ProducedSolarEnergy";
import { SoldSolarEnergy } from "../SoldSolarEnergy";
import { MonthlyReportRepository } from "../adapters/MonthlyReport/MonthlyReportRepository";

export class InitializeMonthlyReportCommand {
  constructor(public readonly month: Month) {}
}

export class InitializeMonthlyReport {
  constructor(
    private readonly monthlyReportRepository: MonthlyReportRepository,
  ) {}

  async execute(command: InitializeMonthlyReportCommand) {
    const report = this._createMonthlyReport(command.month);
    await this.monthlyReportRepository.create(report);
  }

  private _createMonthlyReport(month: Month) {
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
