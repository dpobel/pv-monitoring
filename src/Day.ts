import { Month } from "./Month";

export class Day {
  constructor(
    private readonly month: Month,
    private readonly day: number,
  ) {}

  get name() {
    return `${this.day.toString().padStart(2, "0")}/${this.month.name}`;
  }
}
