import { Month } from "./Month";

export class Day {
  constructor(
    public readonly month: Month,
    private readonly day: number,
  ) {}

  isBefore(other: Day) {
    return (
      this.month.isBefore(other.month) ||
      (this.month.isEqual(other.month) && this.day < other.day)
    );
  }

  get name() {
    return `${this.day.toString().padStart(2, "0")}/${this.month.name}`;
  }

  get YYYYMMDD() {
    return `${this.month.year}-${String(this.month.month).padStart(
      2,
      "0",
    )}-${String(this.day).padStart(2, "0")}`;
  }

  private get isLastOfMonth() {
    return this.day === this.month.dayNumber;
  }

  get tomorrow() {
    if (this.isLastOfMonth) {
      return new Day(this.month.next, 1);
    }
    return new Day(this.month, this.day + 1);
  }

  get minusAYear() {
    // TODO leap year ?
    return new Day(this.month.minusYears(1), this.day); // TODO restore .minusAYear
  }

  toString() {
    return this.name;
  }
}
