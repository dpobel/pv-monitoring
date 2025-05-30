import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import nock from "nock";
import { Day } from "../../Day";
import { Month } from "../../Month";
import { ProducedSolarEnergy } from "../../ProducedSolarEnergy";
import { NullLogger } from "../Logger/NullLogger";
import {
  FailToGenerateToken,
  FailToRetrieveProducedSolarEnergy,
  HoymilesWebAPIProducedSolarEnergyFetcher,
} from "./HoymilesWebAPIProducedSolarEnergyFetcher";

describe("HoymilesWebAPIProducedSolarEnergyFetcher", () => {
  const username = "username";
  const password = "password";
  const plantId = "an-id";
  const day = new Day(new Month(11, 2024), 13);
  const sut = new HoymilesWebAPIProducedSolarEnergyFetcher(
    {
      username,
      password,
      plantId,
    },
    new NullLogger(),
  );
  describe("fetch", () => {
    afterEach(() => {
      nock.cleanAll();
    });

    describe("when the authentication fails", () => {
      beforeEach(() => {
        nock("https://neapi.hoymiles.com")
          .post("/iam/pub/0/auth/login")
          .reply(200, {
            status: "1",
            message: "whatever error",
            data: { token: "a-token" },
          });
      });

      it('should throw a "FailToGenerateToken" error', () => {
        assert.rejects(sut.fetch(day), FailToGenerateToken);
      });
    });

    describe("when the authentication succeeds", () => {
      const token = "a-token";

      beforeEach(() => {
        nock("https://neapi.hoymiles.com")
          .post("/iam/pub/0/auth/login")
          .reply(200, {
            status: "0",
            message: "success",
            data: { token },
          });
      });

      describe("when the api returns a produced energy", () => {
        beforeEach(() => {
          nock("https://neapi.hoymiles.com", {
            reqheaders: {
              Authorization: (value) => {
                return value === token;
              },
            },
          })
            .post(
              "/pvm-report/api/0/station/report/count_eq_by_station",
              (query) => {
                return (
                  query.sid_list.join(",") === plantId &&
                  query.start_date === day.YYYYMMDD &&
                  query.end_date === day.YYYYMMDD
                );
              },
            )
            .reply(200, {
              status: "0",
              message: "success",
              data: {
                total_pv_eq: "1234",
                total_consumption_eq: "0",
              },
            });
        });

        it("should return the produced solar energy of the day", async () => {
          const producedSolarEnergy = await sut.fetch(day);

          assert.deepEqual(
            producedSolarEnergy,
            new ProducedSolarEnergy(1234000),
          );
        });
      });

      describe("when the api fails", () => {
        beforeEach(() => {
          nock("https://neapi.hoymiles.com")
            .post("/pvm-report/api/0/station/report/count_eq_by_station")
            .reply(200, {
              status: "1",
              message: "whatever error",
            });
        });

        it("should return the produced solar energy of the day", () => {
          assert.rejects(sut.fetch(day), FailToRetrieveProducedSolarEnergy);
        });
      });
    });
  });
});
