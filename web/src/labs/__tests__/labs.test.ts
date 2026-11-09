import { describe, expect, it } from "vitest";
import { labs } from "../registry";
import type { Lab, LabParams } from "../types";

function defaultParams(lab: Lab): LabParams {
  return Object.fromEntries(
    lab.parameters.map((parameter) => [parameter.name, parameter.default]),
  );
}

describe("lab registry", () => {
  it("has unique ids", () => {
    const ids = new Set(labs.map((lab) => lab.id));
    expect(ids.size).toBe(labs.length);
  });
});

for (const lab of labs) {
  describe(lab.id, () => {
    it("has parameters and a default result", () => {
      expect(lab.parameters.length).toBeGreaterThan(0);
      const result = lab.run(defaultParams(lab));
      expect(result.summary.length).toBeGreaterThan(0);
      expect(Array.isArray(result.metrics)).toBe(true);
      expect(Array.isArray(result.trace)).toBe(true);
      expect(Array.isArray(result.steps)).toBe(true);
    });

    it("is deterministic for the same parameters", () => {
      const params = defaultParams(lab);
      expect(lab.run(params)).toEqual(lab.run(params));
    });

    it("runs at every parameter bound", () => {
      const base = defaultParams(lab);
      for (const parameter of lab.parameters) {
        if (parameter.kind === "number") {
          expect(parameter.default).toBeGreaterThanOrEqual(parameter.min);
          expect(parameter.default).toBeLessThanOrEqual(parameter.max);
          expect(lab.run({ ...base, [parameter.name]: parameter.min }).summary).toBeTruthy();
          expect(lab.run({ ...base, [parameter.name]: parameter.max }).summary).toBeTruthy();
        } else {
          for (const option of parameter.options) {
            expect(lab.run({ ...base, [parameter.name]: option.value }).summary).toBeTruthy();
          }
        }
      }
    });
  });
}
