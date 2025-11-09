import { JWT } from "google-auth-library";
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";
import { DailyReport } from "../../DailyReport";
import { Day } from "../../Day";
import { ElectricityConsumption } from "../../ElectricityConsumption";
import { Month } from "../../Month";
import { MonthlyReport } from "../../MonthlyReport";
import { ProducedSolarEnergy } from "../../ProducedSolarEnergy";
import { SoldSolarEnergy } from "../../SoldSolarEnergy";
import { BasePrices } from "../BasePrices/BasePricesFinder";
import { MonthlyReportRepository } from "./MonthlyReportRepository";
import { RowBuilder } from "./RowBuilder";

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
  constructor(day: Day) {
    super(`Row for daily report of "${day.name}"`);
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

const HEADER_ROW_INDEX = 1;

const ORANGE = { red: 1, green: 0.5, blue: 0 };
const LIGHT_BLUE = { red: 0.68, green: 0.84, blue: 0.95 };
const LIGHT_YELLOW = { red: 252 / 255, green: 243 / 255, blue: 207 / 255 };
const LABEL_BACKGROUND = LIGHT_BLUE;
const TAB_COLOR = ORANGE;
const FILLED_DAY_BACKGROUND = LIGHT_YELLOW;

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

  async create(report: MonthlyReport, basePricesList: BasePrices[]) {
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

    const basePricesA1Mapping = await this.addBasePricesList(
      sheet,
      report,
      basePricesList,
    );

    await this.setHeaderRowStyle(sheet);

    let rowIndex = HEADER_ROW_INDEX + 1;
    for (const dailyReport of report.dailyReports) {
      await sheet.addRow(
        this.rowBuilder.buildRow(
          dailyReport,
          rowIndex,
          // TODO: for simplicity, we use the first one on all rows, even if that's wrong
          // but to fill 0, that's fine.
          basePricesA1Mapping[0].a1,
        ),
      );
      rowIndex++;
    }
    await this.addTotalRow(sheet, report, HEADER_ROW_INDEX + 1);
  }

  private async setHeaderRowStyle(sheet: GoogleSpreadsheetWorksheet) {
    const endColumnIndex = this.rowBuilder.getHeaders().length - 1;
    await sheet.loadCells({
      startRowIndex: HEADER_ROW_INDEX - 1,
      endRowIndex: HEADER_ROW_INDEX,
    });
    for (let columIndex = 0; columIndex <= endColumnIndex; columIndex++) {
      const cell = sheet.getCell(HEADER_ROW_INDEX - 1, columIndex);
      cell.textFormat = { bold: true };
      cell.backgroundColor = LABEL_BACKGROUND;
    }
    await sheet.saveUpdatedCells();
  }

  private async loadSheet(day: Day) {
    const doc = await this.loadDocument();
    const reportName = day.month.reportName;

    if (!doc.sheetsByTitle[reportName]) {
      throw new MonthlyReportNotFound(reportName);
    }
    return doc.sheetsByTitle[reportName];
  }

  private async findRow(sheet: GoogleSpreadsheetWorksheet, day: Day) {
    await sheet.loadHeaderRow(HEADER_ROW_INDEX);
    const rows = await sheet.getRows();

    const row = rows.find((row) => {
      return row.get("Date") === day.name;
    });

    if (!row) {
      throw new DailyReportRowNotFound(day);
    }
    return row;
  }

  public async findDailyReport(day: Day) {
    const sheet = await this.loadSheet(day);
    const row = await this.findRow(sheet, day);
    // TODO: names of headers are also in RowBuilder, this should be centralized somehow
    return new DailyReport(
      day,
      row.get("HC Référence")
        ? new ElectricityConsumption(
            Number(row.get("HC Référence")),
            Number(row.get("HP Référence")),
          )
        : new ElectricityConsumption(
            Number(row.get("HC an-1")),
            Number(row.get("HP an-1")),
          ),
      new ElectricityConsumption(
        Number(row.get("HC an-1")),
        Number(row.get("HP an-1")),
      ),
      new ElectricityConsumption(Number(row.get("HC")), Number(row.get("HP"))),
      new ProducedSolarEnergy(Number(row.get("Production PV"))),
      new SoldSolarEnergy(Number(row.get("Qté vendue"))),
    );
  }

  async store(
    dailyReport: DailyReport,
    basePrices: { month: BasePrices[]; day: BasePrices },
  ): Promise<void> {
    const sheet = await this.loadSheet(dailyReport.day);
    const row = await this.findRow(sheet, dailyReport.day);
    const basePricesA1Mapping = await this.findBasePricesA1Mapping(
      basePrices,
      dailyReport.day,
    );
    row.assign(
      this.rowBuilder.buildRow(
        dailyReport,
        row.rowNumber,
        basePricesA1Mapping.a1,
      ),
    );
    await row.save();
    await sheet.loadCells({ startRowIndex: row.rowNumber - 1 });
    sheet.getCell(row.rowNumber - 1, 0).backgroundColor = FILLED_DAY_BACKGROUND;
    await sheet.saveUpdatedCells();
  }

  private async findBasePricesA1Mapping(
    basePrices: { month: BasePrices[]; day: BasePrices },
    day: Day,
  ) {
    const month = day.month;
    const label = basePrices.day.label;
    const monthMapping = this.buildBasePricesA1Mapping(month, basePrices.month);

    return (
      monthMapping.find((mapping) => {
        return mapping.basePrices.label === label;
      }) || monthMapping[0]
    );
  }

  private async addBasePricesList(
    sheet: GoogleSpreadsheetWorksheet,
    report: MonthlyReport,
    basePricesList: BasePrices[],
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

    const basePricesA1Mapping = this.buildBasePricesA1Mapping(
      report.month,
      basePricesList,
    );
    for (const mapping of basePricesA1Mapping) {
      await sheet.loadCells(Object.values(mapping.a1));
    }
    for (const mapping of basePricesA1Mapping) {
      fillLabelCell(mapping.a1.label, mapping.basePrices.label);
      fillLabelCell(mapping.a1.offPeakHoursLabel, "Prix HC/kwh");
      fillValueCell(mapping.a1.offPeakHours, mapping.basePrices.offPeakHours);
      fillLabelCell(mapping.a1.peakHoursLabel, "Prix HP/kwh");
      fillValueCell(mapping.a1.peakHours, mapping.basePrices.peakHours);
      fillLabelCell(mapping.a1.solarLabel, "Prix revente/kwh");
      fillValueCell(mapping.a1.solar, mapping.basePrices.solar);
    }
    await sheet.saveUpdatedCells();

    return basePricesA1Mapping;
  }

  private buildBasePricesA1Mapping(month: Month, basePricesList: BasePrices[]) {
    const days = month.dayNumber;
    // days + header + total + empty line + 1-based index
    let index = days + 1 + 1 + 1 + 1;
    return basePricesList.map((basePrices) => {
      const a1 = {
        offPeakHoursLabel: `A${index}`,
        offPeakHours: `B${index}`,
        peakHoursLabel: `C${index}`,
        peakHours: `D${index}`,
        solarLabel: `E${index}`,
        solar: `F${index}`,
        label: `G${index}`,
      };
      index++;
      return { a1, basePrices };
    });
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
