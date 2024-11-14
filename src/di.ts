import "dotenv/config";
import { Day } from "./Day";
import { ElectricityConsumption } from "./ElectricityConsumption";
import { Month } from "./Month";
import { SoldSolarEnergy } from "./SoldSolarEnergy";
import { MemoryElectricityConsumptionFetcher } from "./adapters/ElectricityConsumption/MemoryElectricityConsumptionFetcher";
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

const date = new Date();
date.setDate(date.getDate() - 1);
const day = new Day(
  new Month(date.getMonth() + 1, date.getFullYear()),
  date.getDate(),
);

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

const fillDailyReportService = new FillDailyReport(
  new MemoryElectricityConsumptionFetcher(
    new Map([
      [day.minusAYear.name, new ElectricityConsumption(0, 0)],
      [day.name, new ElectricityConsumption(0, 0)],
    ]),
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
};
