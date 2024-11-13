import { Day } from "../Day";
import { Month } from "../Month";
import {
  FillDailyReportCommand,
  FillDailyReportInterface,
} from "../usecases/FillDailyReport";

export class FillYesterdayReportCli {
  constructor(private readonly service: FillDailyReportInterface) {}

  async run() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const day = new Day(
      new Month(date.getMonth() + 1, date.getFullYear()),
      date.getDate(),
    );

    await this.service.execute(new FillDailyReportCommand(day));
  }
}
