import { pick, randInt } from "../rng";
import type { Exercise } from "../types";

const COST_CHOICES = ["数组更快", "链表更快", "两者同阶"] as const;

const COST_CASES = [
  {
    operation: "按位置随机访问第 i 个元素",
    answer: "数组更快" as const,
    reason: "数组有地址公式，可以 O(1) 直接算出地址；链表必须从头走 i 步。",
  },
  {
    operation: "在已知节点之后插入一个新节点",
    answer: "链表更快" as const,
    reason: "链表只要改几个指针，O(1)；数组要搬移后面所有元素，O(n)。",
  },
  {
    operation: "按值查找某个元素",
    answer: "两者同阶" as const,
    reason: "数组和链表最坏都要从头扫到尾，都是 O(n)。",
  },
];

export const abstractRepresentation: Exercise = {
  id: "ex.ds.01.08",
  ku: "ds.01.08.abstract-representation",
  title: "抽象与表示",
  generate(rng) {
    if (pick(rng, ["address", "cost"] as const) === "address") {
      const base = randInt(rng, 1000, 5000);
      const size = pick(rng, [1, 2, 4, 8] as const);
      const index = randInt(rng, 0, 20);
      const answer = base + index * size;

      return {
        kind: "number" as const,
        prompt: `数组首地址为 ${base}，每个元素占 ${size} 个字节。\n求 a[${index}] 的地址。`,
        answer: String(answer),
        steps: [
          "数组元素连续存放，地址公式是：LOC(a[i]) = base + i × L。",
          `代入 base = ${base}，i = ${index}，L = ${size}。`,
          `LOC(a[${index}]) = ${base} + ${index} × ${size} = ${answer}。`,
        ],
        placeholder: "例如 1028",
      };
    }

    const item = pick(rng, COST_CASES);
    return {
      kind: "choice" as const,
      prompt: `对于「${item.operation}」，数组和链表相比谁更快？`,
      answer: item.answer,
      choices: [...COST_CHOICES],
      steps: [item.reason, `所以选「${item.answer}」。`],
    };
  },
  check(input, instance) {
    if (instance.kind === "number") {
      const value = Number(input.trim());
      return Number.isInteger(value) && value === Number(instance.answer);
    }
    return input.trim() === instance.answer;
  },
};
