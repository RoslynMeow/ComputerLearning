import type { Book, GraphNode } from "./types";

export type ChapterGroup = {
  id: string;
  title: string;
  nodes: GraphNode[];
};

export type NodePosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LayoutOptions = {
  columnWidth: number;
  rowHeight: number;
  nodeWidth: number;
  nodeHeight: number;
  padding: number;
};

const DEFAULT_OPTIONS: LayoutOptions = {
  columnWidth: 360,
  rowHeight: 96,
  nodeWidth: 280,
  nodeHeight: 60,
  padding: 48,
};

export function groupByChapter(nodes: GraphNode[]): ChapterGroup[] {
  const map = new Map<string, ChapterGroup>();
  for (const node of nodes) {
    const group = map.get(node.chapter) ?? {
      id: node.chapter,
      title: node.chapterTitle,
      nodes: [],
    };
    group.nodes.push(node);
    map.set(node.chapter, group);
  }
  return [...map.values()].map((group) => ({
    ...group,
    nodes: [...group.nodes].sort((left, right) => left.order - right.order),
  }));
}

export function layoutNodes(
  nodes: GraphNode[],
  options: Partial<LayoutOptions> = {},
): {
  groups: (ChapterGroup & { x: number })[];
  positions: Record<string, NodePosition>;
  width: number;
  height: number;
} {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const groups = groupByChapter(nodes);
  const positions: Record<string, NodePosition> = {};
  let maxRows = 0;

  groups.forEach((group, column) => {
    maxRows = Math.max(maxRows, group.nodes.length);
    group.nodes.forEach((node, row) => {
      positions[node.id] = {
        x: config.padding + column * config.columnWidth,
        y: config.padding + 56 + row * config.rowHeight,
        width: config.nodeWidth,
        height: config.nodeHeight,
      };
    });
  });

  return {
    groups: groups.map((group, column) => ({
      ...group,
      x: config.padding + column * config.columnWidth,
    })),
    positions,
    width:
      config.padding * 2 +
      Math.max(1, groups.length) * config.columnWidth -
      (config.columnWidth - config.nodeWidth),
    height: config.padding * 2 + 56 + Math.max(1, maxRows) * config.rowHeight,
  };
}

export function edgePath(
  from: string,
  to: string,
  positions: Record<string, NodePosition>,
): string {
  const start = positions[from];
  const end = positions[to];
  if (!start || !end) return "";
  const x1 = start.x + start.width;
  const y1 = start.y + start.height / 2;
  const x2 = end.x;
  const y2 = end.y + end.height / 2;
  const bend = Math.max(40, Math.abs(x2 - x1) / 2);
  return `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
}

export function buildBookIndex(nodes: GraphNode[]): Record<string, string[]> {
  const index: Record<string, string[]> = {};
  for (const node of nodes) {
    for (const source of node.sources) {
      index[source.book] ??= [];
      if (!index[source.book].includes(node.id)) {
        index[source.book].push(node.id);
      }
    }
  }
  return index;
}

export function buildNodeIndex(nodes: GraphNode[]): Record<string, GraphNode> {
  return Object.fromEntries(nodes.map((node) => [node.id, node]));
}

export function bookTitle(books: Book[], id: string): string {
  return books.find((book) => book.id === id)?.title ?? id;
}
