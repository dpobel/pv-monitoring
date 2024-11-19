import { Month } from "../Month";
import { Logger } from "../adapters/Logger/Logger";
import {
  InitializeMonthlyReportCommand,
  InitializeMonthlyReportInterface,
} from "../usecases/InitializeMonthlyReport";
import { BasePrices } from "../usecases/types";
import { CliCommand } from "./CliCommand";

export class InitializeMonthlyReportCliCommand implements CliCommand {
  readonly name = "initialize-monthly-report";

  constructor(
    private readonly service: InitializeMonthlyReportInterface,
    private readonly logger: Logger,
    private readonly basePrices: BasePrices,
  ) {}

  async run(options: Record<string, unknown>) {
    const monthString = String(options.month || "");
    if (monthString !== "" && !monthString.match(/^\d{4}-\d{2}$/)) {
      this.logger.error(
        `month options "${options.month}" has an invalid format, expected format YYYY-MM`,
      );
      return 99;
    }
    const month = this.getMonth(monthString);

    try {
      await this.service.execute(
        new InitializeMonthlyReportCommand(month, this.basePrices),
      );
      return 0;
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
      return 98;
    }
  }

  private getMonth(monthString: string) {
    if (monthString) {
      const [year, month] = monthString.split("-").map(Number);
      return new Month(month, year);
    }
    const today = new Date();
    return new Month(today.getMonth() + 1, today.getFullYear());
  }
}
