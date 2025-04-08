import { createHash } from "node:crypto";
import { Day } from "../../Day";
import { ProducedSolarEnergy } from "../../ProducedSolarEnergy";
import { Logger } from "../Logger/Logger";
import { ProducedSolarEnergyFetcher } from "./ProducedSolarEnergyFetcher";

const USER_AGENT = "Please provide a publicly available API";

export class FailToGenerateToken extends Error {
  constructor(error: Error | unknown) {
    super(
      `Fail to generate token: ${
        error instanceof Error ? error.message : JSON.stringify(error)
      }`,
      { cause: error },
    );
  }
}

export class FailToRetrieveProducedSolarEnergy extends Error {
  constructor(day: Day, error: Error | unknown) {
    super(
      `Failed to retrieve production for ${day.name}: ${
        error instanceof Error ? error.message : JSON.stringify(error)
      }`,
    );
  }
}

class FailureResponse extends Error {
  constructor(
    message: string,
    public readonly data: unknown,
  ) {
    super(message);
  }
}

export class HoymilesWebAPIProducedSolarEnergyFetcher
  implements ProducedSolarEnergyFetcher
{
  constructor(
    private readonly config: {
      username: string;
      password: string;
      plantId: string;
    },
    private readonly logger: Logger,
  ) {}

  private hashPassword(password: string) {
    const hash = createHash("sha256");
    hash.update(password);

    return hash.digest("base64");
  }

  private async generateToken() {
    try {
      this.logger.info(`Generating a token for ${this.config.username}`);
      const response = await fetch(
        "https://neapi.hoymiles.com/iam/pub/0/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
          },
          body: JSON.stringify({
            password: `${this.hashPassword(this.config.password)}`,
            user_name: this.config.username,
          }),
        },
      );
      const data = (await response.json()) as {
        status: string;
        message: string;
        data: { token: string };
      };
      if (data.status !== "0") {
        throw new FailureResponse(data.message, data);
      }

      return data.data.token;
    } catch (error) {
      throw new FailToGenerateToken(error);
    }
  }

  async fetch(day: Day): Promise<ProducedSolarEnergy> {
    const token = await this.generateToken();
    try {
      const query = {
        sid_list: [this.config.plantId],
        mode: 1,
        start_date: day.YYYYMMDD,
        end_date: day.YYYYMMDD,
      };
      this.logger.info(`Fetching production for ${day.name}`, query);
      const response = await fetch(
        "https://neapi.hoymiles.com/pvm-report/api/0/station/report/count_eq_by_station",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
            Authorization: token,
          },
          body: JSON.stringify(query),
        },
      );
      const data = (await response.json()) as {
        status: string;
        message: string;
        data: {
          total_pv_eq: string;
          total_consumption_eq: string;
        };
      };
      this.logger.info("Received production data", data);
      if (data.status !== "0") {
        throw new FailureResponse(data.message, data);
      }
      return new ProducedSolarEnergy(Number(data.data.total_pv_eq) * 1000);
    } catch (error) {
      throw new FailToRetrieveProducedSolarEnergy(day, error);
    }
  }
}
