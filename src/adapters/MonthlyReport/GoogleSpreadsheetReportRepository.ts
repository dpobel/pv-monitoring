import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { DailyReport, MonthlyReport } from "../../MonthlyReport";
import { MonthlyReportRepository } from "./MonthlyReportRepository";

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
  constructor(private readonly config: GoogleSpreadsheetConfig) {
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
      headerValues: DailyReport.headers,
    });

    for (const dailyReport of report.dailyReports) {
      await sheet.addRow(dailyReport.buildRow());
    }
  }
}
