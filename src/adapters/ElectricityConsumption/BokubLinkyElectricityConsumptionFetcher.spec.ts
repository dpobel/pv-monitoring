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
import { NullLogger } from "../Logger/NullLogger";
import {
  BokubLinkyElectricityConsumptionFetcher,
  FailToFetchElectricityConsumption,
} from "./BokubLinkyElectricityConsumptionFetcher";
import {
  daylightSavingTimeEndLoadCurveReponseData,
  loadCurveResponseData,
  unorderedLoadCurveResponseData,
} from "./fixtures/fixtures";

describe("BokubLinkyElectricityConsumptionFetcher", () => {
  const token = jwt.sign({ sub: ["prm"] }, "secret");
  const client = new LinkyClient(token);
  const sut = new BokubLinkyElectricityConsumptionFetcher(
    client,
    new PeakHoursSchedule([
      new TimeSlot(new Time(7, 30, 0), new Time(23, 30, 0)),
    ]),
    new NullLogger(),
  );

  afterEach(() => {
    mock.reset();
  });

  it("should fetch the consumption of the day", async () => {
    const day = new Day(new Month(11, 2024), 15);
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

  it("should fetch the consumption of the day based on an unordered measure list", async () => {
    const day = new Day(new Month(11, 2024), 15);
    const { mock: functionContext } = mock.method(
      client,
      "getLoadCurve",
      () => {
        return Promise.resolve(unorderedLoadCurveResponseData);
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

  it("should fetch the consumption for a daylight saving time end day", async () => {
    const day = new Day(new Month(10, 2023), 29);
    const { mock: functionContext } = mock.method(
      client,
      "getLoadCurve",
      () => {
        return Promise.resolve(daylightSavingTimeEndLoadCurveReponseData);
      },
    );

    const consumption = await sut.fetch(day);
    assert.equal(functionContext.callCount(), 1);
    assert.deepEqual(functionContext.calls[0].arguments, [
      "2023-10-29",
      "2023-10-30",
    ]);
    assert.deepEqual(consumption, new ElectricityConsumption(12057, 6655));
  });

  it("should handle error when fetching the consumption of the day", async () => {
    const day = new Day(new Month(11, 2024), 15);
    mock.method(client, "getLoadCurve", () => {
      return Promise.reject(new Error("whatever"));
    });

    assert.rejects(sut.fetch(day), FailToFetchElectricityConsumption);
  });
});
