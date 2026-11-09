import { pick, randInt } from "../rng";
import { formatSet, parseSet, sameSet } from "../sets";
import type { Exercise } from "../types";

type Operation = "union" | "inter" | "diff" | "symdiff";

const LABELS: Record<Operation, string> = {
  union: "A ∪ B",
  inter: "A ∩ B",
  diff: "A − B",
  symdiff: "A △ B",
};

function applyOperation(operation: Operation, inA: boolean, inB: boolean): boolean {
  switch (operation) {
    case "union":
      return inA || inB;
    case "inter":
      return inA && inB;
    case "diff":
      return inA && !inB;
    case "symdiff":
      return inA !== inB;
  }
}

export const setOperations: Exercise = {
  id: "ex.ds.01.02",
  ku: "ds.01.02.set-operations",
  title: "集合运算",
  generate(rng) {
    const size = randInt(rng, 4, 7);
    const universe = Array.from({ length: size }, (_, index) => index);
    const maskA = randInt(rng, 0, 2 ** size - 1);
    const maskB = randInt(rng, 0, 2 ** size - 1);
    const setA = universe.filter((index) => (maskA & (1 << index)) !== 0);
    const setB = universe.filter((index) => (maskB & (1 << index)) !== 0);
    const operation = pick(rng, ["union", "inter", "diff", "symdiff"] as const);
    const result = universe.filter((index) =>
      applyOperation(operation, setA.includes(index), setB.includes(index)),
    );

    const steps = universe.map((index) => {
      const inA = setA.includes(index);
      const inB = setB.includes(index);
      const keep = applyOperation(operation, inA, inB);
      return `${index}：${inA ? "∈ A" : "∉ A"}，${inB ? "∈ B" : "∉ B"} → ${keep ? "保留" : "不保留"}`;
    });

    return {
      kind: "set",
      prompt: `U = {0, 1, ..., ${size - 1}}，A = ${formatSet(setA)}，B = ${formatSet(setB)}。\n求 ${LABELS[operation]}。`,
      answer: formatSet(result),
      steps: [
        `按元素逐个判断是否属于 ${LABELS[operation]}：`,
        ...steps,
        `所以结果是 ${formatSet(result)}。`,
      ],
      placeholder: "例如 {1, 3}",
    };
  },
  check(input, instance) {
    const actual = parseSet(input);
    const expected = parseSet(instance.answer);
    return actual !== null && expected !== null && sameSet(actual, expected);
  },
};
