import { JWT } from "google-auth-library";
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";
import { MonthlyReport } from "../../MonthlyReport";
import { MonthlyReportRepository } from "./MonthlyReportRepository";
import { RowBuilder } from "./RowBuilder";

class MonthlyReportAlreadyExists extends Error {
  constructor(report: MonthlyReport) {
    super(`Report ${report.name} has already been created`);
  }
}

class FailLoadingGoogleSpreadsheet extends Error {
  constructor(spreadsheetId: string, cause: Error) {
    super(`Failed to load Google Spreadsheet with id ${spreadsheetId}`, {
      cause,
    });
  }
}

type GoogleSpreadsheetConfig = {
  spreadsheetId: string;
  credentials: {
    clientEmail: string;
    privateKey: string;
  };
};

class MisconfiguredGoogleSpreadsheet extends Error {
  constructor(field: string) {
    super(`Misconfigured Google Spreadsheet, "${field}" is missing`);
  }
}

export class GoogleSpreadsheetMonthlyReportRepository
  implements MonthlyReportRepository
{
  constructor(
    private readonly config: GoogleSpreadsheetConfig,
    private readonly rowBuilder: RowBuilder,
  ) {
    if (!config.spreadsheetId) {
      throw new MisconfiguredGoogleSpreadsheet("spreadsheetId");
    }
    if (!config.credentials.clientEmail) {
      throw new MisconfiguredGoogleSpreadsheet("clientEmail");
    }
    if (!config.credentials.privateKey) {
      throw new MisconfiguredGoogleSpreadsheet("privateKey");
    }
  }

  private async loadDocument() {
    try {
      const doc = new GoogleSpreadsheet(
        this.config.spreadsheetId,
        new JWT({
          email: this.config.credentials.clientEmail,
          key: this.config.credentials.privateKey,
          scopes: [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
          ],
        }),
      );
      await doc.loadInfo();
      return doc;
    } catch (error) {
      throw new FailLoadingGoogleSpreadsheet(
        this.config.spreadsheetId,
        error as Error,
      );
    }
  }

  async create(report: MonthlyReport) {
    const doc = await this.loadDocument();

    if (doc.sheetsByTitle[report.name]) {
      throw new MonthlyReportAlreadyExists(report);
    }
    const sheet = await doc.addSheet({
      title: report.name,
      index: 0,
      headerValues: this.rowBuilder.getHeaders(),
    });

    for (const dailyReport of report.dailyReports) {
      await sheet.addRow(this.rowBuilder.buildRow(dailyReport));
    }
    await this.addTotalRow(sheet, report);
  }

  private async addTotalRow(
    sheet: GoogleSpreadsheetWorksheet,
    report: MonthlyReport,
  ) {
    await sheet.addRow(this.rowBuilder.buildTotalRow(report));
  }
}
