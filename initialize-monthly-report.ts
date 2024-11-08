import "dotenv/config";
import { Month } from "./src/Month";
import { GoogleSpreadsheetMonthlyReportRepository } from "./src/adapters/MonthlyReport/GoogleSpreadsheetMonthlyReportRepository";
import {
  InitializeMonthlyReport,
  InitializeMonthlyReportCommand,
} from "./src/usecases/InitializeMonthlyReport";

const service = new InitializeMonthlyReport(
  new GoogleSpreadsheetMonthlyReportRepository({
    credentials: {
      clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
      privateKey: process.env.GOOGLE_PRIVATE_KEY || "",
    },
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || "",
  }),
);
const today = new Date();
await service.execute(
  new InitializeMonthlyReportCommand(
    new Month(today.getMonth() + 1, today.getFullYear()),
  ),
);
