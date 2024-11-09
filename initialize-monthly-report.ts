import "dotenv/config";
import { Month } from "./src/Month";
import { GoogleSpreadsheetMonthlyReportRepository } from "./src/adapters/MonthlyReport/GoogleSpreadsheetMonthlyReportRepository";
import {
  InitializeMonthlyReport,
  InitializeMonthlyReportCommand,
} from "./src/usecases/InitializeMonthlyReport";
import { RowBuilder } from "./src/adapters/MonthlyReport/RowBuilder";

const service = new InitializeMonthlyReport(
  new GoogleSpreadsheetMonthlyReportRepository(
    {
      credentials: {
        clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
        privateKey: process.env.GOOGLE_PRIVATE_KEY || "",
      },
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || "",
    },
    new RowBuilder(),
  ),
);
const today = new Date();
await service.execute(
  new InitializeMonthlyReportCommand(
    new Month(today.getMonth() + 1, today.getFullYear()),
  ),
);
