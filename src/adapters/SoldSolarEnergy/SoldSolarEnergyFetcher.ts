import { Day } from "../../Day";
import { SoldSolarEnergy } from "../../SoldSolarEnergy";

export interface SoldSolarEnergyFetcher {
  fetch(day: Day): Promise<SoldSolarEnergy>;
}
