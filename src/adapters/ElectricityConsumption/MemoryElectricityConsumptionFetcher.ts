import { Day } from "../../Day";
import { ElectricityConsumption } from "../../ElectricityConsumption";
import { ElectricityConsumptionFetcher } from "./ElectricityConsumptionFetcher";

export class MemoryElectricityConsumptionFetcher
  implements ElectricityConsumptionFetcher
{
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
    // biome-ignore lint/style/noNonNullAssertion: test code
    return this.electricityConsumptionMap.get(day.name)!;
  }
}
