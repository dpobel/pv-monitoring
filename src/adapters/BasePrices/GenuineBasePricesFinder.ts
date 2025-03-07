import { Day } from "../../Day";
import { Month } from "../../Month";
import { BasePricesFinder } from "./BasePricesFinder";

const before20250201 = {
  label: "Avant le 1er février 2025",
  offPeakHours: 0.204,
  peakHours: 0.2672,
  solar: 0.1269,
};

const between20250201and20250314 = {
  label: "Entre le 1er février 2025 et le 14 mars 2025",
  offPeakHours: 0.2192,
  peakHours: 0.2825,
  solar: 0.1269,
};

const after20250314 = {
  label: "Après le 14 mars 2025",
  offPeakHours: 0.1727,
  peakHours: 0.2124,
  solar: 0.1269,
};

export class GenuineBasePricesFinder implements BasePricesFinder {
  findForMonth(month: Month) {
    const march2025 = new Month(3, 2025);
    if (month.isEqual(march2025)) {
      return [between20250201and20250314, after20250314];
    }
    const february2025 = new Month(2, 2025);
    if (month.isEqual(february2025)) {
      return [between20250201and20250314];
    }
    if (month.isBefore(february2025)) {
      return [before20250201];
    }
    return [after20250314];
  }

  findForDay(day: Day) {
    if (day.isBefore(new Day(new Month(2, 2025), 1))) {
      return before20250201;
    } else if (day.isBefore(new Day(new Month(3, 2025), 14))) {
      return between20250201and20250314;
    } else {
      return after20250314;
    }
  }
}
