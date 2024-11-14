import { Month } from "../Month";
import { NullLogger } from "../adapters/Logger/NullLogger";
import {
  InitializeMonthlyReportCommand,
  InitializeMonthlyReportInterface,
} from "../usecases/InitializeMonthlyReport";
import { BasePrices } from "../usecases/types";
import { InitializeMonthlyReportCliCommand } from "./InitializeMonthlyReport";

class MockInitializeMonthlyReportService
  implements InitializeMonthlyReportInterface
{
  public executed = false;
  public month: Month | null = null;
  public prices: BasePrices | null = null;

  async execute(command: InitializeMonthlyReportCommand) {
    this.executed = true;
    this.month = command.month;
    this.prices = command.prices;
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
      expect(service.executed).toBe(true);
      expect(service.month).toEqual(
        new Month(today.getMonth() + 1, today.getFullYear()),
      );
      expect(service.prices).toEqual({
        offPeakHours: 0.204,
        peakHours: 0.2672,
        solar: 0.1276,
      });
      expect(exitCode).toEqual(0);
    });

    it("should run the command for the given month", async () => {
      const exitCode = await sut.run({ month: "2024-12" });
      expect(service.executed).toBe(true);
      expect(service.month).toEqual(new Month(12, 2024));
      expect(service.prices).toEqual({
        offPeakHours: 0.204,
        peakHours: 0.2672,
        solar: 0.1276,
      });
      expect(exitCode).toEqual(0);
    });

    it("should reject when the month is malformed", async () => {
      const exitCode = await sut.run({ month: "whatever" });
      expect(service.executed).toBe(false);
      expect(exitCode).toEqual(99);
    });

    it("should reject when the month is wrong type", async () => {
      const exitCode = await sut.run({ month: 2024 });
      expect(service.executed).toBe(false);
      expect(exitCode).toEqual(99);
    });
  });
});
