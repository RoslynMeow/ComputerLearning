import type { Lab } from "../types";
import { clamp, numberParam, stringParam } from "../utils";

type Operation = "access" | "insert-head" | "insert-index" | "delete-head";

const LABELS: Record<Operation, string> = {
  access: "随机访问 a[i]",
  "insert-head": "头部插入",
  "insert-index": "在 i 处插入",
  "delete-head": "删除头部",
};

export const adtRepresentationLab: Lab = {
  id: "lab.adt-representation",
  ku: "ds.01.08.abstract-representation",
  title: "数组 vs 链表代价",
  description: "改变规模、位置和操作，比较数组与链表的操作代价。",
  parameters: [
    { kind: "number", name: "size", label: "元素个数", min: 4, max: 32, step: 1, default: 8 },
    { kind: "number", name: "index", label: "位置 i", min: 0, max: 31, step: 1, default: 3 },
    {
      kind: "select",
      name: "operation",
      label: "操作",
      options: [
        { label: "随机访问", value: "access" },
        { label: "头部插入", value: "insert-head" },
        { label: "在 i 处插入", value: "insert-index" },
        { label: "删除头部", value: "delete-head" },
      ],
      default: "access",
    },
  ],
  run(params) {
    const size = clamp(Math.floor(numberParam(params, "size", 8)), 4, 32);
    const index = clamp(Math.floor(numberParam(params, "index", 3)), 0, size - 1);
    const operation = stringParam(params, "operation", "access") as Operation;

    let arrayCost = 0;
    let listCost = 0;
    switch (operation) {
      case "access":
        arrayCost = 1;
        listCost = index + 1;
        break;
      case "insert-head":
        arrayCost = size;
        listCost = 1;
        break;
      case "insert-index":
        arrayCost = size - index;
        listCost = index + 1;
        break;
      case "delete-head":
        arrayCost = size - 1;
        listCost = 1;
        break;
    }

    return {
      summary: `${LABELS[operation]}：数组 ${arrayCost} 次操作，链表 ${listCost} 次操作。`,
      metrics: [
        { label: "数组代价", value: `${arrayCost}` },
        { label: "链表代价", value: `${listCost}` },
        { label: "数组地址", value: `base + ${index} × L` },
        { label: "更适合", value: arrayCost <= listCost ? "数组" : "链表" },
      ],
      trace: [
        { step: "数组", state: `${LABELS[operation]}`, note: `需要 ${arrayCost} 次基本操作` },
        { step: "链表", state: `${LABELS[operation]}`, note: `需要 ${listCost} 次基本操作` },
      ],
      steps: [
        "数组随机访问靠地址公式，代价 O(1)。",
        "链表访问第 i 个元素要从头走 i 步，代价 O(i)。",
        "头部插入/删除链表只需改指针，数组要搬移元素。",
      ],
    };
  },
};
