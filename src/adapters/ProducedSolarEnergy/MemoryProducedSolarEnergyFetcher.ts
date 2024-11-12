import { Day } from "../../Day";
import { ProducedSolarEnergy } from "../../ProducedSolarEnergy";
import { ProducedSolarEnergyFetcher } from "./ProducedSolarEnergyFetcher";

export class MemoryProducedSolarEnergyFetcher
  implements ProducedSolarEnergyFetcher
{
  constructor(private readonly producedSolarEnergy: ProducedSolarEnergy) {}

  async fetch(_day: Day): Promise<ProducedSolarEnergy> {
    return this.producedSolarEnergy;
  }
}
