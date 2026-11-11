import { pick, randInt } from "../rng";
import type { Exercise } from "../types";

function hexByte(value: number): string {
  return value.toString(16).toUpperCase().padStart(2, "0");
}

function normalizeHex(input: string): string {
  return input.trim().replace(/0x/gi, "").replace(/[\s-]+/g, "").toUpperCase();
}

export const computerRepresentation: Exercise = {
  id: "ex.ds.01.07",
  ku: "ds.01.07.computer-representation",
  title: "计算机中的表示",
  generate(rng) {
    if (pick(rng, ["endian", "interpret"] as const) === "endian") {
      const bytes = Array.from({ length: 4 }, () => randInt(rng, 0, 255));
      const big = bytes.map(hexByte).join(" ");
      const little = [...bytes].reverse().map(hexByte).join(" ");
      const endian = pick(rng, ["大端", "小端"] as const);
      const answer = endian === "大端" ? big : little;

      return {
        kind: "text" as const,
        prompt: `32 位整数 0x${bytes.map(hexByte).join("")} 按${endian}序存放。\n请写出内存中的字节序列（十六进制，空格分隔）。`,
        answer,
        steps: [
          `原始字节从高到低是 ${big}。`,
          endian === "大端"
            ? "大端序把高位字节放在低地址，所以顺序不变。"
            : "小端序把低位字节放在低地址，所以顺序反过来。",
          `因此内存中是 ${answer}。`,
        ],
        placeholder: "例如 78 56 34 12",
      };
    }

    const width = 8;
    const bits = randInt(rng, 0, 2 ** width - 1);
    const pattern = bits.toString(2).padStart(width, "0");
    const signed = bits >= 2 ** (width - 1) ? bits - 2 ** width : bits;
    const mode = pick(rng, ["unsigned", "signed"] as const);
    const value = mode === "unsigned" ? bits : signed;

    return {
      kind: "number" as const,
      prompt: `位模式 ${pattern} 按 ${width} 位${mode === "unsigned" ? "无符号整数" : "补码整数"}解释，值是多少？`,
      answer: String(value),
      steps: [
        `最高位是 ${pattern[0]}。`,
        mode === "unsigned"
          ? `无符号解释：${pattern} 的十进制值是 ${bits}。`
          : pattern[0] === "1"
            ? `补码解释：最高位为 1，所以值 = ${bits} − 2^${width} = ${signed}。`
            : `补码解释：最高位为 0，所以值就是 ${bits}。`,
      ],
      placeholder: mode === "unsigned" ? "例如 255" : "例如 -1",
    };
  },
  check(input, instance) {
    if (instance.kind === "number") {
      const value = Number(input.trim());
      return Number.isInteger(value) && value === Number(instance.answer);
    }
    return normalizeHex(input) === normalizeHex(instance.answer);
  },
};
