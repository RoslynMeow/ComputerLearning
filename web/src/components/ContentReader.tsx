import { useEffect, useMemo, useRef, useState } from "react";
import type { SubjectContent } from "../data/types";

type Props = {
  subject: SubjectContent;
  activeKuId: string | null;
  onKuChange: (id: string) => void;
};

export function ContentReader({ subject, activeKuId, onKuChange }: Props) {
  const [html, setHtml] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLElement | null>(null);

  const activeKu = useMemo(
    () => subject.kus.find((ku) => ku.id === activeKuId) ?? subject.kus[0],
    [subject, activeKuId],
  );
  const index = activeKu ? subject.kus.indexOf(activeKu) : 0;

  useEffect(() => {
    if (!activeKu) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(activeKu.file)
      .then((response) => {
        if (!response.ok) throw new Error("内容未生成");
        return response.text();
      })
      .then((text) => {
        if (cancelled) return;
        setHtml(text);
        setLoading(false);
        contentRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      })
      .catch((reason) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : String(reason));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeKu?.id]);

  if (!activeKu) {
    return <p className="reader-status">没有可展示的内容。</p>;
  }

  function go(delta: number) {
    const next = subject.kus[Math.min(subject.kus.length - 1, Math.max(0, index + delta))];
    if (next) onKuChange(next.id);
  }

  return (
    <section className="reader">
      <div className="reader-toolbar">
        <label>
          知识点
          <select
            value={activeKu.id}
            onChange={(event) => onKuChange(event.target.value)}
          >
            {subject.kus.map((ku) => (
              <option key={ku.id} value={ku.id}>
                {ku.title}
              </option>
            ))}
          </select>
        </label>

        <div className="reader-pager">
          <button type="button" disabled={index <= 0} onClick={() => go(-1)}>
            上一节
          </button>
          <button
            type="button"
            disabled={index >= subject.kus.length - 1}
            onClick={() => go(1)}
          >
            下一节
          </button>
        </div>

        <a className="reader-pdf" href={subject.pdf} target="_blank" rel="noreferrer">
          下载 PDF
        </a>
      </div>

      <p className="reader-breadcrumb">{activeKu.chapterTitle}</p>

      {loading && <p className="reader-status">正在加载内容…</p>}
      {error && <p className="reader-status error">内容加载失败：{error}</p>}

      <article
        ref={contentRef}
        className="reader-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
