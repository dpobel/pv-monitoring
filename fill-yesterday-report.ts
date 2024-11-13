import "dotenv/config";
import { Day } from "./src/Day";
import { ElectricityConsumption } from "./src/ElectricityConsumption";
import { Month } from "./src/Month";
import { SoldSolarEnergy } from "./src/SoldSolarEnergy";
import { MemoryElectricityConsumptionFetcher } from "./src/adapters/ElectricityConsumption/MemoryElectricityConsumptionFetcher";
import { ConsoleLogger } from "./src/adapters/Logger/ConsoleLogger";
import { GoogleSpreadsheetMonthlyReportRepository } from "./src/adapters/MonthlyReport/GoogleSpreadsheetMonthlyReportRepository";
import { RowBuilder } from "./src/adapters/MonthlyReport/RowBuilder";
import { HoymilesWebAPIProducedSolarEnergyFetcher } from "./src/adapters/ProducedSolarEnergy/HoymilesWebAPIProducedSolarEnergyFetcher";
import { MemorySoldSolarEnergyFetcher } from "./src/adapters/SoldSolarEnergy/MemorySoldSolarEnergyFetcher";
import {
  FillDailyReport,
  FillDailyReportCommand,
} from "./src/usecases/FillDailyReport";

const date = new Date();
date.setDate(date.getDate() - 1);
const day = new Day(
  new Month(date.getMonth() + 1, date.getFullYear()),
  date.getDate(),
);

const service = new FillDailyReport(
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
    new ConsoleLogger(),
  ),
  new MemorySoldSolarEnergyFetcher(new SoldSolarEnergy(0)),
  new GoogleSpreadsheetMonthlyReportRepository(
    {
      credentials: {
        clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
        privateKey: process.env.GOOGLE_PRIVATE_KEY || "",
      },
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || "",
    },
    new RowBuilder(),
  ),
);
await service.execute(new FillDailyReportCommand(day));
