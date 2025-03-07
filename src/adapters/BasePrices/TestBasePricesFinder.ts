import { Day } from "../../Day";
import { Month } from "../../Month";
import { BasePricesFinder } from "./BasePricesFinder";

const basePrices1 = {
  label: "prices1",
  offPeakHours: 0.1,
  peakHours: 0.2,
  solar: 0.3,
};

const basePrices2 = {
  label: "prices2",
  offPeakHours: 0.4,
  peakHours: 0.5,
  solar: 0.6,
};

export class TestBasePricesFinder implements BasePricesFinder {
  findForMonth(_month: Month) {
    return [basePrices1, basePrices2];
  }

  findForDay(_day: Day) {
    return basePrices1;
  }
}
