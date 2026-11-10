import type { Lab } from "../types";
import { clamp, numberParam } from "../utils";

const SIZE = 3;

function matrixFromMask(mask: number): boolean[][] {
  return Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, column) => (mask & (1 << (row * SIZE + column))) !== 0),
  );
}

export const relationsFunctionsLab: Lab = {
  id: "lab.relations-functions",
  ku: "ds.01.03.relations-functions",
  title: "关系矩阵与性质",
  description: "点击 3×3 格子添加或删除有序对，观察自反、对称、传递、偏序如何变化。",
  custom: "relation-matrix",
  parameters: [
    { kind: "number", name: "mask", label: "关系掩码（9 位）", min: 0, max: 511, step: 1, default: 73 },
  ],
  run(params) {
    const mask = clamp(numberParam(params, "mask", 73), 0, 511);
    const matrix = matrixFromMask(mask);
    const has = (row: number, column: number) => matrix[row][column];

    const reflexive = [0, 1, 2].every((index) => has(index, index));
    const symmetric = [0, 1, 2].every((row) =>
      [0, 1, 2].every((column) => has(row, column) === has(column, row)),
    );
    const transitive = [0, 1, 2].every((row) =>
      [0, 1, 2].every((middle) =>
        [0, 1, 2].every(
          (column) => !has(row, middle) || !has(middle, column) || has(row, column),
        ),
      ),
    );
    const antisymmetric = [0, 1, 2].every((row) =>
      [0, 1, 2].every(
        (column) => row === column || !has(row, column) || !has(column, row),
      ),
    );

    const pairs: string[] = [];
    for (let row = 0; row < SIZE; row += 1) {
      for (let column = 0; column < SIZE; column += 1) {
        if (has(row, column)) pairs.push(`(${row},${column})`);
      }
    }

    const isEquivalence = reflexive && symmetric && transitive;
    const isPartialOrder = reflexive && antisymmetric && transitive;
    const classes: string[] = [];
    if (isEquivalence) {
      const seen = new Set<number>();
      for (let index = 0; index < SIZE; index += 1) {
        if (seen.has(index)) continue;
        const group = [index];
        seen.add(index);
        for (let other = 0; other < SIZE; other += 1) {
          if (other !== index && has(index, other) && has(other, index)) {
            group.push(other);
            seen.add(other);
          }
        }
        classes.push(`{${group.sort().join(", ")}}`);
      }
    }

    return {
      summary: `关系 ${pairs.length ? pairs.join("、") : "∅"}：${isEquivalence ? "是等价关系" : "不是等价关系"}，${isPartialOrder ? "是偏序关系" : "不是偏序关系"}。`,
      metrics: [
        { label: "自反", value: reflexive ? "是" : "否" },
        { label: "对称", value: symmetric ? "是" : "否" },
        { label: "传递", value: transitive ? "是" : "否" },
        { label: "反对称", value: antisymmetric ? "是" : "否" },
      ],
      trace: matrix.map((row, index) => ({
        step: index,
        state: row.map((value) => (value ? "1" : "0")).join(" "),
        note: `第 ${index} 行`,
      })),
      steps: [
        "自反：对角线全为 1。",
        "对称：矩阵关于主对角线对称。",
        "传递：若 i→j 且 j→k，则 i→k。",
        isEquivalence ? `等价类：${classes.join("，")}` : "当前关系不是等价关系，没有等价类划分。",
      ],
    };
  },
};
