import assert from "node:assert";
import { describe, it } from "node:test";
import { Time } from "./Time";
import { TimeSlot } from "./TimeSlot";

describe("TimeSlot", () => {
  const five = new Time(5, 0, 0);
  const six = new Time(6, 0, 0);
  const seven = new Time(7, 0, 0);
  const sevenThirty = new Time(7, 30, 0);
  const eight = new Time(8, 0, 0);
  const nine = new Time(9, 0, 0);
  const tenThirty = new Time(10, 30, 0);
  const tenThirtyAndOneSecond = new Time(10, 30, 1);
  const eighteen = new Time(18, 0, 0);
  const twentyThirty = new Time(20, 30, 0);
  const twentyOne = new Time(21, 0, 0);

  describe("constructor", () => {
    it("should validate that the start is after the end", () => {
      assert.throws(() => {
        new TimeSlot(sevenThirty, seven);
      });
    });

    it("should validate that the start is not the end", () => {
      assert.throws(() => {
        new TimeSlot(seven, seven);
      });
    });
  });

  describe("contains", () => {
    it("should check that a slot contains another slot", () => {
      const slot = new TimeSlot(sevenThirty, tenThirty);

      assert.equal(slot.contains(new TimeSlot(eight, nine)), true);
      assert.equal(slot.contains(new TimeSlot(sevenThirty, nine)), true);
      assert.equal(slot.contains(new TimeSlot(sevenThirty, tenThirty)), true);
      assert.equal(slot.contains(new TimeSlot(nine, tenThirty)), true);
      assert.equal(
        slot.contains(new TimeSlot(nine, tenThirtyAndOneSecond)),
        false,
      );
      assert.equal(slot.contains(new TimeSlot(five, six)), false);
      assert.equal(slot.contains(new TimeSlot(seven, sevenThirty)), false);
      assert.equal(slot.contains(new TimeSlot(tenThirty, eighteen)), false);
      assert.equal(slot.contains(new TimeSlot(twentyThirty, twentyOne)), false);
    });
  });
});
