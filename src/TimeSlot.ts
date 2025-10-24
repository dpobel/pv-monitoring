import { Time } from "./Time";

class InvalidTimeSlotEndNotAfterStart extends Error {
  constructor(start: Time, end: Time) {
    super(`Invalid time slot: ${end} is not after ${start}`);
  }
}

export class InvalidTimeSlotSameStartAndEnd extends Error {
  constructor(public readonly time: Time) {
    super(`Invalid time slot: start and end time are the same: ${time}`);
  }

  isDayLightSavingTime(): boolean {
    return (
      this.time.isEqualTo(new Time(2, 0, 0)) ||
      this.time.isEqualTo(new Time(2, 30, 0))
    );
  }
}

export class TimeSlot {
  constructor(
    public readonly start: Time,
    public readonly end: Time,
  ) {
    if (start.isEqualTo(end)) {
      throw new InvalidTimeSlotSameStartAndEnd(start);
    }
    if (start.isAfter(end)) {
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
