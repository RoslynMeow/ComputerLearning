import type { Book, GraphEdge, GraphNode } from "./types";

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

export type ClusterPosition = {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LaidOutEdge = {
  from: string;
  to: string;
  kind: GraphEdge["kind"];
  points: { x: number; y: number }[];
};

export type GraphLayout = {
  width: number;
  height: number;
  nodes: Record<string, NodePosition>;
  clusters: ClusterPosition[];
  edges: LaidOutEdge[];
};

const NODE_WIDTH = 230;
const NODE_HEIGHT = 56;
const NODE_GAP = 46;
const BOX_PADDING = 32;
const LABEL_SPACE = 38;
const COLUMN_GAP = 140;
const LEFT_PADDING = 24;
const TOP_PADDING = 24;
const BOTTOM_PADDING = 24;

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

export function layoutGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
): GraphLayout {
  const chapters = groupByChapter(nodes);
  const chapterIndex = new Map(chapters.map((chapter, index) => [chapter.id, index]));
  const nodeChapter = new Map(nodes.map((node) => [node.id, node.chapter]));
  const nodeOrder = new Map(nodes.map((node) => [node.id, node.order]));

  const groupX: number[] = [];
  let cursorX = LEFT_PADDING;
  for (const _chapter of chapters) {
    groupX.push(cursorX);
    cursorX += NODE_WIDTH + BOX_PADDING * 2 + COLUMN_GAP;
  }

  const nodePositions: Record<string, NodePosition> = {};
  const clusters: ClusterPosition[] = [];

  chapters.forEach((chapter, index) => {
    const x = groupX[index];
    const y = TOP_PADDING;
    const width = NODE_WIDTH + BOX_PADDING * 2;
    const height =
      LABEL_SPACE +
      chapter.nodes.length * NODE_HEIGHT +
      Math.max(0, chapter.nodes.length - 1) * NODE_GAP +
      BOX_PADDING;
    clusters.push({
      id: chapter.id,
      title: chapter.title,
      x,
      y,
      width,
      height,
    });
    chapter.nodes.forEach((node, row) => {
      nodePositions[node.id] = {
        x: x + BOX_PADDING,
        y: y + LABEL_SPACE + row * (NODE_HEIGHT + NODE_GAP),
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      };
    });
  });

  const laidOutEdges: LaidOutEdge[] = edges.map((edge, index) => {
    const source = nodePositions[edge.from];
    const target = nodePositions[edge.to];
    if (!source || !target) {
      return { ...edge, points: [] };
    }

    const sourceChapter = nodeChapter.get(edge.from);
    const targetChapter = nodeChapter.get(edge.to);
    const sameChapter = sourceChapter === targetChapter;
    const sourceCenterY = source.y + source.height / 2;
    const targetCenterY = target.y + target.height / 2;

    if (sameChapter) {
      const isAdjacent =
        nodeOrder.get(edge.from) !== undefined &&
        nodeOrder.get(edge.to) === (nodeOrder.get(edge.from) ?? 0) + 1;

      if (edge.kind === "prerequisite" && isAdjacent) {
        return {
          ...edge,
          points: [
            { x: source.x + source.width / 2, y: source.y + source.height },
            { x: target.x + target.width / 2, y: target.y },
          ],
        };
      }

      if (edge.kind === "prerequisite") {
        const laneX = source.x - 10 - (index % 3) * 8;
        return {
          ...edge,
          points: [
            { x: source.x, y: sourceCenterY },
            { x: laneX, y: sourceCenterY },
            { x: laneX, y: targetCenterY },
            { x: target.x, y: targetCenterY },
          ],
        };
      }

      const laneX = source.x + source.width + 10 + (index % 3) * 8;
      return {
        ...edge,
        points: [
          { x: source.x + source.width, y: sourceCenterY },
          { x: laneX, y: sourceCenterY },
          { x: laneX, y: targetCenterY },
          { x: target.x + target.width, y: targetCenterY },
        ],
      };
    }

    const sourceGroupIndex = chapterIndex.get(sourceChapter ?? "") ?? 0;
    const targetGroupIndex = chapterIndex.get(targetChapter ?? "") ?? 0;
    const forward = sourceGroupIndex < targetGroupIndex;
    const sourceCluster = clusters[sourceGroupIndex];
    const targetCluster = clusters[targetGroupIndex];
    if (!sourceCluster || !targetCluster) {
      return { ...edge, points: [] };
    }

    const midX = forward
      ? sourceCluster.x + sourceCluster.width + COLUMN_GAP / 2 + (index % 3) * 8
      : targetCluster.x + targetCluster.width + COLUMN_GAP / 2 + (index % 3) * 8;

    const start = forward
      ? { x: source.x + source.width, y: sourceCenterY }
      : { x: source.x, y: sourceCenterY };
    const end = forward
      ? { x: target.x, y: targetCenterY }
      : { x: target.x + target.width, y: targetCenterY };

    return {
      ...edge,
      points: [
        start,
        { x: midX, y: start.y },
        { x: midX, y: end.y },
        end,
      ],
    };
  });

  return {
    width: cursorX - COLUMN_GAP + LEFT_PADDING,
    height:
      TOP_PADDING +
      Math.max(...clusters.map((cluster) => cluster.height), 0) +
      BOTTOM_PADDING,
    nodes: nodePositions,
    clusters,
    edges: laidOutEdges,
  };
}

export function pointsPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
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
