import { PeakHoursSchedule } from "./PeakHoursSchedule";
import { Time } from "./Time";
import { TimeSlot } from "./TimeSlot";
import { BasePrices } from "./usecases/types";

export const peakHoursSchedule = new PeakHoursSchedule([
  new TimeSlot(new Time(7, 30, 0), new Time(23, 30, 0)),
]);

export const basePrices: BasePrices = {
  offPeakHours: 0.204,
  peakHours: 0.2672,
  solar: 0.1276,
};
