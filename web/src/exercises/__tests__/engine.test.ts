import { describe, expect, it } from "vitest";
import { exercises } from "../registry";
import { mulberry32 } from "../rng";
import {
  bitsFromSet,
  formatSet,
  parseSet,
  sameSet,
  setFromBits,
} from "../sets";

describe("exercise registry", () => {
  it("has unique ids", () => {
    const ids = new Set(exercises.map((exercise) => exercise.id));
    expect(ids.size).toBe(exercises.length);
  });
});

for (const exercise of exercises) {
  describe(exercise.id, () => {
    it("is deterministic for the same seed", () => {
      expect(exercise.generate(mulberry32(42))).toEqual(
        exercise.generate(mulberry32(42)),
      );
    });

    it("accepts its own answer across seeds", () => {
      for (let seed = 1; seed <= 30; seed += 1) {
        const instance = exercise.generate(mulberry32(seed));
        expect(exercise.check(instance.answer, instance)).toBe(true);
      }
    });

    it("rejects a clearly wrong answer", () => {
      const instance = exercise.generate(mulberry32(7));
      expect(exercise.check("__wrong__", instance)).toBe(false);
    });
  });
}

describe("set helpers", () => {
  it("parses the empty set", () => {
    expect(parseSet("∅")).toEqual([]);
    expect(parseSet("{}")).toEqual([]);
  });

  it("parses, deduplicates, and sorts", () => {
    expect(parseSet("{3, 1, 1}")).toEqual([1, 3]);
  });

  it("converts between sets and bit vectors", () => {
    expect(bitsFromSet([1, 3], 5)).toBe("01010");
    expect(setFromBits("01010")).toEqual([1, 3]);
  });

  it("formats sets", () => {
    expect(formatSet([3, 1])).toBe("{1, 3}");
    expect(formatSet([])).toBe("∅");
  });

  it("compares sets without order", () => {
    expect(sameSet([1, 3], [3, 1])).toBe(true);
    expect(sameSet([1], [1, 2])).toBe(false);
  });
});
