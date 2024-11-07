import { MemoryMonthlyReportRepository } from "./src/adapters/MonthlyReport/MemoryReportRepository";
import { Month } from "./src/Month";
import {
  InitializeMonthlyReportCommand,
  InitializeMonthlyReport,
} from "./src/usecases/InitializeMonthlyReport";

const service = new InitializeMonthlyReport(
  new MemoryMonthlyReportRepository(),
);
const today = new Date();
await service.execute(
  new InitializeMonthlyReportCommand(
    new Month(today.getMonth() + 1, today.getFullYear()),
  ),
);
