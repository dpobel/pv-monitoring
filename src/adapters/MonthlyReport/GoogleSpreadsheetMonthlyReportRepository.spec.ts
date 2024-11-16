import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { DailyReport } from "../../DailyReport";
import { Day } from "../../Day";
import { ElectricityConsumption } from "../../ElectricityConsumption";
import { Month } from "../../Month";
import { MonthlyReport } from "../../MonthlyReport";
import { ProducedSolarEnergy } from "../../ProducedSolarEnergy";
import { SoldSolarEnergy } from "../../SoldSolarEnergy";
import { GoogleSpreadsheetMonthlyReportRepository } from "./GoogleSpreadsheetMonthlyReportRepository";
import { RowBuilder } from "./RowBuilder";

describe("GoogleSpreadsheetReportRepository", () => {
  const config = {
    spreadsheetId: process.env.TEST_GOOGLE_SPREADSHEET_ID || "",
    credentials: {
      clientEmail: process.env.TEST_GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
      privateKey: process.env.TEST_GOOGLE_PRIVATE_KEY || "",
    },
  };
  const sut = new GoogleSpreadsheetMonthlyReportRepository(
    config,
    new RowBuilder(),
  );
  const doc = new GoogleSpreadsheet(
    config.spreadsheetId,
    new JWT({
      email: config.credentials.clientEmail,
      key: config.credentials.privateKey,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
      ],
    }),
  );

  afterEach(async () => {
    doc.resetLocalCache();
    await doc.loadInfo();
    for (const sheet of doc.sheetsByIndex) {
      if (sheet.title.match(/^Relevé/)) {
        await doc.deleteSheet(sheet.sheetId);
      }
    }
  });

  describe("store", () => {
    const month = new Month(11, 2024);

    beforeEach(async () => {
      doc.resetLocalCache();
      await doc.loadInfo();
      const templateSheet = doc.sheetsByTitle["template store test"];
      await templateSheet.duplicate({ title: month.reportName });
    });

    it("should store the daily report", async () => {
      await sut.store(
        new DailyReport(
          new Day(month, 2),
          new ElectricityConsumption(2, 9),
          new ElectricityConsumption(3, 4),
          new ProducedSolarEnergy(13),
          new SoldSolarEnergy(17),
        ),
      );
      doc.resetLocalCache();
      await doc.loadInfo();
      const sheet = doc.sheetsByTitle[month.reportName];
      const csvStream = await sheet.downloadAsCSV();
      const lines = csvStream.toString().split("\n");
      expect(lines[0].trim()).toEqual(
        'Prix HC/kwh,"0,1",Prix HP/kwh,"0,2",Prix revente/kwh,"0,3",,,,,,,',
      );
      expect(lines[1].trim()).toEqual(",,,,,,,,,,,,");
      expect(lines[2].trim()).toEqual(
        "Date,HC an-1,HP an-1,Total an-1,Prix an-1,HC,HP,Total,Prix,Évolution,Production PV,Qté vendue,Gain vente",
      );
      expect(lines[3].trim()).toEqual("01/11/2024,0,0,0,0,0,0,0,0,N/A,0,0,0");
      expect(lines[4].trim()).toEqual(
        '02/11/2024,2,9,11,"0,002",3,4,7,"0,0011",-36%,13,17,"0,0051"',
      );
      expect(lines[5].trim()).toEqual("03/11/2024,0,0,0,0,0,0,0,0,N/A,0,0,0");
      expect(lines[6].trim()).toEqual(
        'Total,2,9,11,"0,002",3,4,7,"0,0011",-36%,13,17,"0,0051"',
      );
    }, 20000);
  });

  describe("create", () => {
    it("should add a worksheet with the report data", async () => {
      const month = new Month(11, 2024);
      const dailyReports = [
        new DailyReport(
          new Day(month, 1),
          new ElectricityConsumption(2, 9),
          new ElectricityConsumption(3, 4),
          new ProducedSolarEnergy(13),
          new SoldSolarEnergy(17),
        ),
        new DailyReport(
          new Day(month, 2),
          new ElectricityConsumption(10, 10),
          new ElectricityConsumption(10, 10),
          new ProducedSolarEnergy(0),
          new SoldSolarEnergy(0),
        ),
      ];
      const report = new MonthlyReport(month, dailyReports);
      await sut.create(report, {
        offPeakHours: 0.1,
        peakHours: 0.2,
        solar: 0.3,
      });
      await doc.loadInfo();
      const sheet = doc.sheetsByTitle[report.name];
      expect(sheet).toBeDefined();
      const csvStream = await sheet.downloadAsCSV();
      const lines = csvStream.toString().split("\n");
      expect(lines.length).toEqual(dailyReports.length + 4);
      expect(lines[0].trim()).toEqual(
        'Prix HC/kwh,"0,1",Prix HP/kwh,"0,2",Prix revente/kwh,"0,3",,,,,,,',
      );
      expect(lines[1].trim()).toEqual(",,,,,,,,,,,,");
      expect(lines[2].trim()).toEqual(
        "Date,HC an-1,HP an-1,Total an-1,Prix an-1,HC,HP,Total,Prix,Évolution,Production PV,Qté vendue,Gain vente",
      );
      expect(lines[3].trim()).toEqual(
        '01/11/2024,2,9,11,"0,002",3,4,7,"0,0011",-36%,13,17,"0,0051"',
      );
      expect(lines[4].trim()).toEqual(
        '02/11/2024,10,10,20,"0,003",10,10,20,"0,003",0%,0,0,0',
      );
      expect(lines[5].trim()).toEqual(
        'Total,12,19,31,"0,005",13,14,27,"0,0041",-13%,13,17,"0,0051"',
      );
    }, 20000);
  });
});
