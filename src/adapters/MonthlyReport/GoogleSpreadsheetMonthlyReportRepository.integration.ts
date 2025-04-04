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
      const basePrices = {
        month: [
          {
            label: "Test base prices 2",
            offPeakHours: 0.01,
            peakHours: 0.02,
            solar: 0.03,
          },
          {
            label: "Test base prices",
            offPeakHours: 0.1,
            peakHours: 0.2,
            solar: 0.3,
          },
        ],
        day: {
          label: "Test base prices",
          offPeakHours: 0.1,
          peakHours: 0.2,
          solar: 0.3,
        },
      };

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
          basePrices,
        );
        doc.resetLocalCache();
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle[month.reportName];
        const csvStream = await sheet.downloadAsCSV();
        const lines = csvStream.toString().split("\n");
        assert.equal(
          lines[0].trim(),
          "Date,HC an-1,HP an-1,Total an-1,Prix an-1,HC,HP,Total,Prix,Évolution,Économie,Production PV,Qté vendue,Gain vente,Gain total,Autocons.,Total cons.,Comp. an-1",
        );
        assert.equal(
          lines[1].trim(),
          "01/11/2024,0,0,0,0,0,0,0,0,N/A,0,0,0,0,0,N/A,0,N/A",
        );
        assert.equal(
          lines[2].trim(),
          '02/11/2024,2222,9999,12221,"2,22",3333,4444,7777,"1,22",-36%,1,1313,1717,"0,52","1,52",-31%,7373,-40%',
        );
        for (let i = 3; i <= month.dayNumber; i++) {
          assert.equal(
            lines[i].trim(),
            `${i.toString().padStart(2, "0")}/11/2024,0,0,0,0,0,0,0,0,N/A,0,0,0,0,0,N/A,0,N/A`,
          );
        }
        assert.equal(
          lines[month.dayNumber + 1].trim(),
          'Total,2222,9999,12221,"2,22",3333,4444,7777,"1,22",-36%,1,1313,1717,"0,52","1,52",-31%,7373,-40%',
        );
        assert.equal(lines[month.dayNumber + 2].trim(), ",,,,,,,,,,,,,,,,,");
        assert.equal(
          lines[month.dayNumber + 3].trim(),
          'Prix HC/kwh,"0,01",Prix HP/kwh,"0,02",Prix revente/kwh,"0,03",Test base prices 2,,,,,,,,,,,',
        );
        assert.equal(
          lines[month.dayNumber + 4].trim(),
          'Prix HC/kwh,"0,1",Prix HP/kwh,"0,2",Prix revente/kwh,"0,3",Test base prices,,,,,,,,,,,',
        );
      });
    });

    describe("create", () => {
      it("should add a worksheet with the report data", async () => {
        const month = new Month(11, 2024);

        const report = MonthlyReport.fromMonth(month);
        report.dailyReports[0] = new DailyReport(
          new Day(month, 1),
          new ElectricityConsumption(2372, 9700),
          new ElectricityConsumption(3020, 4230),
          new ProducedSolarEnergy(8289),
          new SoldSolarEnergy(7289),
        );
        report.dailyReports[1] = new DailyReport(
          new Day(month, 2),
          new ElectricityConsumption(10000, 10000),
          new ElectricityConsumption(10000, 10000),
          new ProducedSolarEnergy(0),
          new SoldSolarEnergy(0),
        );
        await sut.create(report, [
          {
            label: "Test base prices",
            offPeakHours: 0.1,
            peakHours: 0.2,
            solar: 0.3,
          },
          {
            label: "Test base prices 2",
            offPeakHours: 0.01,
            peakHours: 0.02,
            solar: 0.03,
          },
        ]);
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle[report.name];
        const csvStream = await sheet.downloadAsCSV();
        const lines = csvStream.toString().split("\n");
        assert.equal(lines.length, report.month.dayNumber + 5);
        assert.equal(
          lines[0].trim(),
          "Date,HC an-1,HP an-1,Total an-1,Prix an-1,HC,HP,Total,Prix,Évolution,Économie,Production PV,Qté vendue,Gain vente,Gain total,Autocons.,Total cons.,Comp. an-1",
        );
        assert.equal(
          lines[1].trim(),
          '01/11/2024,2372,9700,12072,"2,18",3020,4230,7250,"1,15",-40%,"1,03",8289,7289,"2,19","3,22",12%,8250,-32%',
        );
        assert.equal(
          lines[2].trim(),
          "02/11/2024,10000,10000,20000,3,10000,10000,20000,3,0%,0,0,0,0,0,N/A,20000,0%",
        );
        for (let i = 3; i <= report.month.dayNumber; i++) {
          assert.equal(
            lines[i].trim(),
            `${i.toString().padStart(2, "0")}/11/2024,0,0,0,0,0,0,0,0,N/A,0,0,0,0,0,N/A,0,N/A`,
          );
        }
        assert.equal(
          lines[report.month.dayNumber + 1].trim(),
          'Total,12372,19700,32072,"5,18",13020,14230,27250,"4,15",-15%,"1,03",8289,7289,"2,19","3,22",12%,28250,-12%',
        );
        assert.equal(
          lines[report.month.dayNumber + 2].trim(),
          ",,,,,,,,,,,,,,,,,",
        );
        assert.equal(
          lines[report.month.dayNumber + 3].trim(),
          'Prix HC/kwh,"0,1",Prix HP/kwh,"0,2",Prix revente/kwh,"0,3",Test base prices,,,,,,,,,,,',
        );
        assert.equal(
          lines[report.month.dayNumber + 4].trim(),
          'Prix HC/kwh,"0,01",Prix HP/kwh,"0,02",Prix revente/kwh,"0,03",Test base prices 2,,,,,,,,,,,',
        );
      });
    });
  },
);
