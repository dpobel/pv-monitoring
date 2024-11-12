import { Day } from "./Day";
import { Month } from "./Month";

describe("Day", () => {
  describe("name", () => {
    it("should return the name of the day", () => {
      const day1 = new Day(new Month(1, 2024), 1);
      const day2 = new Day(new Month(11, 2024), 12);
      expect(day1.name).toEqual("01/01/2024");
      expect(day2.name).toEqual("12/11/2024");
    });
  });

  describe("YYYYMMDD", () => {
    const day = new Day(new Month(11, 2024), 12);
    expect(day.YYYYMMDD).toEqual("2024-11-12");
  });
});
