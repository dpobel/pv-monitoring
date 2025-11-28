import { BasePricesFinder } from "../adapters/BasePrices/BasePricesFinder";
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
    private readonly basePricesFinder: BasePricesFinder,
  ) {}

  async execute(command: FillDailyReportCommand) {
    const dailyReport = new DailyReport(
      command.day,
      await this.fetchReferenceYearElectricityConsumption(command.day),
      await this.electricityConsumptionFetcher.fetch(command.day.minusAYear),
      await this.electricityConsumptionFetcher.fetch(command.day),
      await this.producedSolarEnergyFetcher.fetch(command.day),
      await this.soldSolarEnergyFetcher.fetch(command.day),
    );
    this.monthlyReportRepository.store(dailyReport, {
      month: this.basePricesFinder.findForMonth(command.day.month),
      day: this.basePricesFinder.findForDay(command.day),
    });
  }

  private async fetchReferenceYearElectricityConsumption(day: Day) {
    const previousYearDay = day.minusAYear;
    const dailyReport =
      await this.monthlyReportRepository.findDailyReport(previousYearDay);
    return dailyReport.referenceYearElectricityConsumption;
  }
}
