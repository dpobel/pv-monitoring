import "dotenv/config";
import { Month } from "./src/Month";
import {
  FillDailyReport,
  FillDailyReportCommand,
} from "./src/usecases/FillDailyReport";
import { Day } from "./src/Day";
import { GoogleSpreadsheetMonthlyReportRepository } from "./src/adapters/MonthlyReport/GoogleSpreadsheetMonthlyReportRepository";
import { RowBuilder } from "./src/adapters/MonthlyReport/RowBuilder";
import { MemoryElectricityConsumptionFetcher } from "./src/adapters/ElectricityConsumption/MemoryElectricityConsumptionFetcher";
import { MemoryProducedSolarEnergyFetcher } from "./src/adapters/ProducedSolarEnergy/MemoryProducedSolarEnergyFetcher";
import { MemorySoldSolarEnergyFetcher } from "./src/adapters/SoldSolarEnergy/MemorySoldSolarEnergyFetcher";
import { ElectricityConsumption } from "./src/ElectricityConsumption";
import { ProducedSolarEnergy } from "./src/ProducedSolarEnergy";
import { SoldSolarEnergy } from "./src/SoldSolarEnergy";

const date = new Date();
date.setDate(date.getDate() - 1);
const day = new Day(
  new Month(date.getMonth() + 1, date.getFullYear()),
  date.getDate(),
);

const service = new FillDailyReport(
  new MemoryElectricityConsumptionFetcher(
    new Map([
      [day.minusAYear.name, new ElectricityConsumption(6000, 5000)],
      [day.name, new ElectricityConsumption(1530, 4000)],
    ]),
  ),
  new MemoryProducedSolarEnergyFetcher(new ProducedSolarEnergy(21000)),
  new MemorySoldSolarEnergyFetcher(new SoldSolarEnergy(5000)),
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
