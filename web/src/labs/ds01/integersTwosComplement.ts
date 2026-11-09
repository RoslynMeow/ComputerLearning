import type { Lab } from "../types";
import { clamp, numberParam, twosComplement } from "../utils";

function signMagnitude(value: number, width: number): string {
  const magnitudeLimit = 2 ** (width - 1);
  if (value >= 0) {
    return `0${(value >>> 0).toString(2).padStart(width - 1, "0")}`;
  }
  if (Math.abs(value) >= magnitudeLimit) return "—";
  return `1${Math.abs(value).toString(2).padStart(width - 1, "0")}`;
}

function onesComplement(value: number, width: number): string {
  if (value >= 0) return twosComplement(value, width);
  const magnitude = Math.abs(value);
  const inverted = (2 ** width - 1) ^ magnitude;
  return (inverted >>> 0).toString(2).padStart(width, "0");
}

export const integersTwosComplementLab: Lab = {
  id: "lab.integers-twos-complement",
  ku: "ds.01.06.integers-twos-complement",
  title: "整数与补码",
  description: "改变位宽、整数和增量，观察三种表示与溢出。",
  parameters: [
    {
      kind: "select",
      name: "width",
      label: "位宽",
      options: [
        { label: "4 位", value: 4 },
        { label: "8 位", value: 8 },
        { label: "16 位", value: 16 },
      ],
      default: 4,
    },
    { kind: "number", name: "value", label: "整数", min: -128, max: 127, step: 1, default: -5 },
    { kind: "number", name: "delta", label: "加上的数", min: -8, max: 8, step: 1, default: 1 },
  ],
  run(params) {
    const width = clamp(Math.floor(numberParam(params, "width", 4)), 4, 16);
    const min = -(2 ** (width - 1));
    const max = 2 ** (width - 1) - 1;
    const rawValue = Math.floor(numberParam(params, "value", -5));
    const value = clamp(rawValue, min, max);
    const delta = clamp(Math.floor(numberParam(params, "delta", 1)), -8, 8);
    const sum = value + delta;
    const overflow = sum < min || sum > max;
    const bits = twosComplement(value, width);
    const sumBits = twosComplement(sum, width);

    const trace = [];
    if (value >= 0) {
      trace.push({ step: "符号位", state: "0" });
      trace.push({ step: "数值位", state: twosComplement(value, width - 1) });
    } else {
      const magnitude = Math.abs(value);
      const inverted = (2 ** width - 1) ^ magnitude;
      trace.push({ step: "绝对值", state: magnitude.toString(2).padStart(width, "0") });
      trace.push({ step: "按位取反", state: (inverted >>> 0).toString(2).padStart(width, "0") });
      trace.push({ step: "加一", state: bits });
    }
    trace.push({ step: `${value} + ${delta}`, state: `${sum}${overflow ? "（溢出）" : ""}` });

    return {
      summary: `${width} 位补码：${value} = ${bits}；${value} + ${delta} = ${sum}${overflow ? "，超出范围，发生溢出" : ""}。`,
      metrics: [
        { label: "补码", value: bits },
        { label: "符号-数值", value: signMagnitude(value, width) },
        { label: "反码", value: onesComplement(value, width) },
        { label: "范围", value: `${min} .. ${max}` },
        { label: "加法结果", value: `${sum} = ${sumBits}` },
      ],
      trace,
      steps: [
        "补码负数 = 按位取反再加一（固定位宽）。",
        "若结果超出范围，就是有符号溢出。",
      ],
    };
  },
};
