import { Month } from "./Month";
import { MonthlyReport } from "./MonthlyReport";

describe("MonthlyReport", () => {
  describe("name", () => {
    it("should return the name of the report", () => {
      const report1 = new MonthlyReport(new Month(1, 2021), []);
      const report2 = new MonthlyReport(new Month(11, 2024), []);

      expect(report1.name).toEqual("Relevé 01/2021");
      expect(report2.name).toEqual("Relevé 11/2024");
    });
  });
});
