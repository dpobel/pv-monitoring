import { JWT } from "google-auth-library";
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";
import { MonthlyReport } from "../../MonthlyReport";
import { BasePrices, MonthlyReportRepository } from "./MonthlyReportRepository";
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

  async create(report: MonthlyReport, basePrices: BasePrices) {
    const doc = await this.loadDocument();

    if (doc.sheetsByTitle[report.name]) {
      throw new MonthlyReportAlreadyExists(report);
    }
    const headerRowIndex = 3;
    const sheet = await doc.addSheet({
      title: report.name,
      index: 0,
      headerValues: this.rowBuilder.getHeaders(),
      headerRowIndex,
    });

    const basePricesA1Mapping = await this.addBasePrices(sheet, basePrices);

    let rowIndex = headerRowIndex + 1;
    for (const dailyReport of report.dailyReports) {
      await sheet.addRow(
        this.rowBuilder.buildRow(dailyReport, rowIndex, basePricesA1Mapping),
      );
      rowIndex++;
    }
    await this.addTotalRow(sheet, report, headerRowIndex + 1);
  }

  private async addBasePrices(
    sheet: GoogleSpreadsheetWorksheet,
    basePrices: BasePrices,
  ) {
    await sheet.loadCells("A1:F1");
    sheet.getCellByA1("A1").value = "Prix HC/kwh";
    sheet.getCellByA1("B1").numberValue = basePrices.offPeakHours;
    sheet.getCellByA1("C1").value = "Prix HP/kwh";
    sheet.getCellByA1("D1").numberValue = basePrices.peakHours;
    sheet.getCellByA1("E1").value = "Prix revente/kwh";
    sheet.getCellByA1("F1").numberValue = basePrices.solar;
    await sheet.saveUpdatedCells();

    return {
      offPeakHours: "B1",
      peakHours: "D1",
      solar: "F1",
    };
  }

  private async addTotalRow(
    sheet: GoogleSpreadsheetWorksheet,
    report: MonthlyReport,
    firstRowValueIndex: number,
  ) {
    await sheet.addRow(
      this.rowBuilder.buildTotalRow(report, firstRowValueIndex),
    );
  }
}
