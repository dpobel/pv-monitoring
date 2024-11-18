import { TimeSlot } from "./TimeSlot";

export class PeakHoursSchedule {
  constructor(private readonly slots: TimeSlot[]) {}

  isInsidePeakHour(targetSlot: TimeSlot): boolean {
    return this.slots.some((slot) => {
      return slot.contains(targetSlot);
    });
  }
}
