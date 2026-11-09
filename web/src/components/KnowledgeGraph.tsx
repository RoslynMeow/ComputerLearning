import { useEffect, useMemo, useState } from "react";
import type { Book, GraphData, GraphNode } from "../graph/types";
import {
  bookTitle,
  buildBookIndex,
  buildNodeIndex,
  edgePath,
  layoutNodes,
} from "../graph/utils";

type Props = {
  selectedKuId: string | null;
  onSelectKu: (id: string) => void;
  onOpenPdf: (id: string) => void;
  onOpenLab: (id: string) => void;
  onOpenExercise: (id: string) => void;
};

export function KnowledgeGraph({
  selectedKuId,
  onSelectKu,
  onOpenPdf,
  onOpenLab,
  onOpenExercise,
}: Props) {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [bookFilter, setBookFilter] = useState("all");
  const [showRelated, setShowRelated] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const layout = useMemo(() => (graph ? layoutNodes(graph.nodes) : null), [graph]);
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
  const visibleEdges = graph.edges.filter(
    (edge) => edge.kind === "prerequisite" || showRelated,
  );

  function relatedTitles(ids: string[]): string {
    return ids
      .map((id) => nodeIndex[id]?.title ?? id)
      .join("、");
  }

  return (
    <section className="graph-page">
      <header className="graph-header">
        <div>
          <p className="eyebrow">knowledge graph</p>
          <h2>知识图谱与书目反查</h2>
          <p>
            {graph.nodes.length} 个知识点，{prerequisiteEdges.length} 条先修边，
            {booksWithNodes.length} 本被引用的书。
          </p>
        </div>
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
        <label className="graph-toggle">
          <input
            type="checkbox"
            checked={showRelated}
            onChange={(event) => setShowRelated(event.target.checked)}
          />
          显示相关边
        </label>
      </header>

      <div className="graph-layout">
        <div className="graph-canvas">
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

            {layout.groups.map((group) => (
              <text key={group.id} className="graph-chapter" x={group.x} y={28}>
                {group.title}
              </text>
            ))}

            {visibleEdges.map((edge) => {
              const path = edgePath(edge.from, edge.to, layout.positions);
              if (!path) return null;
              return (
                <path
                  key={`${edge.kind}-${edge.from}-${edge.to}`}
                  d={path}
                  className={edge.kind === "prerequisite" ? "graph-edge prerequisite" : "graph-edge related"}
                  markerEnd={edge.kind === "prerequisite" ? "url(#arrow)" : undefined}
                />
              );
            })}

            {graph.nodes.map((node) => {
              const position = layout.positions[node.id];
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
                <button type="button" onClick={() => onOpenPdf(selected.id)}>
                  打开 PDF
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
