import { Day } from "./Day";

const MAX_DAYS_BY_MONTH = new Map<number, number>([
  [1, 31],
  [3, 31],
  [4, 30],
  [5, 31],
  [6, 30],
  [7, 31],
  [8, 31],
  [9, 30],
  [10, 31],
  [11, 30],
  [12, 31],
]);

export class Month {
  constructor(
    public readonly month: number,
    public readonly year: number,
  ) {}

  get reportName() {
    return `Relevé ${this.name}`;
  }

  get name() {
    return `${this.month.toString().padStart(2, "0")}/${this.year}`;
  }

  get days() {
    const days = new Array(this.getMaximumDay());
    return days.fill(0).map((_, i) => {
      return new Day(this, i + 1);
    });
  }

  get minusAYear() {
    return new Month(this.month, this.year - 1);
  }

  private getMaximumDay() {
    if (MAX_DAYS_BY_MONTH.has(this.month)) {
      return MAX_DAYS_BY_MONTH.get(this.month);
    }
    if (
      (this.year % 4 === 0 && this.year % 100 !== 0) ||
      this.year % 400 === 0
    ) {
      return 29;
    }
    return 28;
  }
}
