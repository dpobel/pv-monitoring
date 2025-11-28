import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { NullLogger } from "../adapters/Logger/NullLogger";
import { Month } from "../Month";
import {
  InitializeMonthlyReportCommand,
  InitializeMonthlyReportInterface,
} from "../usecases/InitializeMonthlyReport";
import { InitializeMonthlyReportCliCommand } from "./InitializeMonthlyReport";

class MockInitializeMonthlyReportService
  implements InitializeMonthlyReportInterface
{
  public executed = false;
  public month: Month | null = null;

  public shouldThrow = false;

  async execute(command: InitializeMonthlyReportCommand) {
    this.executed = true;
    this.month = command.month;
    if (this.shouldThrow) {
      throw new Error("boom");
    }
  }
}

describe("InitializeMonthlyReportCliCommand", () => {
  describe("run", () => {
    let service: MockInitializeMonthlyReportService;
    let sut: InitializeMonthlyReportCliCommand;

    beforeEach(() => {
      service = new MockInitializeMonthlyReportService();
      sut = new InitializeMonthlyReportCliCommand(service, new NullLogger());
    });

    it("should run the command for the current month", async () => {
      const today = new Date();
      const exitCode = await sut.run({});
      assert.ok(service.executed);
      assert.deepEqual(
        service.month,
        new Month(today.getMonth() + 1, today.getFullYear()),
      );
      assert.equal(exitCode, 0);
    });

    it("should run the command for the given month", async () => {
      const exitCode = await sut.run({ month: "2024-12" });
      assert.ok(service.executed);
      assert.deepEqual(service.month, new Month(12, 2024));
      assert.equal(exitCode, 0);
    });

    it("should reject when the month is malformed", async () => {
      const exitCode = await sut.run({ month: "whatever" });
      assert.equal(service.executed, false);
      assert.equal(exitCode, 99);
    });

    it("should reject when the month is wrong type", async () => {
      const exitCode = await sut.run({ month: 2024 });
      assert.equal(service.executed, false);
      assert.equal(exitCode, 99);
    });

    it("should handle errors", async () => {
      service.shouldThrow = true;
      const exitCode = await sut.run({});
      assert.equal(exitCode, 98);
    });
  });
});
