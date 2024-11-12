import { Day } from "../../Day";
import { ElectricityConsumption } from "../../ElectricityConsumption";

export interface ElectricityConsumptionFetcher {
  fetch(day: Day): Promise<ElectricityConsumption>;
}
