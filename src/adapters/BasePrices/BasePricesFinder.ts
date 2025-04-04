import { Day } from "../../Day";
import { Month } from "../../Month";

export type BasePrices = {
  label: string;
  offPeakHours: number;
  peakHours: number;
  solar: number;
};

export interface BasePricesFinder {
  findForMonth(month: Month): BasePrices[];

  findForDay(day: Day): BasePrices;
}
