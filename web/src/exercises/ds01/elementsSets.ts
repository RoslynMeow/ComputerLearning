import { pick, randInt } from "../rng";
import {
  bitsFromSet,
  formatSet,
  parseBitVector,
  parseSet,
  sameSet,
} from "../sets";
import type { Exercise } from "../types";

export const elementsSets: Exercise = {
  id: "ex.ds.01.01",
  ku: "ds.01.01.elements-sets",
  title: "集合与位向量",
  generate(rng) {
    const size = randInt(rng, 4, 8);
    const mask = randInt(rng, 0, 2 ** size - 1);
    const universe = Array.from({ length: size }, (_, index) => index);
    const values = universe.filter((index) => (mask & (1 << index)) !== 0);
    const mode = pick(rng, ["set-to-bits", "bits-to-set"] as const);
    const bits = bitsFromSet(values, size);
    const steps = universe.map(
      (index) =>
        `第 ${index} 位：${values.includes(index) ? `${index} ∈ A → 1` : `${index} ∉ A → 0`}`,
    );

    if (mode === "set-to-bits") {
      return {
        kind: "bitvector",
        prompt: `全集 U = {0, 1, ..., ${size - 1}}，A = ${formatSet(values)}。\n请写出 A 的位向量（第 0 位在左，长度 ${size}）。`,
        answer: bits,
        steps: [
          `全集有 ${size} 个元素，所以位向量长度是 ${size}。`,
          ...steps,
          `从左到右连起来得到 ${bits}。`,
        ],
        placeholder: "例如 0101",
      };
    }

    return {
      kind: "set",
      prompt: `全集 U = {0, 1, ..., ${size - 1}}，位向量 ${bits}（第 0 位在左）表示集合 A。\n请写出 A。`,
      answer: formatSet(values),
      steps: [
        `位向量长度是 ${size}，第 i 位对应元素 i。`,
        ...steps,
        `所以 A = ${formatSet(values)}。`,
      ],
      placeholder: "例如 {1, 3}",
    };
  },
  check(input, instance) {
    if (instance.kind === "bitvector") {
      return parseBitVector(input) === instance.answer;
    }
    const actual = parseSet(input);
    const expected = parseSet(instance.answer);
    return actual !== null && expected !== null && sameSet(actual, expected);
  },
};
