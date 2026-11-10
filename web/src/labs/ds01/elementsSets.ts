import { formatSet } from "../../exercises/sets";
import type { Lab } from "../types";
import { clamp, numberParam } from "../utils";

export const elementsSetsLab: Lab = {
  id: "lab.elements-sets",
  ku: "ds.01.01.elements-sets",
  title: "集合与位向量",
  description: "点击元素，把它加入或移出集合 A；观察集合、位向量和幂集大小如何一起变化。",
  custom: "set-builder",
  parameters: [
    { kind: "number", name: "size", label: "全集大小", min: 4, max: 8, step: 1, default: 6 },
    { kind: "number", name: "mask", label: "掩码", min: 0, max: 255, step: 1, default: 21 },
  ],
  run(params) {
    const size = clamp(numberParam(params, "size", 6), 4, 8);
    const maxMask = 2 ** size - 1;
    const mask = clamp(numberParam(params, "mask", 21), 0, maxMask);
    const values = Array.from({ length: size }, (_, index) => index).filter(
      (index) => (mask & (1 << index)) !== 0,
    );
    const bits = Array.from({ length: size }, (_, index) =>
      mask & (1 << index) ? "1" : "0",
    ).join("");

    return {
      summary: `全集 U = {0, ..., ${size - 1}}，A = ${formatSet(values)}。`,
      metrics: [
        { label: "位向量", value: bits },
        { label: "集合大小", value: String(values.length) },
        { label: "幂集大小", value: String(2 ** size) },
      ],
      trace: Array.from({ length: size }, (_, index) => ({
        step: index,
        state: `第 ${index} 位`,
        note: `${mask & (1 << index) ? 1 : 0} → ${values.includes(index) ? "∈ A" : "∉ A"}`,
      })),
      steps: [
        "第 i 位为 1 表示元素 i 属于集合 A。",
        "全集有 n 个元素时，幂集大小是 2^n。",
      ],
    };
  },
};
