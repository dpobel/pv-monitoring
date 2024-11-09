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
  describe("create", () => {
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
    beforeEach(() => {});

    afterEach(async () => {
      await doc.loadInfo();
      for (const sheet of doc.sheetsByIndex) {
        if (sheet.title.match(/^Relevé/)) {
          await doc.deleteSheet(sheet.sheetId);
        }
      }
    });

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
      await sut.create(report);
      await doc.loadInfo();
      const sheet = doc.sheetsByTitle[report.name];
      expect(sheet).toBeDefined();
      const csvStream = await sheet.downloadAsCSV();
      const lines = csvStream.toString().split("\n");
      expect(lines.length).toEqual(dailyReports.length + 2);
      expect(lines[0].trim()).toEqual(
        "Date,HC an-1,HP an-1,Total an-1,HC,HP,Total,Évolution,Production PV,Qté vendue",
      );
      expect(lines[1].trim()).toEqual("01/11/2024,2,9,11,3,4,7,-36%,13,17");
      expect(lines[2].trim()).toEqual("02/11/2024,10,10,20,10,10,20,0%,0,0");
      expect(lines[3].trim()).toEqual("Total,12,19,31,13,14,27,-13%,13,17");
    }, 20000);
  });
});
