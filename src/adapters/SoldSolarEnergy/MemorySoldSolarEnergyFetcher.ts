import { Day } from "../../Day";
import { SoldSolarEnergy } from "../../SoldSolarEnergy";
import { SoldSolarEnergyFetcher } from "./SoldSolarEnergyFetcher";

export class MemorySoldSolarEnergyFetcher implements SoldSolarEnergyFetcher {
  constructor(public readonly soldSolarEnergy: SoldSolarEnergy) {}

  async fetch(_day: Day): Promise<SoldSolarEnergy> {
    return this.soldSolarEnergy;
  }
}
