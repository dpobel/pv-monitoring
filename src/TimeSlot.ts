import { Time } from "./Time";

class InvalidTimeSlotEndNotAfterStart extends Error {
  constructor(start: Time, end: Time) {
    super(`Invalid time slot: ${end} is not after ${start}`);
  }
}

export class TimeSlot {
  constructor(
    public readonly start: Time,
    public readonly end: Time,
  ) {
    if (start.isEqualTo(end) || start.isAfter(end)) {
      throw new InvalidTimeSlotEndNotAfterStart(start, end);
    }
  }

  contains(anotherSlot: TimeSlot): boolean {
    return (
      (anotherSlot.start.isAfter(this.start) ||
        anotherSlot.start.isEqualTo(this.start)) &&
      (anotherSlot.end.isBefore(this.end) ||
        anotherSlot.end.isEqualTo(this.end))
    );
  }
}
