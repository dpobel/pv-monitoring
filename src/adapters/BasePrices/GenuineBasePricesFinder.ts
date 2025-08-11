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

const between20250314and20250801 = {
  label: "Après le 14 mars 2025",
  offPeakHours: 0.1727,
  peakHours: 0.2124,
  solar: 0.1269,
};

const between20250801and20250815 = {
  label: "Après le 1er août 2025",
  offPeakHours: 0.1682,
  peakHours: 0.2079,
  solar: 0.1269,
};

const after20250915 = {
  label: "Après le 15 septembre 2025",
  offPeakHours: 0.1637,
  peakHours: 0.2082,
  solar: 0.1269,
};

export class GenuineBasePricesFinder implements BasePricesFinder {
  findForMonth(month: Month) {
    const march2025 = new Month(3, 2025);
    if (month.isEqual(march2025)) {
      return [between20250201and20250314, between20250314and20250801];
    }
    const february2025 = new Month(2, 2025);
    if (month.isEqual(february2025)) {
      return [between20250201and20250314];
    }
    if (month.isBefore(february2025)) {
      return [before20250201];
    }
    const august2025 = new Month(8, 2025);
    if (month.isBefore(august2025)) {
      return [between20250314and20250801];
    }
    if (month.isEqual(august2025)) {
      return [between20250801and20250815];
    }
    const september2025 = new Month(9, 2025);
    if (month.isEqual(september2025)) {
      return [between20250801and20250815, after20250915];
    }
    return [after20250915];
  }

  findForDay(day: Day) {
    if (day.isBefore(new Day(new Month(2, 2025), 1))) {
      return before20250201;
    }
    if (day.isBefore(new Day(new Month(3, 2025), 14))) {
      return between20250201and20250314;
    }
    if (day.isBefore(new Day(new Month(8, 2025), 1))) {
      return between20250314and20250801;
    }
    if (day.isBefore(new Day(new Month(9, 2025), 15))) {
      return between20250801and20250815;
    }
    return after20250915;
  }
}
