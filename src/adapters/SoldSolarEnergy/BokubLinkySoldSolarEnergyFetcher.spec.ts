import assert from "node:assert";
import { afterEach, describe, it, mock } from "node:test";
import jwt from "jsonwebtoken";
import { Session as LinkyClient } from "linky";
import { Day } from "../../Day";
import { Month } from "../../Month";
import { SoldSolarEnergy } from "../../SoldSolarEnergy";
import { NullLogger } from "../Logger/NullLogger";
import {
  BokubLinkySoldSolarEnergyFetcher,
  FailToFetchSoldSolarEnergy,
} from "./BokubLinkySoldSolarEnergyFetcher";
import { dailyProduction } from "./fixtures/fixtures";

describe("BokubLinkySoldSolarEnergyFetcher", () => {
  const token = jwt.sign({ sub: ["prm"] }, "secret");
  const client = new LinkyClient(token);
  const sut = new BokubLinkySoldSolarEnergyFetcher(client, new NullLogger());
  const day = new Day(new Month(11, 2024), 24);

  afterEach(() => {
    mock.reset();
  });

  it("should fetch the sold solar energy of the day", async () => {
    const { mock: functionContext } = mock.method(
      client,
      "getDailyProduction",
      () => {
        return Promise.resolve(dailyProduction);
      },
    );

    const consumption = await sut.fetch(day);
    assert.equal(functionContext.callCount(), 1);
    assert.deepEqual(functionContext.calls[0].arguments, [
      "2024-11-24",
      "2024-11-25",
    ]);
    assert.deepEqual(consumption, new SoldSolarEnergy(12873));
  });

  it("should handle error when fetching the sold solar energy of the day", async () => {
    mock.method(client, "getDailyConsumption", () => {
      return Promise.reject(new Error("whatever"));
    });

    assert.rejects(sut.fetch(day), FailToFetchSoldSolarEnergy);
  });
});
