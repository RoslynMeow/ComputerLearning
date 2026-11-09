import type { Lab } from "../types";
import { clamp, numberParam, toBase } from "../utils";

export const countingPositionalLab: Lab = {
  id: "lab.counting-positional",
  ku: "ds.01.05.counting-positional",
  title: "位置记数法",
  description: "改变十进制数和基数，观察除基取余、位权展开与结果。",
  parameters: [
    { kind: "number", name: "value", label: "十进制数", min: 0, max: 255, step: 1, default: 11 },
    {
      kind: "select",
      name: "base",
      label: "基数",
      options: [
        { label: "2 进制", value: 2 },
        { label: "8 进制", value: 8 },
        { label: "16 进制", value: 16 },
      ],
      default: 2,
    },
  ],
  run(params) {
    const value = clamp(Math.floor(numberParam(params, "value", 11)), 0, 255);
    const base = clamp(Math.floor(numberParam(params, "base", 2)), 2, 16);
    const answer = toBase(value, base);
    const digits = answer.split("");
    const expansion =
      value === 0
        ? "0"
        : digits
            .map((digit, index) => {
              const power = digits.length - 1 - index;
              return `${digit}×${base}^${power}`;
            })
            .join(" + ");

    const trace = [];
    if (value === 0) {
      trace.push({ step: "0", state: "0", note: "0 直接写成 0" });
    } else {
      let current = value;
      let power = 0;
      while (current > 0) {
        const quotient = Math.floor(current / base);
        const remainder = current % base;
        trace.push({
          step: current,
          state: `${quotient} × ${base} + ${remainder}`,
          note: `最低位 ${remainder.toString(16).toUpperCase()}（第 ${power} 位）`,
        });
        current = quotient;
        power += 1;
      }
    }

    return {
      summary: `${value} 的 ${base} 进制表示是 ${answer}。`,
      metrics: [
        { label: "结果", value: answer },
        { label: "位数", value: String(answer.length) },
        { label: "位权展开", value: expansion },
      ],
      trace,
      steps: [
        "反复除以基数，余数从低位到高位产生。",
        "最后把余数从下往上读。",
      ],
    };
  },
};
