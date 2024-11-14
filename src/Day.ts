import { Month } from "./Month";

export class Day {
  constructor(
    public readonly month: Month,
    private readonly day: number,
  ) {}

  get name() {
    return `${this.day.toString().padStart(2, "0")}/${this.month.name}`;
  }

  get YYYYMMDD() {
    return `${this.month.year}-${String(this.month.month).padStart(
      2,
      "0",
    )}-${String(this.day).padStart(2, "0")}`;
  }

  get minusAYear() {
    // TODO leap year ?
    return new Day(this.month.minusAYear, this.day);
  }
}
