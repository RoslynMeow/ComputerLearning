import type { Lab } from "../types";
import { binary, clamp, numberParam, stringParam } from "../utils";

export const computerRepresentationLab: Lab = {
  id: "lab.computer-representation",
  ku: "ds.01.07.computer-representation",
  title: "同一串位的不同解释",
  description: "改变 16 位值、字节序和视图，观察同一串字节如何被解释成不同的数或字符。",
  parameters: [
    { kind: "number", name: "value", label: "16 位值", min: 0, max: 65535, step: 1, default: 16706 },
    {
      kind: "select",
      name: "endian",
      label: "字节序",
      options: [
        { label: "大端", value: "big" },
        { label: "小端", value: "little" },
      ],
      default: "big",
    },
  ],
  run(params) {
    const value = clamp(Math.floor(numberParam(params, "value", 16706)), 0, 65535);
    const endian = stringParam(params, "endian", "big");
    const high = value >> 8;
    const low = value & 0xff;
    const bytes = endian === "big" ? [high, low] : [low, high];
    const hex = value.toString(16).toUpperCase().padStart(4, "0");
    const signed = value > 32767 ? value - 65536 : value;
    const char = value <= 0x7f ? `'${String.fromCharCode(value)}'` : "非 ASCII";

    return {
      summary: `0x${hex}（${value}）按 ${endian === "big" ? "大端" : "小端"} 存为 ${bytes.map((byte) => byte.toString(16).toUpperCase().padStart(2, "0")).join(" ")}。`,
      metrics: [
        { label: "二进制", value: binary(value, 16) },
        { label: "十六进制", value: `0x${hex}` },
        { label: "字节序", value: bytes.map((byte) => `0x${byte.toString(16).toUpperCase().padStart(2, "0")}`).join(" ") },
        { label: "无符号", value: String(value) },
        { label: "有符号", value: String(signed) },
        { label: "字符", value: char },
      ],
      trace: bytes.map((byte, index) => ({
        step: `byte ${index}`,
        state: `0x${byte.toString(16).toUpperCase().padStart(2, "0")}`,
        note: endian === "big" ? (index === 0 ? "高字节" : "低字节") : index === 0 ? "低字节" : "高字节",
      })),
      steps: [
        "同一串位按无符号、补码、字符解释会得到不同结果。",
        "字节序只改变字节的存放顺序，不改变位的值。",
      ],
    };
  },
};
