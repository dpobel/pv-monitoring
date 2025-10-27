import { APIError, Session as LinkyClient } from "linky";
import { Day } from "../../Day";
import { SoldSolarEnergy } from "../../SoldSolarEnergy";
import { Logger } from "../Logger/Logger";
import { SoldSolarEnergyFetcher } from "./SoldSolarEnergyFetcher";

export class FailToFetchSoldSolarEnergy extends Error {
  public readonly responseMessage: unknown;
  public readonly responseError: unknown;

  constructor(day: Day, error: Error) {
    super(`Fail to fetch sold solar energy for ${day}: ${error.message}`, {
      cause: error,
    });
    if (error instanceof APIError) {
      this.responseMessage = error.response.message;
      this.responseError = error.response.error;
    }
  }
}

export class BokubLinkySoldSolarEnergyFetcher
  implements SoldSolarEnergyFetcher
{
  constructor(
    private readonly linkyClient: LinkyClient,
    private readonly logger: Logger,
  ) {}

  async fetch(day: Day): Promise<SoldSolarEnergy> {
    try {
      const response = await this.linkyClient.getDailyProduction(
        day.YYYYMMDD,
        day.tomorrow.YYYYMMDD,
      );
      this.logger.info(
        `Fetched electricity production for ${day}, received`,
        response,
      );
      return new SoldSolarEnergy(Number(response.interval_reading[0].value));
    } catch (error) {
      throw new FailToFetchSoldSolarEnergy(day, error as Error);
    }
  }
}
