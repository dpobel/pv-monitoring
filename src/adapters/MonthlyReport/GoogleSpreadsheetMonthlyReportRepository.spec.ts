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
          new ElectricityConsumption(2222, 9999),
          new ElectricityConsumption(3333, 4444),
          new ProducedSolarEnergy(1313),
          new SoldSolarEnergy(1717),
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
        '02/11/2024,2222,9999,12221,"2,22",3333,4444,7777,"1,22",-36%,1313,1717,"0,52"',
      );
      expect(lines[5].trim()).toEqual("03/11/2024,0,0,0,0,0,0,0,0,N/A,0,0,0");
      expect(lines[6].trim()).toEqual(
        'Total,2222,9999,12221,"2,22",3333,4444,7777,"1,22",-36%,1313,1717,"0,52"',
      );
    }, 20000);
  });

  describe("create", () => {
    it("should add a worksheet with the report data", async () => {
      const month = new Month(11, 2024);
      const dailyReports = [
        new DailyReport(
          new Day(month, 1),
          new ElectricityConsumption(2372, 9700),
          new ElectricityConsumption(3020, 4230),
          new ProducedSolarEnergy(8289),
          new SoldSolarEnergy(7289),
        ),
        new DailyReport(
          new Day(month, 2),
          new ElectricityConsumption(10000, 10000),
          new ElectricityConsumption(10000, 10000),
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
        '01/11/2024,2372,9700,12072,"2,18",3020,4230,7250,"1,15",-40%,8289,7289,"2,19"',
      );
      expect(lines[4].trim()).toEqual(
        "02/11/2024,10000,10000,20000,3,10000,10000,20000,3,0%,0,0,0",
      );
      expect(lines[5].trim()).toEqual(
        'Total,12372,19700,32072,"5,18",13020,14230,27250,"4,15",-15%,8289,7289,"2,19"',
      );
    }, 20000);
  });
});
