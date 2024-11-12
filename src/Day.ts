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
    return `${this.month.year}-${this.month.month}-${this.day}`;
  }

  get minusAYear() {
    // TODO leap year ?
    return new Day(this.month.minusAYear, this.day);
  }
}
