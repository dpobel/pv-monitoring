import { Day } from "./Day";
import { Month } from "./Month";

export class ElectricityConsumption {
  constructor(
    public readonly offPeakHours: number,
    public readonly peakHours: number,
  ) {}
}

export class ProducedSolarEnergy {
  constructor(public readonly production: number) {}
}

export class SoldSolarEnergy {
  constructor(public readonly production: number) {}
}

export class DailyReport {
  constructor(
    public readonly day: Day,
    public readonly electricityConsumption: ElectricityConsumption,
    public readonly previousYearElectricityConsumption: ElectricityConsumption,
    public readonly producedSolarEnergy: ProducedSolarEnergy,
    public readonly soldSolarEnergy: SoldSolarEnergy,
  ) {}
}

export class MonthlyReport {
  constructor(
    public readonly month: Month,
    public readonly dailyReports: DailyReport[],
  ) {}

  get name() {
    return `Relevé ${this.month.name}`;
  }
}
