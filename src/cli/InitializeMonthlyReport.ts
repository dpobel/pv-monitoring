import { Month } from "../Month";
import { Logger } from "../adapters/Logger/Logger";
import {
  InitializeMonthlyReportCommand,
  InitializeMonthlyReportInterface,
} from "../usecases/InitializeMonthlyReport";
import { CliCommand } from "./CliCommand";

export class InitializeMonthlyReportCliCommand implements CliCommand {
  readonly name = "initialize-monthly-report";

  constructor(
    private readonly service: InitializeMonthlyReportInterface,
    private readonly logger: Logger,
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

    await this.service.execute(
      new InitializeMonthlyReportCommand(month, {
        offPeakHours: 0.204,
        peakHours: 0.2672,
        solar: 0.1276,
      }),
    );
    return 0;
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
