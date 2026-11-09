import dagre from "@dagrejs/dagre";
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
  const chapterOf = new Map(nodes.map((node) => [node.id, node.chapter]));

  type GroupLayout = ChapterGroup & {
    width: number;
    height: number;
    positions: Record<string, NodePosition>;
    groupEdges: LaidOutEdge[];
    x: number;
    y: number;
  };

  const groups: GroupLayout[] = [];

  for (const chapter of chapters) {
    const nodeIds = new Set(chapter.nodes.map((node) => node.id));
    const chapterEdges = edges.filter(
      (edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to),
    );
    const graph = new dagre.graphlib.Graph({ multigraph: true });
    graph.setGraph({
      rankdir: "TB",
      nodesep: 30,
      ranksep: 55,
      marginx: 0,
      marginy: 0,
    });
    graph.setDefaultEdgeLabel(() => ({}));

    for (const node of chapter.nodes) {
      graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }

    chapterEdges.forEach((edge, index) => {
      graph.setEdge(
        edge.from,
        edge.to,
        {
          kind: edge.kind,
          constraint: edge.kind === "prerequisite",
          weight: edge.kind === "prerequisite" ? 1 : 0,
        },
        `${edge.kind}-${index}`,
      );
    });

    dagre.layout(graph);

    const raw: Record<string, NodePosition> = {};
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of chapter.nodes) {
      const position = graph.node(node.id) as NodePosition | undefined;
      if (!position) continue;
      const box = {
        x: position.x - position.width / 2,
        y: position.y - position.height / 2,
        width: position.width,
        height: position.height,
      };
      raw[node.id] = box;
      minX = Math.min(minX, box.x);
      minY = Math.min(minY, box.y);
      maxX = Math.max(maxX, box.x + box.width);
      maxY = Math.max(maxY, box.y + box.height);
    }

    if (!Number.isFinite(minX)) {
      groups.push({
        ...chapter,
        width: 0,
        height: 0,
        positions: {},
        groupEdges: [],
        x: 0,
        y: 0,
      });
      continue;
    }

    const positions: Record<string, NodePosition> = {};
    for (const [id, box] of Object.entries(raw)) {
      positions[id] = {
        ...box,
        x: box.x - minX,
        y: box.y - minY,
      };
    }

    const groupEdges = graph.edges().map((edge) => {
      const data = graph.edge(edge) as
        | { kind: GraphEdge["kind"]; points?: { x: number; y: number }[] }
        | undefined;
      return {
        from: edge.v,
        to: edge.w,
        kind: data?.kind ?? "related",
        points: (data?.points ?? []).map((point) => ({
          x: point.x - minX,
          y: point.y - minY,
        })),
      };
    });

    groups.push({
      ...chapter,
      width: maxX - minX,
      height: maxY - minY,
      positions,
      groupEdges,
      x: 0,
      y: 0,
    });
  }

  const leftPadding = 24;
  const topPadding = 24;
  const bottomPadding = 24;
  const columnGap = 120;
  const boxPadding = 24;
  const labelSpace = 38;

  let columnX = leftPadding;
  let maxHeight = 0;
  for (const group of groups) {
    group.x = columnX;
    group.y = topPadding;
    columnX += group.width + boxPadding * 2 + columnGap;
    maxHeight = Math.max(maxHeight, group.height + labelSpace + boxPadding);
  }

  const groupById = new Map(groups.map((group) => [group.id, group]));
  const nodePositions: Record<string, NodePosition> = {};
  const clusters: ClusterPosition[] = [];

  for (const group of groups) {
    clusters.push({
      id: group.id,
      title: group.title,
      x: group.x,
      y: group.y,
      width: group.width + boxPadding * 2,
      height: group.height + labelSpace + boxPadding,
    });
    for (const [id, box] of Object.entries(group.positions)) {
      nodePositions[id] = {
        ...box,
        x: group.x + boxPadding + box.x,
        y: group.y + labelSpace + box.y,
      };
    }
  }

  const laidOutEdges: LaidOutEdge[] = [];

  for (const group of groups) {
    for (const edge of group.groupEdges) {
      laidOutEdges.push({
        ...edge,
        points: edge.points.map((point) => ({
          x: point.x + group.x + boxPadding,
          y: point.y + group.y + labelSpace,
        })),
      });
    }
  }

  for (const edge of edges) {
    const sourceChapter = chapterOf.get(edge.from);
    const targetChapter = chapterOf.get(edge.to);
    if (!sourceChapter || !targetChapter || sourceChapter === targetChapter) {
      continue;
    }
    const source = nodePositions[edge.from];
    const target = nodePositions[edge.to];
    const sourceGroup = groupById.get(sourceChapter);
    const targetGroup = groupById.get(targetChapter);
    if (!source || !target || !sourceGroup || !targetGroup) continue;

    const sourceRight = sourceGroup.x + sourceGroup.width + boxPadding * 2;
    const targetRight = targetGroup.x + targetGroup.width + boxPadding * 2;
    const sourceCenterY = source.y + source.height / 2;
    const targetCenterY = target.y + target.height / 2;
    const forward = sourceGroup.x < targetGroup.x;
    const start = forward
      ? { x: source.x + source.width, y: sourceCenterY }
      : { x: source.x, y: sourceCenterY };
    const end = forward
      ? { x: target.x, y: targetCenterY }
      : { x: target.x + target.width, y: targetCenterY };
    const midX = forward
      ? sourceRight + columnGap / 2
      : targetRight + columnGap / 2;
    laidOutEdges.push({
      ...edge,
      points: [
        start,
        { x: midX, y: start.y },
        { x: midX, y: end.y },
        end,
      ],
    });
  }

  const width =
    Math.max(
      leftPadding,
      ...clusters.map((cluster) => cluster.x + cluster.width),
    ) + leftPadding;
  const height =
    Math.max(topPadding, ...clusters.map((cluster) => cluster.y + cluster.height)) +
    bottomPadding;

  return {
    width,
    height,
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

