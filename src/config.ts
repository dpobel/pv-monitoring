import { PeakHoursSchedule } from "./PeakHoursSchedule";
import { Time } from "./Time";
import { TimeSlot } from "./TimeSlot";

export const peakHoursSchedule = new PeakHoursSchedule([
  new TimeSlot(new Time(7, 30, 0), new Time(23, 30, 0)),
]);
