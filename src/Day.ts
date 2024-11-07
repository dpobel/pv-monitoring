import { Month } from "./Month";

export class Day {
  constructor(
    private readonly month: Month,
    private readonly day: number,
  ) {}
}
