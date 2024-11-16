import { DailyReport } from "../../DailyReport";
import { MonthlyReport } from "../../MonthlyReport";

const HEADERS = {
  Date: "A",
  "HC an-1": "B",
  "HP an-1": "C",
  "Total an-1": "D",
  "Prix an-1": "E",
  HC: "F",
  HP: "G",
  Total: "H",
  Prix: "I",
  Évolution: "J",
  "Production PV": "K",
  "Qté vendue": "L",
  "Gain vente": "M",
};

type Formula = string;

type Row = {
  Date: string;
  "HC an-1": number;
  "HP an-1": number;
  "Total an-1": Formula;
  "Prix an-1": Formula;
  HC: number;
  HP: number;
  Total: Formula;
  Prix: Formula;
  Évolution: Formula;
  "Production PV": number;
  "Qté vendue": number;
  "Gain vente": Formula;
};

type TotalRow = {
  Date: string;
  "HC an-1": Formula;
  "HP an-1": Formula;
  "Total an-1": Formula;
  "Prix an-1": Formula;
  HC: Formula;
  HP: Formula;
  Total: Formula;
  Prix: Formula;
  Évolution: Formula;
  "Production PV": Formula;
  "Qté vendue": Formula;
  "Gain vente": Formula;
};

type RowName =
  | "Date"
  | "HC an-1"
  | "HP an-1"
  | "Total an-1"
  | "Prix an-1"
  | "HC"
  | "HP"
  | "Total"
  | "Prix"
  | "Évolution"
  | "Production PV"
  | "Qté vendue"
  | "Gain vente";

export class RowBuilder {
  getHeaders() {
    return Object.keys(HEADERS);
  }

  private getA1Notation(rowName: RowName, rowIndex: number) {
    return `${HEADERS[rowName]}${rowIndex}`;
  }

  buildRow(
    dailyReport: DailyReport,
    rowIndex: number,
    basePricesA1Mapping: {
      offPeakHours: string;
      peakHours: string;
      solar: string;
    },
  ): Row {
    return {
      Date: dailyReport.day.name,
      "HC an-1": dailyReport.previousYearElectricityConsumption.offPeakHours,
      "HP an-1": dailyReport.previousYearElectricityConsumption.peakHours,
      "Total an-1": `=${this.getA1Notation(
        "HC an-1",
        rowIndex,
      )}+${this.getA1Notation("HP an-1", rowIndex)}`,
      "Prix an-1": `=ROUND(${this.getA1Notation("HC an-1", rowIndex)}*${
        basePricesA1Mapping.offPeakHours
      }/1000+${this.getA1Notation("HP an-1", rowIndex)}*${
        basePricesA1Mapping.peakHours
      }/1000;2)`,
      HC: dailyReport.electricityConsumption.offPeakHours,
      HP: dailyReport.electricityConsumption.peakHours,
      Total: `=${this.getA1Notation("HC", rowIndex)}+${this.getA1Notation(
        "HP",
        rowIndex,
      )}`,
      Prix: `=ROUND(${this.getA1Notation("HC", rowIndex)}*${
        basePricesA1Mapping.offPeakHours
      }/1000+${this.getA1Notation("HP", rowIndex)}*${
        basePricesA1Mapping.peakHours
      }/1000; 2)`,
      Évolution: this.getEvolutionFormula("Total an-1", "Total", rowIndex),
      "Production PV": dailyReport.producedSolarEnergy.quantity,
      "Qté vendue": dailyReport.soldSolarEnergy.quantity,
      "Gain vente": `=ROUND(${this.getA1Notation("Qté vendue", rowIndex)}*${
        basePricesA1Mapping.solar
      }/1000;2)`,
    };
  }

  private getSumColumnFormula(
    rowName: RowName,
    firstRowValueIndex: number,
    latestRowValueIndex: number,
  ): Formula {
    return `=SUM(${this.getA1Notation(
      rowName,
      firstRowValueIndex,
    )}:${this.getA1Notation(rowName, latestRowValueIndex)})`;
  }

  private getEvolutionFormula(
    baseName: RowName,
    valueName: RowName,
    valueIndex: number,
  ): Formula {
    return `=IF(${this.getA1Notation(
      baseName,
      valueIndex,
    )}; TO_PERCENT((${this.getA1Notation(
      valueName,
      valueIndex,
    )}-${this.getA1Notation(baseName, valueIndex)})/${this.getA1Notation(
      baseName,
      valueIndex,
    )}); "N/A")`;
  }

  buildTotalRow(report: MonthlyReport, firstRowValueIndex: number): TotalRow {
    const latestRowValueIndex =
      report.countDailyReports + firstRowValueIndex - 1;
    const totalRowValueIndex = latestRowValueIndex + 1;

    return {
      Date: "Total",
      "HC an-1": this.getSumColumnFormula(
        "HC an-1",
        firstRowValueIndex,
        latestRowValueIndex,
      ),
      "HP an-1": this.getSumColumnFormula(
        "HP an-1",
        firstRowValueIndex,
        latestRowValueIndex,
      ),
      "Total an-1": this.getSumColumnFormula(
        "Total an-1",
        firstRowValueIndex,
        latestRowValueIndex,
      ),
      "Prix an-1": this.getSumColumnFormula(
        "Prix an-1",
        firstRowValueIndex,
        latestRowValueIndex,
      ),
      HC: this.getSumColumnFormula(
        "HC",
        firstRowValueIndex,
        latestRowValueIndex,
      ),
      HP: this.getSumColumnFormula(
        "HP",
        firstRowValueIndex,
        latestRowValueIndex,
      ),
      Total: this.getSumColumnFormula(
        "Total",
        firstRowValueIndex,
        latestRowValueIndex,
      ),
      Prix: this.getSumColumnFormula(
        "Prix",
        firstRowValueIndex,
        latestRowValueIndex,
      ),
      Évolution: this.getEvolutionFormula(
        "Total an-1",
        "Total",
        totalRowValueIndex,
      ),
      "Production PV": this.getSumColumnFormula(
        "Production PV",
        firstRowValueIndex,
        latestRowValueIndex,
      ),
      "Qté vendue": this.getSumColumnFormula(
        "Qté vendue",
        firstRowValueIndex,
        latestRowValueIndex,
      ),
      "Gain vente": this.getSumColumnFormula(
        "Gain vente",
        firstRowValueIndex,
        latestRowValueIndex,
      ),
    };
  }
}
