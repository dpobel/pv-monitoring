import { Day } from "./Day";
import { ElectricityConsumption } from "./ElectricityConsumption";
import { ProducedSolarEnergy } from "./ProducedSolarEnergy";
import { SoldSolarEnergy } from "./SoldSolarEnergy";

export class DailyReport {
  constructor(
    public readonly day: Day,
    public readonly previousYearElectricityConsumption: ElectricityConsumption,
    public readonly electricityConsumption: ElectricityConsumption,
    public readonly producedSolarEnergy: ProducedSolarEnergy,
    public readonly soldSolarEnergy: SoldSolarEnergy,
  ) {}

  public get electricityConsumptionEvolution() {
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
}
