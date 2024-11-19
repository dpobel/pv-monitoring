import "dotenv/config";
import { Session } from "linky";
import { PeakHoursSchedule } from "./PeakHoursSchedule";
import { SoldSolarEnergy } from "./SoldSolarEnergy";
import { Time } from "./Time";
import { TimeSlot } from "./TimeSlot";
import { BokubLinkyElectricityConsumptionFetcher } from "./adapters/ElectricityConsumption/BokubLinkyElectricityConsumptionFetcher";
import { ConsoleLogger } from "./adapters/Logger/ConsoleLogger";
import { GoogleSpreadsheetMonthlyReportRepository } from "./adapters/MonthlyReport/GoogleSpreadsheetMonthlyReportRepository";
import { RowBuilder } from "./adapters/MonthlyReport/RowBuilder";
import { HoymilesWebAPIProducedSolarEnergyFetcher } from "./adapters/ProducedSolarEnergy/HoymilesWebAPIProducedSolarEnergyFetcher";
import { MemorySoldSolarEnergyFetcher } from "./adapters/SoldSolarEnergy/MemorySoldSolarEnergyFetcher";
import { FillDailyReportCliCommand } from "./cli/FillDailyReport";
import { FillYesterdayReportCliCommand } from "./cli/FillYesterdayReport";
import { InitializeMonthlyReportCliCommand } from "./cli/InitializeMonthlyReport";
import { FillDailyReport } from "./usecases/FillDailyReport";
import { InitializeMonthlyReport } from "./usecases/InitializeMonthlyReport";

const logger = new ConsoleLogger();

const monthlyReportRepository = new GoogleSpreadsheetMonthlyReportRepository(
  {
    credentials: {
      clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
      privateKey: process.env.GOOGLE_PRIVATE_KEY || "",
    },
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || "",
  },
  new RowBuilder(),
);

const linkyClient = new Session(process.env.CONSO_API_TOKEN || "");
const fillDailyReportService = new FillDailyReport(
  new BokubLinkyElectricityConsumptionFetcher(
    linkyClient,
    new PeakHoursSchedule([
      new TimeSlot(new Time(7, 30, 0), new Time(23, 30, 0)),
    ]),
    logger,
  ),
  new HoymilesWebAPIProducedSolarEnergyFetcher(
    {
      username: process.env.HOYMILES_USERNAME || "",
      password: process.env.HOYMILES_PASSWORD || "",
      plantId: process.env.HOYMILES_PLANT_ID || "",
    },
    logger,
  ),
  new MemorySoldSolarEnergyFetcher(new SoldSolarEnergy(0)),
  monthlyReportRepository,
);

export default {
  InitializeMonthlyReportCliCommand: new InitializeMonthlyReportCliCommand(
    new InitializeMonthlyReport(monthlyReportRepository),
    logger,
  ),
  FillDailyReportCliCommand: new FillDailyReportCliCommand(
    fillDailyReportService,
    logger,
  ),
  FillYesterdayReportCliCommand: new FillYesterdayReportCliCommand(
    fillDailyReportService,
    logger,
  ),
  ConsoleLogger: logger,
};
