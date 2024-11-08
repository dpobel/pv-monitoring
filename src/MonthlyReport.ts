import { Day } from "./Day";
import { Month } from "./Month";

export class ElectricityConsumption {
  constructor(
    public readonly offPeakHours: number,
    public readonly peakHours: number,
  ) {}

  get total() {
    return this.offPeakHours + this.peakHours;
  }
}

export class ProducedSolarEnergy {
  constructor(public readonly production: number) {}
}

export class SoldSolarEnergy {
  constructor(public readonly production: number) {}
}

enum HEADERS {
  DATE = "Date",
  PREVIOUS_YEAR_OFF_PEAK_HOURS = "HC an-1",
  PREVIOUS_YEAR_PEAK_HOURS = "HP an-1",
  PREVIOUS_YEAR_TOTAL = "Total an-1",
  OFF_PEAK_HOURS = "HC",
  PEAK_HOURS = "HP",
  TOTAL = "Total",
  EVOLUTION = "Évolution",
  PRODUCE_SOLAR_ENERGY = "Production PV",
  SOLD_SOLAR_ENERGY = "Qté vendue",
}

export class DailyReport {
  static headers = Object.values(HEADERS);

  constructor(
    public readonly day: Day,
    public readonly previousYearElectricityConsumption: ElectricityConsumption,
    public readonly electricityConsumption: ElectricityConsumption,
    public readonly producedSolarEnergy: ProducedSolarEnergy,
    public readonly soldSolarEnergy: SoldSolarEnergy,
  ) {}

  private get electricityConsumptionEvolution() {
    if (this.previousYearElectricityConsumption.total === 0) {
      return "∞";
    }
    return `${(
      (100 *
        (this.electricityConsumption.total -
          this.previousYearElectricityConsumption.total)) /
      this.previousYearElectricityConsumption.total
    )
      .toFixed(2)
      .replace(".", ",")}%`;
  }

  private get(name: HEADERS): number | string {
    if (name === HEADERS.DATE) {
      return this.day.name;
    }
    if (name === HEADERS.PREVIOUS_YEAR_OFF_PEAK_HOURS) {
      return this.previousYearElectricityConsumption.offPeakHours;
    }
    if (name === HEADERS.PREVIOUS_YEAR_PEAK_HOURS) {
      return this.previousYearElectricityConsumption.peakHours;
    }
    if (name === HEADERS.PREVIOUS_YEAR_TOTAL) {
      return this.previousYearElectricityConsumption.total;
    }
    if (name === HEADERS.OFF_PEAK_HOURS) {
      return this.electricityConsumption.offPeakHours;
    }
    if (name === HEADERS.PEAK_HOURS) {
      return this.electricityConsumption.peakHours;
    }
    if (name === HEADERS.TOTAL) {
      return this.electricityConsumption.total;
    }
    if (name === HEADERS.EVOLUTION) {
      return this.electricityConsumptionEvolution;
    }
    if (name === HEADERS.PRODUCE_SOLAR_ENERGY) {
      return this.producedSolarEnergy.production;
    }
    if (name === HEADERS.SOLD_SOLAR_ENERGY) {
      return this.soldSolarEnergy.production;
    }
    throw new Error(`Unknown header: ${name}`);
  }

  buildRow(): (number | string)[] {
    return [
      this.get(HEADERS.DATE),
      this.get(HEADERS.PREVIOUS_YEAR_OFF_PEAK_HOURS),
      this.get(HEADERS.PREVIOUS_YEAR_PEAK_HOURS),
      this.get(HEADERS.PREVIOUS_YEAR_TOTAL),
      this.get(HEADERS.OFF_PEAK_HOURS),
      this.get(HEADERS.PEAK_HOURS),
      this.get(HEADERS.TOTAL),
      this.get(HEADERS.EVOLUTION),
      this.get(HEADERS.PRODUCE_SOLAR_ENERGY),
      this.get(HEADERS.SOLD_SOLAR_ENERGY),
    ];
  }
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
