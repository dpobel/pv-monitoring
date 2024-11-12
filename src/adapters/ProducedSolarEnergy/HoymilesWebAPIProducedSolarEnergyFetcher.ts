import { Day } from "../../Day";
import { ProducedSolarEnergy } from "../../ProducedSolarEnergy";
import { ProducedSolarEnergyFetcher } from "./ProducedSolarEnergyFetcher";
import { createHash } from "node:crypto";

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

export class HoymilesWebAPIProducedSolarEnergyFetcher
  implements ProducedSolarEnergyFetcher
{
  constructor(
    private readonly config: {
      username: string;
      password: string;
      plantId: string;
    },
  ) {}

  private hashPassword(password: string) {
    const hash = createHash("sha256");
    hash.update(password);

    return hash.digest("base64");
  }

  private async generateToken() {
    try {
      const response = await fetch(
        "https://global.hoymiles.com/platform/api/gateway/iam/auth_login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
            Cookie: "hm_token_language=en_us",
          },
          body: JSON.stringify({
            body: {
              password: `wtf-hash.${this.hashPassword(this.config.password)}`,
              user_name: this.config.username,
            },
            ERROR_BACK: true,
            LOAD: {
              loading: true,
            },
            WAITING_PROMISE: true,
          }),
        },
      );
      const data = (await response.json()) as {
        status: string;
        message: string;
        data: { token: string };
      };
      if (data.status !== "0") {
        throw new Error(data.message);
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
        WAITING_PROMISE: false,
        body: {
          sid_list: [this.config.plantId],
          mode: 1,
          start_date: day.YYYYMMDD,
          end_date: day.YYYYMMDD,
        },
      };
      const response = await fetch(
        "https://global.hoymiles.com/platform/api/gateway/pvm-report/report_count_eq_by_station",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
            Cookie: `hm_token=${token};hm_token_language=en_us`,
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
      if (data.status !== "0") {
        throw new Error(data.message);
      }
      return new ProducedSolarEnergy(Number(data.data.total_pv_eq) * 1000);
    } catch (error) {
      throw new FailToRetrieveProducedSolarEnergy(day, error);
    }
  }
}
