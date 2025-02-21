import { Month } from "../Month";
import { MonthlyReport } from "../MonthlyReport";
import { MonthlyReportRepository } from "../adapters/MonthlyReport/MonthlyReportRepository";
import { BasePrices } from "./types";

export class InitializeMonthlyReportCommand {
  constructor(
    public readonly month: Month,
    public readonly prices: BasePrices,
  ) {}
}

export interface InitializeMonthlyReportInterface {
  execute(command: InitializeMonthlyReportCommand): Promise<void>;
}

export class InitializeMonthlyReport
  implements InitializeMonthlyReportInterface
{
  constructor(
    private readonly monthlyReportRepository: MonthlyReportRepository,
  ) {}

  async execute(command: InitializeMonthlyReportCommand) {
    await this.monthlyReportRepository.create(
      MonthlyReport.fromMonth(command.month),
      command.prices,
    );
  }
}
