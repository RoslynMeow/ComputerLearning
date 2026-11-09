import { useEffect, useMemo, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { SubjectIndex } from "../data/types";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

type Props = {
  subject: SubjectIndex;
  activeKuId: string | null;
  onKuChange: (id: string) => void;
};

export function PdfViewer({ subject, activeKuId, onKuChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const activeKu = useMemo(
    () => subject.kus.find((ku) => ku.id === activeKuId) ?? subject.kus[0],
    [subject, activeKuId],
  );
  const numPages = pdf?.numPages ?? 0;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const task = pdfjsLib.getDocument({ url: subject.pdf });
    task.promise
      .then((document) => {
        if (cancelled) return;
        setPdf(document);
        setPageNumber(activeKu?.page ?? 1);
        setLoading(false);
      })
      .catch((reason) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : String(reason));
        setLoading(false);
      });

    return () => {
      cancelled = true;
      task.destroy();
    };
  }, [subject.pdf]);

  useEffect(() => {
    if (activeKu) setPageNumber(activeKu.page);
  }, [activeKu?.id]);

  useEffect(() => {
    if (!pdf) return;
    const document = pdf;
    let cancelled = false;

    async function renderPage() {
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: zoom });
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      renderTaskRef.current?.cancel();
      const task = page.render({ canvas, viewport });
      renderTaskRef.current = task;
      await task.promise;
    }

    renderPage().catch((reason) => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : String(reason));
    });

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [pdf, pageNumber, zoom]);

  const pageCount = numPages || 1;

  return (
    <section className="pdf-viewer">
      <div className="pdf-toolbar">
        <label>
          知识点
          <select
            value={activeKu?.id ?? ""}
            onChange={(event) => onKuChange(event.target.value)}
          >
            {subject.kus.map((ku) => (
              <option key={ku.id} value={ku.id}>
                {ku.title}
              </option>
            ))}
          </select>
        </label>

        <div className="pdf-pager">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
          >
            上一页
          </button>
          <input
            type="number"
            min={1}
            max={pageCount}
            value={pageNumber}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isInteger(next) && next >= 1 && next <= pageCount) {
                setPageNumber(next);
              }
            }}
          />
          <span>/ {pageCount}</span>
          <button
            type="button"
            disabled={pageNumber >= pageCount}
            onClick={() => setPageNumber((value) => Math.min(pageCount, value + 1))}
          >
            下一页
          </button>
        </div>

        <div className="pdf-zoom">
          <button type="button" onClick={() => setZoom((value) => Math.max(0.6, value - 0.1))}>
            −
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((value) => Math.min(2.2, value + 0.1))}>
            +
          </button>
        </div>
      </div>

      {loading && <p className="pdf-status">正在加载 PDF…</p>}
      {error && <p className="pdf-status error">PDF 加载失败：{error}</p>}

      <div className="pdf-canvas-wrap">
        <canvas ref={canvasRef} />
      </div>

      {activeKu && (
        <p className="pdf-footnote">
          当前：{activeKu.title}（第 {activeKu.page} 页）
        </p>
      )}
    </section>
  );
}
