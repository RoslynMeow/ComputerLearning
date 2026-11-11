import { pick, randInt } from "../rng";
import type { Exercise } from "../types";

function successorExpression(times: number): string {
  return `${"S(".repeat(times)}0${")".repeat(times)}`;
}

function successorExercise(rng: () => number) {
  const times = randInt(rng, 1, 6);
  const expression = successorExpression(times);
  const chain = Array.from({ length: times }, (_, index) => index + 1);

  return {
    kind: "number" as const,
    prompt: `把后继表达式 ${expression} 写成普通自然数。`,
    answer: String(times),
    steps: [
      "从 0 开始数后继：",
      "0 → 1 → 2 → …",
      `这里连续取了 ${times} 次后继，所以 ${expression} = ${times}。`,
      `展开后的链条是 0 → ${chain.join(" → ")}。`,
    ],
    placeholder: "例如 4",
  };
}

function additionExercise(rng: () => number) {
  const left = randInt(rng, 1, 4);
  const right = randInt(rng, 1, 4);
  const answer = left + right;
  const leftExpression = successorExpression(left);
  const rightExpression = successorExpression(right);

  return {
    kind: "number" as const,
    prompt: `按加法定义计算 ${leftExpression} + ${rightExpression}。`,
    answer: String(answer),
    steps: [
      `${leftExpression} 表示从 0 连续取 ${left} 次后继，所以它是 ${left}。`,
      `${rightExpression} 表示从 0 连续取 ${right} 次后继，所以它是 ${right}。`,
      "加法定义是：0 + m = m，S(n) + m = S(n + m)。",
      `不断把左边的后继搬到结果上，${left} + ${right} = ${answer}。`,
    ],
    placeholder: "例如 5",
  };
}

export const naturalNumbers: Exercise = {
  id: "ex.ds.01.04",
  ku: "ds.01.04.natural-numbers",
  title: "自然数与后继",
  generate(rng) {
    return pick(rng, ["successor", "addition"] as const) === "successor"
      ? successorExercise(rng)
      : additionExercise(rng);
  },
  check(input, instance) {
    const value = Number(input.trim());
    return Number.isInteger(value) && value === Number(instance.answer);
  },
};
