import { ElectricityConsumptionFetcher } from "../adapters/ElectricityConsumption/ElectricityConsumptionFetcher";
import { MonthlyReportRepository } from "../adapters/MonthlyReport/MonthlyReportRepository";
import { ProducedSolarEnergyFetcher } from "../adapters/ProducedSolarEnergy/ProducedSolarEnergyFetcher";
import { SoldSolarEnergyFetcher } from "../adapters/SoldSolarEnergy/SoldSolarEnergyFetcher";
import { DailyReport } from "../DailyReport";
import { Day } from "../Day";

export class FillDailyReportCommand {
  constructor(public readonly day: Day) {}
}

export interface FillDailyReportInterface {
  execute(command: FillDailyReportCommand): Promise<void>;
}

export class FillDailyReport implements FillDailyReportInterface {
  constructor(
    private readonly electricityConsumptionFetcher: ElectricityConsumptionFetcher,
    private readonly producedSolarEnergyFetcher: ProducedSolarEnergyFetcher,
    private readonly soldSolarEnergyFetcher: SoldSolarEnergyFetcher,
    private readonly monthlyReportRepository: MonthlyReportRepository,
  ) {}

  async execute(command: FillDailyReportCommand) {
    const dailyReport = new DailyReport(
      command.day,
      await this.electricityConsumptionFetcher.fetch(command.day.minusAYear),
      await this.electricityConsumptionFetcher.fetch(command.day),
      await this.producedSolarEnergyFetcher.fetch(command.day),
      await this.soldSolarEnergyFetcher.fetch(command.day),
    );
    this.monthlyReportRepository.store(dailyReport);
  }
}
