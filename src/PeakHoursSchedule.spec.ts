import assert from "node:assert";
import { describe, it } from "node:test";
import { PeakHoursSchedule } from "./PeakHoursSchedule";
import { Time } from "./Time";
import { TimeSlot } from "./TimeSlot";

describe("PeakHoursSchedule", () => {
  const schedule = new PeakHoursSchedule([
    new TimeSlot(new Time(7, 30, 0), new Time(12, 0, 0)),
    new TimeSlot(new Time(14, 0, 0), new Time(23, 30, 0)),
  ]);
  describe("isInsidePeakHour", () => {
    it("should detect if the time slot is inside the peak hours", () => {
      const slot1 = new TimeSlot(new Time(7, 0, 0), new Time(7, 30, 0));
      const slot2 = new TimeSlot(new Time(7, 30, 0), new Time(8, 0, 0));
      const slot3 = new TimeSlot(new Time(8, 30, 0), new Time(9, 0, 0));
      const slot4 = new TimeSlot(new Time(23, 30, 0), new Time(23, 59, 59));

      assert.equal(schedule.isInsidePeakHour(slot1), false);
      assert.equal(schedule.isInsidePeakHour(slot2), true);
      assert.equal(schedule.isInsidePeakHour(slot3), true);
      assert.equal(schedule.isInsidePeakHour(slot4), false);
    });
  });
});
