import { Day } from "../Day";
import { Month } from "../Month";
import {
  FillDailyReportCommand,
  FillDailyReportInterface,
} from "../usecases/FillDailyReport";
import { FillYesterdayReportCliCommand } from "./FillYesterdayReport";

class MockFillDailyReportService implements FillDailyReportInterface {
  public executed = false;
  public day: Day | null = null;

  async execute(command: FillDailyReportCommand) {
    this.executed = true;
    this.day = command.day;
  }
}

describe("FillYesterdayReportCliCommand", () => {
  describe("run", () => {
    let service: MockFillDailyReportService;
    let sut: FillYesterdayReportCliCommand;

    beforeEach(() => {
      service = new MockFillDailyReportService();
      sut = new FillYesterdayReportCliCommand(service);
    });

    it("should run the command for yesterday", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const exitCode = await sut.run();
      expect(service.executed).toBe(true);
      expect(service.day).toEqual(
        new Day(
          new Month(yesterday.getMonth() + 1, yesterday.getFullYear()),
          yesterday.getDate(),
        ),
      );
      expect(exitCode).toEqual(0);
    });
  });
});
