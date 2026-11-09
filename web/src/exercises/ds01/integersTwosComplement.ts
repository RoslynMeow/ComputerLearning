import { pick, randInt } from "../rng";
import type { Exercise } from "../types";

function binary(value: number, width: number): string {
  return (value >>> 0).toString(2).padStart(width, "0").slice(-width);
}

function twosComplement(value: number, width: number): string {
  if (value >= 0) return binary(value, width);
  const modulus = 2 ** width;
  return binary(modulus + value, width);
}

export const integersTwosComplement: Exercise = {
  id: "ex.ds.01.06",
  ku: "ds.01.06.integers-twos-complement",
  title: "整数与补码",
  generate(rng) {
    const width = pick(rng, [4, 8] as const);
    const min = -(2 ** (width - 1));
    const max = 2 ** (width - 1) - 1;
    const value = randInt(rng, min, max);
    const mode = pick(rng, ["int-to-bits", "bits-to-int"] as const);
    const bits = twosComplement(value, width);

    if (mode === "int-to-bits") {
      const steps: string[] = [];
      if (value >= 0) {
        steps.push(`符号位是 0。`);
        steps.push(
          `数值 ${value} 的 ${width - 1} 位二进制是 ${binary(value, width - 1)}。`,
        );
        steps.push(`补上符号位 0，得到 ${bits}。`);
      } else {
        const magnitude = Math.abs(value);
        const inverted = binary((2 ** width - 1) ^ magnitude, width);
        steps.push(`这是负数，先取绝对值 ${magnitude}：${binary(magnitude, width)}。`);
        steps.push(`按位取反：${inverted}。`);
        steps.push(`再加一：${bits}。`);
      }

      return {
        kind: "bitvector",
        prompt: `用 ${width} 位补码表示十进制整数 ${value}。`,
        answer: bits,
        steps,
        placeholder: `例如 ${binary(0, width)}`,
      };
    }

    const unsigned = Number.parseInt(bits, 2);
    const sign = bits[0] === "1" ? "1（负数）" : "0（非负）";
    const steps = [
      `最高位是 ${sign}。`,
      `把位模式当作无符号数是 ${unsigned}。`,
      bits[0] === "1"
        ? `因为最高位为 1，所以值 = ${unsigned} − 2^${width} = ${value}。`
        : `因为最高位为 0，所以值就是 ${value}。`,
    ];

    return {
      kind: "number",
      prompt: `位模式 ${bits} 是 ${width} 位补码，求它表示的十进制整数。`,
      answer: String(value),
      steps,
      placeholder: "例如 -3",
    };
  },
  check(input, instance) {
    if (instance.kind === "bitvector") {
      return input.trim().replace(/\s+/g, "") === instance.answer;
    }
    const actual = Number(input.trim());
    return Number.isInteger(actual) && actual === Number(instance.answer);
  },
};
