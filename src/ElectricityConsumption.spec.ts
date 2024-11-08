import { ElectricityConsumption } from "./ElectricityConsumption";

describe("ElectricityConsumption", () => {
  describe("total", () => {
    it("should return the sum of off peak and peak hours", () => {
      const electricityConsumption = new ElectricityConsumption(2, 3);
      expect(electricityConsumption.total).toEqual(5);
    });
  });
});
