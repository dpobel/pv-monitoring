import { Month } from "../Month";
import {
  InitializeMonthlyReportCommand,
  InitializeMonthlyReportInterface,
} from "../usecases/InitializeMonthlyReport";
import { CliCommand } from "./CliCommand";

export class InitializeMonthlyReportCliCommand implements CliCommand {
  readonly name = "initialize-monthly-report";

  constructor(private readonly service: InitializeMonthlyReportInterface) {}

  async run() {
    const today = new Date();

    await this.service.execute(
      new InitializeMonthlyReportCommand(
        new Month(today.getMonth() + 1, today.getFullYear()),
        { offPeakHours: 0.204, peakHours: 0.2672, solar: 0.1276 },
      ),
    );
    return 0;
  }
}
