import { pick, randInt } from "../rng";
import type { Exercise } from "../types";

const DIGITS = "0123456789ABCDEF";

function toBase(value: number, base: number): string {
  if (value === 0) return "0";
  let current = value;
  let output = "";
  while (current > 0) {
    output = DIGITS[current % base] + output;
    current = Math.floor(current / base);
  }
  return output;
}

function normalize(input: string): string {
  const compact = input.trim().replace(/\s+/g, "").toUpperCase();
  return compact.replace(/^0+(?=.)/, "");
}

export const countingPositional: Exercise = {
  id: "ex.ds.01.05",
  ku: "ds.01.05.counting-positional",
  title: "位置记数法",
  generate(rng) {
    const base = pick(rng, [2, 8, 16] as const);
    const max = base === 2 ? 255 : base === 8 ? 511 : 4095;
    const value = randInt(rng, 0, max);
    const answer = toBase(value, base);
    const steps: string[] = [];

    if (value === 0) {
      steps.push("0 在任何进制下都写成 0。");
    } else {
      let current = value;
      while (current > 0) {
        const quotient = Math.floor(current / base);
        const remainder = current % base;
        steps.push(
          `${current} = ${quotient} × ${base} + ${remainder}，最低位写 ${DIGITS[remainder]}`,
        );
        current = quotient;
      }
      steps.push(`把余数从下往上读，得到 ${answer}。`);
    }

    return {
      kind: "text",
      prompt: `把十进制数 ${value} 转成 ${base} 进制。`,
      answer,
      steps,
      placeholder: base === 2 ? "例如 1011" : base === 8 ? "例如 173" : "例如 1A",
    };
  },
  check(input, instance) {
    return normalize(input) === normalize(instance.answer);
  },
};
