import assert from "node:assert";
import { describe, it } from "node:test";
import { Time } from "./Time";

describe("Time", () => {
  const sevenThirty = new Time(7, 30, 0);
  const eight = new Time(8, 0, 0);
  const eightThirty = new Time(8, 30, 0);
  const eightAnd1Second = new Time(8, 0, 1);

  describe("isBefore", () => {
    it("should return compare two Time instances", () => {
      assert.equal(sevenThirty.isBefore(eight), true);
      assert.equal(eight.isBefore(sevenThirty), false);
      assert.equal(eight.isBefore(eightThirty), true);
      assert.equal(eight.isBefore(eightAnd1Second), true);
      assert.equal(eightAnd1Second.isBefore(eight), false);
    });
  });

  describe("isAfter", () => {
    it("should compare two Time instances", () => {
      assert.equal(sevenThirty.isAfter(eight), false);
      assert.equal(eight.isAfter(sevenThirty), true);
      assert.equal(eight.isAfter(eightThirty), false);
      assert.equal(eight.isAfter(eightAnd1Second), false);
      assert.equal(eightAnd1Second.isAfter(eight), true);
    });
  });

  describe("isEqual", () => {
    it("should compare two Time instances", () => {
      assert.equal(sevenThirty.isEqualTo(eight), false);
      assert.equal(eight.isEqualTo(eight), true);
      assert.equal(eight.isEqualTo(eightAnd1Second), false);
      assert.equal(eightAnd1Second.isEqualTo(eightAnd1Second), true);
    });
  });

  describe("addMinutes", () => {
    it("should add minutes to a Time instance", () => {
      const time = new Time(10, 15, 12);
      const newTime = time.addMinutes(30);
      assert(newTime.isEqualTo(new Time(10, 45, 12)));
    });

    it("should handle hour overflow when adding minutes", () => {
      const time = new Time(23, 50, 0);
      const newTime = time.addMinutes(20);
      assert(newTime.isEqualTo(new Time(0, 10, 0)));
    });
  });
});
