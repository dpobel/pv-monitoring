import { NullLogger } from "../adapters/Logger/NullLogger";
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

  public shouldThrow = false;

  async execute(command: FillDailyReportCommand) {
    this.executed = true;
    this.day = command.day;
    if (this.shouldThrow) {
      throw new Error("boom");
    }
  }
}

describe("FillYesterdayReportCliCommand", () => {
  describe("run", () => {
    let service: MockFillDailyReportService;
    let sut: FillYesterdayReportCliCommand;

    beforeEach(() => {
      service = new MockFillDailyReportService();
      sut = new FillYesterdayReportCliCommand(service, new NullLogger());
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

    it("should handle errors", async () => {
      service.shouldThrow = true;
      const exitCode = await sut.run();
      expect(exitCode).toEqual(102);
    });
  });
});
