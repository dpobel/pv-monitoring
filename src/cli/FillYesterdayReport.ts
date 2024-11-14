import { Logger } from "../adapters/Logger/Logger";
import { Day } from "../Day";
import { Month } from "../Month";
import {
  FillDailyReportCommand,
  FillDailyReportInterface,
} from "../usecases/FillDailyReport";
import { CliCommand } from "./CliCommand";

export class FillYesterdayReportCliCommand implements CliCommand {
  readonly name = "fill-yesterday-report";

  constructor(
    private readonly service: FillDailyReportInterface,
    private readonly logger: Logger,
  ) {}

  async run() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
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
      return 102;
    }
  }
}
