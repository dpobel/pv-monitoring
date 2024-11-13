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
    // biome-ignore lint/style/noNonNullAssertion: test code
    return this.electricityConsumptionMap.get(day.name)!;
  }
}
