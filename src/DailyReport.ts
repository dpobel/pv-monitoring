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

  get reportName() {
    return this.day.month.reportName;
  }
}
