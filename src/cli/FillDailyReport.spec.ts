import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { NullLogger } from "../adapters/Logger/NullLogger";
import { Day } from "../Day";
import { Month } from "../Month";
import {
  FillDailyReportCommand,
  FillDailyReportInterface,
} from "../usecases/FillDailyReport";
import { FillDailyReportCliCommand } from "./FillDailyReport";

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
      assert.equal(service.executed, false);
      assert.equal(exitCode, 100);
    });

    it("should reject options with an invalid date", async () => {
      const exitCode = await sut.run({ date: "2024" });
      assert.equal(service.executed, false);
      assert.equal(exitCode, 100);
    });

    it("should run the command for a valid date", async () => {
      const exitCode = await sut.run({ date: "2024-11-14" });
      assert.ok(service.executed);
      assert.deepEqual(service.day, new Day(new Month(11, 2024), 14));
      assert.equal(exitCode, 0);
    });

    it("should handle errors", async () => {
      service.shouldThrow = true;

      const exitCode = await sut.run({ date: "2024-11-14" });
      assert.equal(exitCode, 101);
    });
  });
});
