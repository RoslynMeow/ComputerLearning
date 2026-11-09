import { describe, expect, it } from "vitest";
import type { GraphEdge, GraphNode } from "../types";
import {
  bookTitle,
  buildBookIndex,
  buildNodeIndex,
  groupByChapter,
  layoutGraph,
  pointsPath,
} from "../utils";

const nodes: GraphNode[] = [
  {
    id: "ds.01.01.elements-sets",
    title: "元素与集合",
    subject: "data-structures",
    subjectTitle: "数据结构与算法",
    chapter: "01-elements-to-integers",
    chapterTitle: "从元素到整数",
    order: 1,
    prerequisites: [],
    related: ["ds.01.02.set-operations"],
    sources: [{ book: "rosen", edition: 8, chapter: "2" }],
    labs: ["lab.elements-sets"],
    exercises: ["ex.ds.01.01"],
  },
  {
    id: "ds.01.02.set-operations",
    title: "集合的运算与表示",
    subject: "data-structures",
    subjectTitle: "数据结构与算法",
    chapter: "01-elements-to-integers",
    chapterTitle: "从元素到整数",
    order: 2,
    prerequisites: ["ds.01.01.elements-sets"],
    related: [],
    sources: [{ book: "rosen", edition: 8, chapter: "2" }, { book: "halmos" }],
    labs: ["lab.set-operations"],
    exercises: ["ex.ds.01.02"],
  },
  {
    id: "ds.02.01.logic",
    title: "用逻辑说话",
    subject: "data-structures",
    subjectTitle: "数据结构与算法",
    chapter: "02-logic-proof-computation",
    chapterTitle: "逻辑、证明与计算",
    order: 1,
    prerequisites: ["ds.01.02.set-operations"],
    related: [],
    sources: [{ book: "rosen", edition: 8, chapter: "1" }],
    labs: ["lab.logic-spec"],
    exercises: ["ex.ds.02.01"],
  },
];

const edges: GraphEdge[] = [
  {
    from: "ds.01.01.elements-sets",
    to: "ds.01.02.set-operations",
    kind: "prerequisite",
  },
  {
    from: "ds.01.02.set-operations",
    to: "ds.02.01.logic",
    kind: "related",
  },
];

describe("graph utils", () => {
  it("groups by chapter and sorts by order", () => {
    const groups = groupByChapter(nodes);
    expect(groups).toHaveLength(2);
    expect(groups[0].id).toBe("01-elements-to-integers");
    expect(groups[0].nodes.map((node) => node.order)).toEqual([1, 2]);
  });

  it("lays out nodes, clusters and edges", () => {
    const layout = layoutGraph(nodes, edges);
    expect(Object.keys(layout.nodes)).toHaveLength(nodes.length);
    expect(layout.clusters).toHaveLength(2);
    expect(layout.edges).toHaveLength(2);
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);
    expect(layout.nodes["ds.01.01.elements-sets"].width).toBeGreaterThan(0);
  });

  it("builds a book reverse index", () => {
    const index = buildBookIndex(nodes);
    expect(index.rosen).toEqual([
      "ds.01.01.elements-sets",
      "ds.01.02.set-operations",
      "ds.02.01.logic",
    ]);
    expect(index.halmos).toEqual(["ds.01.02.set-operations"]);
  });

  it("builds a node index and resolves book titles", () => {
    const index = buildNodeIndex(nodes);
    expect(index["ds.01.01.elements-sets"].title).toBe("元素与集合");
    expect(bookTitle([{ id: "rosen", title: "Rosen", author: [] }], "rosen")).toBe("Rosen");
  });

  it("turns routed edge points into an SVG path", () => {
    const layout = layoutGraph(nodes, edges);
    const path = pointsPath(layout.edges[0].points);
    expect(path.startsWith("M ")).toBe(true);
    expect(path.includes("L ")).toBe(true);
  });
});
