import { JWT } from "google-auth-library";
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";
import { MonthlyReport } from "../../MonthlyReport";
import { BasePrices, MonthlyReportRepository } from "./MonthlyReportRepository";
import { RowBuilder } from "./RowBuilder";
import { DailyReport } from "../../DailyReport";

class MonthlyReportAlreadyExists extends Error {
  constructor(report: MonthlyReport) {
    super(`Report "${report.name}" has already been created`);
  }
}

class MonthlyReportNotFound extends Error {
  constructor(reportName: string) {
    super(`Report "${reportName}" not found`);
  }
}

class DailyReportRowNotFound extends Error {
  constructor(dailyReport: DailyReport) {
    super(`Row for daily report of "${dailyReport.day.name}"`);
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

const HEADER_ROW_INDEX = 3;

const ORANGE = { red: 1, green: 0.5, blue: 0 };
const LIGHT_BLUE = { red: 0.68, green: 0.84, blue: 0.95 };
const LABEL_BACKGROUND = LIGHT_BLUE;
const TAB_COLOR = ORANGE;

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
    const sheet = await doc.addSheet({
      title: report.name,
      index: 0,
      headerValues: this.rowBuilder.getHeaders(),
      headerRowIndex: HEADER_ROW_INDEX,
      tabColor: TAB_COLOR,
    });

    const basePricesA1Mapping = await this.addBasePrices(sheet, basePrices);

    let rowIndex = HEADER_ROW_INDEX + 1;
    for (const dailyReport of report.dailyReports) {
      await sheet.addRow(
        this.rowBuilder.buildRow(dailyReport, rowIndex, basePricesA1Mapping),
      );
      rowIndex++;
    }
    await this.addTotalRow(sheet, report, HEADER_ROW_INDEX + 1);
  }

  private async findRow(dailyReport: DailyReport) {
    const doc = await this.loadDocument();
    const reportName = dailyReport.reportName;

    if (!doc.sheetsByTitle[reportName]) {
      throw new MonthlyReportNotFound(reportName);
    }
    const sheet = doc.sheetsByTitle[reportName];
    await sheet.loadHeaderRow(HEADER_ROW_INDEX);
    const rows = await sheet.getRows();

    return rows.find((row) => {
      return row.get("Date") === dailyReport.day.name;
    });
  }

  async store(dailyReport: DailyReport): Promise<void> {
    const row = await this.findRow(dailyReport);
    if (!row) {
      throw new DailyReportRowNotFound(dailyReport);
    }
    const basePricesA1Mapping = this.getBasePricesA1Mapping();
    row.assign(
      this.rowBuilder.buildRow(dailyReport, row.rowNumber, basePricesA1Mapping),
    );
    await row.save();
  }

  private async addBasePrices(
    sheet: GoogleSpreadsheetWorksheet,
    basePrices: BasePrices,
  ) {
    const fillLabelCell = (a1: string, label: string) => {
      const cell = sheet.getCellByA1(a1);
      cell.backgroundColor = LABEL_BACKGROUND;
      cell.textFormat = {
        bold: true,
      };
      cell.value = label;
    };
    const fillValueCell = (a1: string, value: number) => {
      const cell = sheet.getCellByA1(a1);
      cell.numberValue = value;
    };

    const basePricesA1Mapping = this.getBasePricesA1Mapping();
    await sheet.loadCells(Object.values(basePricesA1Mapping));
    fillLabelCell(basePricesA1Mapping.offPeakHoursLabel, "Prix HC/kwh");
    fillValueCell(basePricesA1Mapping.offPeakHours, basePrices.offPeakHours);
    fillLabelCell(basePricesA1Mapping.peakHoursLabel, "Prix HP/kwh");
    fillValueCell(basePricesA1Mapping.peakHours, basePrices.peakHours);
    fillLabelCell(basePricesA1Mapping.solarLabel, "Prix revente/kwh");
    fillValueCell(basePricesA1Mapping.solar, basePrices.solar);
    await sheet.saveUpdatedCells();

    return basePricesA1Mapping;
  }

  private getBasePricesA1Mapping() {
    return {
      offPeakHoursLabel: "A1",
      offPeakHours: "B1",
      peakHoursLabel: "C1",
      peakHours: "D1",
      solarLabel: "E1",
      solar: "F1",
    };
  }

  private async addTotalRow(
    sheet: GoogleSpreadsheetWorksheet,
    report: MonthlyReport,
    firstRowValueIndex: number,
  ) {
    const totalRowData = this.rowBuilder.buildTotalRow(
      report,
      firstRowValueIndex,
    );
    const row = await sheet.addRow(totalRowData);
    await sheet.loadCells(row.a1Range);
    for (
      let columnIndex = 0;
      columnIndex < Object.keys(totalRowData).length;
      columnIndex++
    ) {
      const cell = sheet.getCell(row.rowNumber - 1, columnIndex);
      if (columnIndex === 0) {
        cell.backgroundColor = LABEL_BACKGROUND;
      }
      cell.textFormat = {
        bold: true,
      };
    }
    await sheet.saveUpdatedCells();
  }
}
