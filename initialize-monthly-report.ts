import "dotenv/config";
import { GoogleSpreadsheetMonthlyReportRepository } from "./src/adapters/MonthlyReport/GoogleSpreadsheetMonthlyReportRepository";
import { InitializeMonthlyReport } from "./src/usecases/InitializeMonthlyReport";
import { RowBuilder } from "./src/adapters/MonthlyReport/RowBuilder";
import { InitializeMonthlyReportCli } from "./src/cli/InitializeMonthlyReport";

const cli = new InitializeMonthlyReportCli(
  new InitializeMonthlyReport(
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
  ),
);

await cli.run();
