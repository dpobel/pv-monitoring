import assert from "node:assert";
import { afterEach, describe, it, mock } from "node:test";
import jwt from "jsonwebtoken";
import { Session as LinkyClient } from "linky";
import { Day } from "../../Day";
import { ElectricityConsumption } from "../../ElectricityConsumption";
import { Month } from "../../Month";
import { PeakHoursSchedule } from "../../PeakHoursSchedule";
import { Time } from "../../Time";
import { TimeSlot } from "../../TimeSlot";
import {
  BokubLinkyElectricityConsumptionFetcher,
  FailToFetchElectricityConsumption,
} from "./BokubLinkyElectricityConsumptionFetcher";
import { loadCurveResponseData } from "./fixtures/fixtures";

describe("BokubLinkyElectricityConsumptionFetcher", () => {
  const token = jwt.sign({ sub: ["prm"] }, "secret");
  const client = new LinkyClient(token);
  const sut = new BokubLinkyElectricityConsumptionFetcher(
    client,
    new PeakHoursSchedule([
      new TimeSlot(new Time(7, 30, 0), new Time(23, 30, 0)),
    ]),
  );
  const day = new Day(new Month(11, 2024), 15);

  afterEach(() => {
    mock.reset();
  });

  it("should fetch the consumption of the day", async () => {
    const { mock: functionContext } = mock.method(
      client,
      "getLoadCurve",
      () => {
        return Promise.resolve(loadCurveResponseData);
      },
    );

    const consumption = await sut.fetch(day);
    assert.equal(functionContext.callCount(), 1);
    assert.deepEqual(functionContext.calls[0].arguments, [
      "2024-11-15",
      "2024-11-16",
    ]);
    assert.deepEqual(consumption, new ElectricityConsumption(2830, 4187));
  });

  it("should handle error when fetching the consumption of the day", async () => {
    mock.method(client, "getLoadCurve", () => {
      return Promise.reject(new Error("whatever"));
    });

    assert.rejects(sut.fetch(day), FailToFetchElectricityConsumption);
  });
});
