import { Month } from "../Month";
import {
  InitializeMonthlyReportCommand,
  InitializeMonthlyReportInterface,
} from "../usecases/InitializeMonthlyReport";

export class InitializeMonthlyReportCli {
  constructor(private readonly service: InitializeMonthlyReportInterface) {}

  async run() {
    const today = new Date();

    await this.service.execute(
      new InitializeMonthlyReportCommand(
        new Month(today.getMonth() + 1, today.getFullYear()),
        { offPeakHours: 0.204, peakHours: 0.2672, solar: 0.1276 },
      ),
    );
  }
}
