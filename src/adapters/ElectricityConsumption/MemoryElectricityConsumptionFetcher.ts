import { Day } from "../../Day";
import { ElectricityConsumption } from "../../ElectricityConsumption";

export class MemoryElectricityConsumptionFetcher {
  constructor(
    private readonly electricityConsumptionMap: Map<
      string,
      ElectricityConsumption
    >,
  ) {}

  async fetch(day: Day): Promise<ElectricityConsumption> {
    if (!this.electricityConsumptionMap.has(day.name)) {
      return new ElectricityConsumption(0, 0);
    }
    return this.electricityConsumptionMap.get(day.name)!;
  }
}
