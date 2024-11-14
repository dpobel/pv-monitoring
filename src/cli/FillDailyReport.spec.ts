import { Day } from "../Day";
import { Month } from "../Month";
import { NullLogger } from "../adapters/Logger/NullLogger";
import {
  FillDailyReportCommand,
  FillDailyReportInterface,
} from "../usecases/FillDailyReport";
import { FillDailyReportCliCommand } from "./FillDailyReport";

class MockFillDailyReportService implements FillDailyReportInterface {
  public executed = false;
  public day: Day | null = null;

  async execute(command: FillDailyReportCommand) {
    this.executed = true;
    this.day = command.day;
  }
}

describe("FillDailyReportCliCommand", () => {
  describe("run", () => {
    let service: MockFillDailyReportService;
    let sut: FillDailyReportCliCommand;

    beforeEach(() => {
      service = new MockFillDailyReportService();
      sut = new FillDailyReportCliCommand(service, new NullLogger());
    });

    it("should reject options without date", async () => {
      const exitCode = await sut.run({});
      expect(service.executed).toBe(false);
      expect(exitCode).toEqual(100);
    });

    it("should reject options with an invalid date", async () => {
      const exitCode = await sut.run({ date: "2024" });
      expect(service.executed).toBe(false);
      expect(exitCode).toEqual(100);
    });

    it("should run the command for a valid date", async () => {
      const exitCode = await sut.run({ date: "2024-11-14" });
      expect(service.executed).toBe(true);
      expect(service.day).toEqual(new Day(new Month(11, 2024), 14));
      expect(exitCode).toEqual(0);
    });
  });
});
