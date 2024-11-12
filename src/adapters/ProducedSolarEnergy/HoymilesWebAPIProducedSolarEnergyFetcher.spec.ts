import nock from "nock";
import { Day } from "../../Day";
import { Month } from "../../Month";
import { ProducedSolarEnergy } from "../../ProducedSolarEnergy";
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
  const sut = new HoymilesWebAPIProducedSolarEnergyFetcher({
    username,
    password,
    plantId,
  });
  describe("fetch", () => {
    afterEach(() => {
      nock.cleanAll();
    });

    describe("when the authentication fails", () => {
      beforeEach(() => {
        nock("https://global.hoymiles.com")
          .post("/platform/api/gateway/iam/auth_login")
          .reply(200, {
            status: "1",
            message: "whatever error",
            data: { token: "a-token" },
          });
      });

      it('should throw a "FailToGenerateToken" error', async () => {
        await expect(sut.fetch(day)).rejects.toThrow(FailToGenerateToken);
      });
    });

    describe("when the authentication succeeds", () => {
      const token = "a-token";

      beforeEach(() => {
        nock("https://global.hoymiles.com")
          .post("/platform/api/gateway/iam/auth_login")
          .reply(200, {
            status: "0",
            message: "success",
            data: { token },
          });
      });

      describe("when the api returns a produced energy", () => {
        beforeEach(() => {
          nock("https://global.hoymiles.com", {
            reqheaders: {
              Cookie: (value) => {
                return value.includes(`hm_token=${token}`);
              },
            },
          })
            .post(
              "/platform/api/gateway/pvm-report/report_count_eq_by_station",
              (query) => {
                return (
                  query.body.sid_list.join(",") === plantId &&
                  query.body.start_date === day.YYYYMMDD &&
                  query.body.end_date === day.YYYYMMDD
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

          expect(producedSolarEnergy).toEqual(new ProducedSolarEnergy(1234000));
        });
      });

      describe("when the api fails", () => {
        beforeEach(() => {
          nock("https://global.hoymiles.com")
            .post("/platform/api/gateway/pvm-report/report_count_eq_by_station")
            .reply(200, {
              status: "1",
              message: "whatever error",
            });
        });

        it("should return the produced solar energy of the day", async () => {
          await expect(sut.fetch(day)).rejects.toThrow(
            FailToRetrieveProducedSolarEnergy,
          );
        });
      });
    });
  });
});
