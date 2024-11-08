import { DailyReport } from "../../DailyReport";
import { MonthlyReport } from "../../MonthlyReport";

const HEADERS = [
  "Date",
  "HC an-1",
  "HP an-1",
  "Total an-1",
  "HC",
  "HP",
  "Total",
  "Évolution",
  "Production PV",
  "Qté vendue",
];

type Row = {
  Date: string;
  "HC an-1": number;
  "HP an-1": number;
  "Total an-1": number;
  HC: number;
  HP: number;
  Total: number;
  Évolution: string;
  "Production PV": number;
  "Qté vendue": number;
};

type TotalRow = {
  Date: string;
  "HC an-1": string;
  "HP an-1": string;
  "Total an-1": string;
  HC: string;
  HP: string;
  Total: string;
  Évolution: string;
  "Production PV": string;
  "Qté vendue": string;
};

export class RowBuilder {
  getHeaders() {
    return HEADERS;
  }

  buildRow(dailyReport: DailyReport): Row {
    return {
      Date: dailyReport.day.name,
      "HC an-1": dailyReport.previousYearElectricityConsumption.offPeakHours,
      "HP an-1": dailyReport.previousYearElectricityConsumption.peakHours,
      "Total an-1": dailyReport.previousYearElectricityConsumption.total,
      HC: dailyReport.electricityConsumption.offPeakHours,
      HP: dailyReport.electricityConsumption.peakHours,
      Total: dailyReport.electricityConsumption.total,
      Évolution: dailyReport.electricityConsumptionEvolution,
      "Production PV": dailyReport.producedSolarEnergy.quantity,
      "Qté vendue": dailyReport.soldSolarEnergy.quantity,
    };
  }

  buildTotalRow(report: MonthlyReport): TotalRow {
    const latestRowValueIndex = report.countDailyReports + 1;
    const totalRowValueIndex = latestRowValueIndex + 1;

    return {
      Date: "Total",
      "HC an-1": `=SUM(B2:B${latestRowValueIndex})`,
      "HP an-1": `=SUM(C2:C${latestRowValueIndex})`,
      "Total an-1": `=SUM(D2:D${latestRowValueIndex})`,
      HC: `=SUM(E2:E${latestRowValueIndex})`,
      HP: `=SUM(F2:F${latestRowValueIndex})`,
      Total: `=SUM(G2:G${latestRowValueIndex})`,
      Évolution: `=TO_PERCENT((G${totalRowValueIndex} - D${totalRowValueIndex})/D${totalRowValueIndex})`,
      "Production PV": `=SUM(I2:I${latestRowValueIndex})`,
      "Qté vendue": `=SUM(J2:J${latestRowValueIndex})`,
    };
  }
}
