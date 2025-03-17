import { Month } from "../Month";
import { MonthlyReport } from "../MonthlyReport";
import { BasePricesFinder } from "../adapters/BasePrices/BasePricesFinder";
import { MonthlyReportRepository } from "../adapters/MonthlyReport/MonthlyReportRepository";

export class InitializeMonthlyReportCommand {
  constructor(public readonly month: Month) {}
}

export interface InitializeMonthlyReportInterface {
  execute(command: InitializeMonthlyReportCommand): Promise<void>;
}

export class InitializeMonthlyReport
  implements InitializeMonthlyReportInterface
{
  constructor(
    private readonly monthlyReportRepository: MonthlyReportRepository,
    private readonly basesPricesFinder: BasePricesFinder,
  ) {}

  async execute(command: InitializeMonthlyReportCommand) {
    const pricesList = this.basesPricesFinder.findForMonth(command.month);
    await this.monthlyReportRepository.create(
      MonthlyReport.fromMonth(command.month),
      pricesList,
    );
  }
}
