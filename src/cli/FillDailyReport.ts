import { Day } from "../Day";
import { Month } from "../Month";
import { Logger } from "../adapters/Logger/Logger";
import {
  FillDailyReportCommand,
  FillDailyReportInterface,
} from "../usecases/FillDailyReport";
import { CliCommand } from "./CliCommand";

export class FillDailyReportCliCommand implements CliCommand {
  readonly name = "fill-daily-report";

  constructor(
    private readonly service: FillDailyReportInterface,
    private readonly logger: Logger,
  ) {}

  async run(options: Record<string, unknown>) {
    if (
      typeof options.date !== "string" ||
      !options.date.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      this.logger.error(
        "--date is required and must be in the format YYYY-MM-DD",
      );
      return 100;
    }
    const date = new Date(options.date);
    const day = new Day(
      new Month(date.getMonth() + 1, date.getFullYear()),
      date.getDate(),
    );

    try {
      await this.service.execute(new FillDailyReportCommand(day));
      return 0;
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
      return 101;
    }
  }
}
