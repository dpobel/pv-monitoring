import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
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

describe(
  "GoogleSpreadsheetReportRepository",
  {
    concurrency: false,
    timeout: 40000,
  },
  () => {
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
        assert.equal(
          lines[0].trim(),
          'Prix HC/kwh,"0,1",Prix HP/kwh,"0,2",Prix revente/kwh,"0,3",,,,,,,,,,',
        );
        assert.equal(lines[1].trim(), ",,,,,,,,,,,,,,,");
        assert.equal(
          lines[2].trim(),
          "Date,HC an-1,HP an-1,Total an-1,Prix an-1,HC,HP,Total,Prix,Évolution,Économie,Production PV,Qté vendue,Gain vente,Gain total,Autocons.",
        );
        assert.equal(
          lines[3].trim(),
          "01/11/2024,0,0,0,0,0,0,0,0,N/A,0,0,0,0,0,N/A",
        );
        assert.equal(
          lines[4].trim(),
          '02/11/2024,2222,9999,12221,"2,22",3333,4444,7777,"1,22",-36%,1,1313,1717,"0,52","1,52",-31%',
        );
        assert.equal(
          lines[5].trim(),
          "03/11/2024,0,0,0,0,0,0,0,0,N/A,0,0,0,0,0,N/A",
        );
        assert.equal(
          lines[6].trim(),
          'Total,2222,9999,12221,"2,22",3333,4444,7777,"1,22",-36%,1,1313,1717,"0,52","1,52",-31%',
        );
      });
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
        const csvStream = await sheet.downloadAsCSV();
        const lines = csvStream.toString().split("\n");
        assert.equal(lines.length, dailyReports.length + 4);
        assert.equal(
          lines[0].trim(),
          'Prix HC/kwh,"0,1",Prix HP/kwh,"0,2",Prix revente/kwh,"0,3",,,,,,,,,,',
        );
        assert.equal(lines[1].trim(), ",,,,,,,,,,,,,,,");
        assert.equal(
          lines[2].trim(),
          "Date,HC an-1,HP an-1,Total an-1,Prix an-1,HC,HP,Total,Prix,Évolution,Économie,Production PV,Qté vendue,Gain vente,Gain total,Autocons.",
        );
        assert.equal(
          lines[3].trim(),
          '01/11/2024,2372,9700,12072,"2,18",3020,4230,7250,"1,15",-40%,"1,03",8289,7289,"2,19","3,22",12%',
        );
        assert.equal(
          lines[4].trim(),
          "02/11/2024,10000,10000,20000,3,10000,10000,20000,3,0%,0,0,0,0,0,N/A",
        );
        assert.equal(
          lines[5].trim(),
          'Total,12372,19700,32072,"5,18",13020,14230,27250,"4,15",-15%,"1,03",8289,7289,"2,19","3,22",12%',
        );
      });
    });
  },
);
