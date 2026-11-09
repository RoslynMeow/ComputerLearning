import { formatSet } from "../../exercises/sets";
import type { Lab } from "../types";
import { clamp, numberParam, stringParam } from "../utils";

type Operation = "union" | "inter" | "diff" | "symdiff";

const LABELS: Record<Operation, string> = {
  union: "A ∪ B",
  inter: "A ∩ B",
  diff: "A − B",
  symdiff: "A △ B",
};

function keep(operation: Operation, inA: boolean, inB: boolean): boolean {
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

export const setOperationsLab: Lab = {
  id: "lab.set-operations",
  ku: "ds.01.02.set-operations",
  title: "集合运算",
  description: "切换并、交、差、对称差，观察结果集合与位运算如何对应。",
  parameters: [
    { kind: "number", name: "size", label: "全集大小", min: 4, max: 7, step: 1, default: 5 },
    { kind: "number", name: "a", label: "A 的掩码", min: 0, max: 127, step: 1, default: 21 },
    { kind: "number", name: "b", label: "B 的掩码", min: 0, max: 127, step: 1, default: 42 },
    {
      kind: "select",
      name: "operation",
      label: "运算",
      options: [
        { label: "并 A ∪ B", value: "union" },
        { label: "交 A ∩ B", value: "inter" },
        { label: "差 A − B", value: "diff" },
        { label: "对称差 A △ B", value: "symdiff" },
      ],
      default: "union",
    },
  ],
  run(params) {
    const size = clamp(numberParam(params, "size", 5), 4, 7);
    const maxMask = 2 ** size - 1;
    const maskA = clamp(numberParam(params, "a", 21), 0, maxMask);
    const maskB = clamp(numberParam(params, "b", 42), 0, maxMask);
    const operation = stringParam(params, "operation", "union") as Operation;
    const setA = Array.from({ length: size }, (_, index) => index).filter(
      (index) => (maskA & (1 << index)) !== 0,
    );
    const setB = Array.from({ length: size }, (_, index) => index).filter(
      (index) => (maskB & (1 << index)) !== 0,
    );
    const result = Array.from({ length: size }, (_, index) => index).filter(
      (index) => keep(operation, setA.includes(index), setB.includes(index)),
    );
    const bitsA = Array.from({ length: size }, (_, index) => (maskA & (1 << index) ? "1" : "0")).join("");
    const bitsB = Array.from({ length: size }, (_, index) => (maskB & (1 << index) ? "1" : "0")).join("");
    const bitsR = Array.from({ length: size }, (_, index) => (result.includes(index) ? "1" : "0")).join("");

    return {
      summary: `${LABELS[operation]} = ${formatSet(result)}`,
      metrics: [
        { label: "A", value: `${formatSet(setA)} = ${bitsA}` },
        { label: "B", value: `${formatSet(setB)} = ${bitsB}` },
        { label: "结果", value: `${formatSet(result)} = ${bitsR}` },
      ],
      trace: Array.from({ length: size }, (_, index) => ({
        step: index,
        state: `${index}`,
        note: `${setA.includes(index) ? "∈A" : "∉A"}，${setB.includes(index) ? "∈B" : "∉B"} → ${result.includes(index) ? "保留" : "不保留"}`,
      })),
      steps: [
        "并 = 按位或，交 = 按位与，补 = 按位取反，对称差 = 按位异或。",
        "逐元素判断比背公式更可靠。",
      ],
    };
  },
};
