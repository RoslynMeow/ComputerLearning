import type { Lab } from "../types";
import { clamp, numberParam } from "../utils";

function vonNeumann(n: number): string {
  const sets = ["∅"];
  for (let index = 1; index <= n; index += 1) {
    sets.push(`{${sets.join(", ")}}`);
  }
  return sets[n];
}

export const naturalNumbersLab: Lab = {
  id: "lab.natural-numbers",
  ku: "ds.01.04.natural-numbers",
  title: "自然数与后继",
  description: "改变 n、a、b，观察 von Neumann 集合表示与递归加法。",
  parameters: [
    { kind: "number", name: "n", label: "n", min: 0, max: 5, step: 1, default: 3 },
    { kind: "number", name: "a", label: "a", min: 0, max: 5, step: 1, default: 2 },
    { kind: "number", name: "b", label: "b", min: 0, max: 5, step: 1, default: 3 },
  ],
  run(params) {
    const n = clamp(Math.floor(numberParam(params, "n", 3)), 0, 5);
    const a = clamp(Math.floor(numberParam(params, "a", 2)), 0, 5);
    const b = clamp(Math.floor(numberParam(params, "b", 3)), 0, 5);
    const trace = [];
    for (let index = a; index > 0; index -= 1) {
      trace.push({
        step: `S^${index}(0) + ${b}`,
        state: `S(S^${index - 1}(0) + ${b})`,
        note: "把后继移到最外层",
      });
    }
    trace.push({ step: `0 + ${b}`, state: `${b}`, note: "递归基例" });

    return {
      summary: `n = ${n} 的集合表示是 ${vonNeumann(n)}；${a} + ${b} = ${a + b}。`,
      metrics: [
        { label: `${n} 的表示`, value: vonNeumann(n) },
        { label: `${a} + ${b}`, value: String(a + b) },
        { label: "加法步数", value: String(a + 1) },
      ],
      trace,
      steps: [
        "0 = ∅，n + 1 = n ∪ {n}。",
        "加法用后继递归定义：0 + m = m，S(n) + m = S(n + m)。",
      ],
    };
  },
};
