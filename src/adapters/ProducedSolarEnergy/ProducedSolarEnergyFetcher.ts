import { Day } from "../../Day";
import { ProducedSolarEnergy } from "../../ProducedSolarEnergy";

export interface ProducedSolarEnergyFetcher {
  fetch(day: Day): Promise<ProducedSolarEnergy>;
}
