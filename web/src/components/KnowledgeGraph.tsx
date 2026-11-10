import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import type { Book, GraphData, GraphNode } from "../graph/types";
import {
  bookTitle,
  buildBookIndex,
  buildNodeIndex,
  layoutGraph,
  pointsPath,
} from "../graph/utils";

type Props = {
  selectedKuId: string | null;
  onSelectKu: (id: string) => void;
  onOpenContent: (id: string) => void;
  onOpenLab: (id: string) => void;
  onOpenExercise: (id: string) => void;
};

export function KnowledgeGraph({
  selectedKuId,
  onSelectKu,
  onOpenContent,
  onOpenLab,
  onOpenExercise,
}: Props) {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [bookFilter, setBookFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
    pointerId: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [graphResponse, booksResponse] = await Promise.all([
          fetch("/data/graph.json"),
          fetch("/data/bibliography.json"),
        ]);
        if (!graphResponse.ok) throw new Error("图谱数据未生成");
        const graphData = (await graphResponse.json()) as GraphData;
        const bookData = booksResponse.ok ? ((await booksResponse.json()) as Book[]) : [];
        if (!cancelled) {
          setGraph(graphData);
          setBooks(bookData);
        }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : String(reason));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const layout = useMemo(
    () => (graph ? layoutGraph(graph.nodes, graph.edges) : null),
    [graph],
  );
  const nodeIndex = useMemo(
    () => (graph ? buildNodeIndex(graph.nodes) : ({} as Record<string, GraphNode>)),
    [graph],
  );
  const bookIndex = useMemo(
    () => (graph ? buildBookIndex(graph.nodes) : ({} as Record<string, string[]>)),
    [graph],
  );

  if (error) {
    return (
      <section className="player">
        <h2>图谱还没生成</h2>
        <p>
          先运行 <code>npm run validate</code>，再刷新页面。数据会同步到
          <code> web/public/data</code>。
        </p>
      </section>
    );
  }

  if (!graph || !layout) {
    return <p className="pdf-status">正在加载知识图谱…</p>;
  }

  const selected = selectedKuId ? nodeIndex[selectedKuId] : graph.nodes[0];
  const highlightIds = bookFilter === "all" ? [] : bookIndex[bookFilter] ?? [];
  const booksWithNodes = books.filter((book) => (bookIndex[book.id]?.length ?? 0) > 0);
  const prerequisiteEdges = graph.edges.filter((edge) => edge.kind === "prerequisite");

  function relatedTitles(ids: string[]): string {
    return ids
      .map((id) => nodeIndex[id]?.title ?? id)
      .join("、");
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const target = event.target as Element;
    if (target.closest(".graph-node")) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: canvas.scrollLeft,
      scrollTop: canvas.scrollTop,
      pointerId: event.pointerId,
    };
    setDragging(true);
    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;
    canvas.scrollLeft = drag.scrollLeft - (event.clientX - drag.startX);
    canvas.scrollTop = drag.scrollTop - (event.clientY - drag.startY);
  }

  function endDrag(_event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;
    if (canvas.hasPointerCapture(drag.pointerId)) {
      canvas.releasePointerCapture(drag.pointerId);
    }
    dragRef.current = null;
    setDragging(false);
  }

  return (
    <section className="graph-page">
      <div className="graph-toolbar">
        <span className="graph-stats">
          {graph.nodes.length} 个知识点 · {prerequisiteEdges.length} 条先修 · {booksWithNodes.length} 本书
        </span>
        <label className="graph-filter">
          按书目反查
          <select value={bookFilter} onChange={(event) => setBookFilter(event.target.value)}>
            <option value="all">全部</option>
            {booksWithNodes.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}（{bookIndex[book.id].length}）
              </option>
            ))}
          </select>
        </label>
        <span className="graph-legend">
          <span className="legend-line solid" /> 先修
          <span className="legend-line dashed" /> 相关
        </span>
        <span className="graph-hint">拖动查看</span>
      </div>

      <div className="graph-layout">
        <div
          ref={canvasRef}
          className={`graph-canvas${dragging ? " dragging" : ""}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <svg
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            width={layout.width}
            height={layout.height}
            role="img"
            aria-label="知识点先修关系图"
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#8a6a3b" />
              </marker>
            </defs>

            {layout.clusters.map((cluster) => (
              <g key={cluster.id} className="graph-cluster">
                <rect
                  x={cluster.x}
                  y={cluster.y}
                  width={cluster.width}
                  height={cluster.height}
                  rx={16}
                />
                <text
                  x={cluster.x + 16}
                  y={cluster.y + 24}
                  className="graph-cluster-title"
                >
                  {cluster.title}
                </text>
              </g>
            ))}

            {layout.edges.map((edge, index) => {
              const path = pointsPath(edge.points);
              if (!path) return null;
              return (
                <path
                  key={`${edge.kind}-${edge.from}-${edge.to}-${index}`}
                  d={path}
                  className={edge.kind === "prerequisite" ? "graph-edge prerequisite" : "graph-edge related"}
                  markerEnd={edge.kind === "prerequisite" ? "url(#arrow)" : undefined}
                />
              );
            })}

            {graph.nodes.map((node) => {
              const position = layout.nodes[node.id];
              if (!position) return null;
              const isSelected = selected?.id === node.id;
              const isHighlighted = highlightIds.includes(node.id);
              return (
                <g
                  key={node.id}
                  className={`graph-node${isSelected ? " selected" : ""}${isHighlighted ? " highlight" : ""}`}
                  onClick={() => onSelectKu(node.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectKu(node.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={node.title}
                >
                  <rect
                    x={position.x}
                    y={position.y}
                    width={position.width}
                    height={position.height}
                    rx={10}
                  />
                  <text x={position.x + 14} y={position.y + 24} className="graph-node-title">
                    {node.order}. {node.title}
                  </text>
                  <text x={position.x + 14} y={position.y + 44} className="graph-node-id">
                    {node.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <aside className="graph-details">
          {selected ? (
            <>
              <p className="eyebrow">{selected.chapterTitle}</p>
              <h3>{selected.title}</h3>
              <p className="graph-id">{selected.id}</p>

              <h4>来源</h4>
              <ul>
                {selected.sources.map((source, index) => (
                  <li key={`${source.book}-${index}`}>
                    {bookTitle(books, source.book)}
                    {source.edition ? `，${source.edition} 版` : ""}
                    {source.chapter ? `，第 ${source.chapter} 章` : ""}
                    {source.section ? `，${source.section} 节` : ""}
                  </li>
                ))}
              </ul>

              <h4>实验 / 练习</h4>
              <p className="graph-tags">
                {selected.labs.map((lab) => (
                  <code key={lab}>{lab}</code>
                ))}
                {selected.exercises.map((exercise) => (
                  <code key={exercise}>{exercise}</code>
                ))}
              </p>

              <h4>先修 / 相关</h4>
              <p className="graph-links">
                {selected.prerequisites.length > 0
                  ? `先修：${relatedTitles(selected.prerequisites)}`
                  : "无先修"}
              </p>
              {selected.related.length > 0 && (
                <p className="graph-links">相关：{relatedTitles(selected.related)}</p>
              )}

              <div className="graph-actions">
                <button type="button" onClick={() => onOpenContent(selected.id)}>
                  打开阅读
                </button>
                <button
                  type="button"
                  disabled={selected.labs.length === 0}
                  onClick={() => onOpenLab(selected.id)}
                >
                  打开实验
                </button>
                <button
                  type="button"
                  disabled={selected.exercises.length === 0}
                  onClick={() => onOpenExercise(selected.id)}
                >
                  打开练习
                </button>
              </div>
            </>
          ) : (
            <p>选择一个知识点查看详情。</p>
          )}

          {bookFilter !== "all" && (
            <div className="graph-book-results">
              <h4>引用《{bookTitle(books, bookFilter)}》的知识点</h4>
              <ul>
                {(bookIndex[bookFilter] ?? []).map((id) => (
                  <li key={id}>
                    <button type="button" className="link" onClick={() => onSelectKu(id)}>
                      {nodeIndex[id]?.title ?? id}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
