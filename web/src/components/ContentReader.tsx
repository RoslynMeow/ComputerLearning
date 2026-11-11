import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { ContentKu, SubjectContent } from "../data/types";
import { getExercisesForKu } from "../exercises/registry";
import { getLabsForKu } from "../labs/registry";
import { ExercisePlayer } from "./ExercisePlayer";
import { ExperimentPlayer } from "./ExperimentPlayer";

export type ActivityKind = "lab" | "exercise";

type Props = {
  subjects: SubjectContent[];
  activeKuId: string | null;
  initialActivity: ActivityKind | null;
  onKuChange: (id: string) => void;
};

type TocChapter = {
  id: string;
  title: string;
  kus: ContentKu[];
};

type TocBook = {
  id: string;
  title: string;
  subject: SubjectContent;
  chapters: TocChapter[];
};

function buildTocBooks(subjects: SubjectContent[]): TocBook[] {
  return subjects.map((subject) => {
    const chapters: TocChapter[] = [];
    for (const ku of subject.kus) {
      let chapter = chapters.find((item) => item.id === ku.chapter);
      if (!chapter) {
        chapter = { id: ku.chapter, title: ku.chapterTitle, kus: [] };
        chapters.push(chapter);
      }
      chapter.kus.push(ku);
    }
    return { id: subject.subject, title: subject.title, subject, chapters };
  });
}

function initialTocOpen(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(min-width: 761px)").matches;
}

const TOC_WIDTH_KEY = "computer-learning.toc-width";
const DEFAULT_TOC_WIDTH = 25;
const MIN_TOC_WIDTH = 15;
const MAX_TOC_WIDTH = 50;

function clampTocWidth(value: number): number {
  return Math.min(MAX_TOC_WIDTH, Math.max(MIN_TOC_WIDTH, Math.round(value * 10) / 10));
}

function initialTocWidth(): number {
  if (typeof window === "undefined") return DEFAULT_TOC_WIDTH;
  const stored = Number(window.localStorage.getItem(TOC_WIDTH_KEY));
  return Number.isFinite(stored) && stored > 0
    ? clampTocWidth(stored)
    : DEFAULT_TOC_WIDTH;
}

export function ContentReader({
  subjects,
  activeKuId,
  initialActivity,
  onKuChange,
}: Props) {
  const [html, setHtml] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const [activityKind, setActivityKind] = useState<ActivityKind | null>(null);
  const [tocOpen, setTocOpen] = useState(initialTocOpen);
  const [tocWidth, setTocWidth] = useState(initialTocWidth);
  const [resizing, setResizing] = useState(false);
  const [openBooks, setOpenBooks] = useState<Set<string>>(() => new Set());
  const [openChapters, setOpenChapters] = useState<Set<string>>(() => new Set());
  const contentRef = useRef<HTMLElement | null>(null);
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const resizingRef = useRef(false);
  const pendingHeadingRef = useRef<string | null>(null);

  const tocBooks = useMemo(() => buildTocBooks(subjects), [subjects]);

  const activeEntry = useMemo(() => {
    for (const book of tocBooks) {
      for (const chapter of book.chapters) {
        const ku = chapter.kus.find((item) => item.id === activeKuId);
        if (ku) return { book, chapter, ku };
      }
    }
    const firstBook = tocBooks[0];
    const firstChapter = firstBook?.chapters[0];
    const firstKu = firstChapter?.kus[0];
    if (firstBook && firstChapter && firstKu) {
      return { book: firstBook, chapter: firstChapter, ku: firstKu };
    }
    return null;
  }, [tocBooks, activeKuId]);

  const activeKu = activeEntry?.ku ?? null;
  const toc = activeKu?.toc ?? [];
  const labs = activeKu ? getLabsForKu(activeKu.id) : [];
  const exercises = activeKu ? getExercisesForKu(activeKu.id) : [];
  const hasActivities = labs.length + exercises.length > 0;
  const activeChapterKey = activeEntry
    ? `${activeEntry.book.id}:${activeEntry.chapter.id}`
    : null;

  useEffect(() => {
    if (!activeEntry || !activeChapterKey) return;
    setOpenBooks((current) => {
      if (current.has(activeEntry.book.id)) return current;
      const next = new Set(current);
      next.add(activeEntry.book.id);
      return next;
    });
    setOpenChapters((current) => {
      if (current.has(activeChapterKey)) return current;
      const next = new Set(current);
      next.add(activeChapterKey);
      return next;
    });
  }, [activeChapterKey, activeEntry?.book.id]);

  useEffect(() => {
    if (!initialActivity) {
      setActivityKind(null);
      return;
    }
    if (initialActivity === "lab") {
      setActivityKind(labs.length > 0 ? "lab" : null);
    } else {
      setActivityKind(exercises.length > 0 ? "exercise" : null);
    }
  }, [activeKu?.id, initialActivity]);

  useEffect(() => {
    if (activityKind || !pendingHeadingRef.current) return;
    const id = pendingHeadingRef.current;
    pendingHeadingRef.current = null;
    requestAnimationFrame(() => {
      const element = document.getElementById(id);
      if (!element) return;
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveHeading(id);
    });
  }, [activityKind]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(TOC_WIDTH_KEY, String(tocWidth));
      } catch {
        // Storage may be unavailable in private browsing.
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [tocWidth]);

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
        const article = contentRef.current;
        if (article) article.scrollTop = 0;
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

  useEffect(() => {
    if (activityKind) {
      setActiveHeading(null);
      return;
    }
    if (!toc.length) {
      setActiveHeading(null);
      return;
    }
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (!headings.length) return;

    setActiveHeading(headings[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              left.boundingClientRect.top - right.boundingClientRect.top,
          );
        if (visible[0]) setActiveHeading(visible[0].target.id);
      },
      {
        root: contentRef.current,
        rootMargin: "-8px 0px -68% 0px",
        threshold: 0,
      },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [html, toc, activityKind]);

  if (!activeKu) {
    return <p className="reader-status">没有可展示的内容。</p>;
  }

  function jumpTo(id: string) {
    if (activityKind) {
      pendingHeadingRef.current = id;
      setActivityKind(null);
    } else {
      const element = document.getElementById(id);
      if (!element) return;
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveHeading(id);
    }
    if (window.matchMedia("(max-width: 760px)").matches) {
      setTocOpen(false);
    }
  }

  function toggleActivity() {
    if (activityKind) {
      setActivityKind(null);
      return;
    }
    const next: ActivityKind = labs.length > 0 ? "lab" : "exercise";
    setActivityKind(next);
    setActiveHeading(null);
    contentRef.current?.scrollTo({ top: 0 });
    if (window.matchMedia("(max-width: 760px)").matches) {
      setTocOpen(false);
    }
  }

  function switchActivity(kind: ActivityKind) {
    setActivityKind(kind);
    contentRef.current?.scrollTo({ top: 0 });
  }

  function setBookState(id: string, open: boolean) {
    setOpenBooks((current) => {
      const next = new Set(current);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function setChapterState(key: string, open: boolean) {
    setOpenChapters((current) => {
      const next = new Set(current);
      if (open) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function onResizerPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    resizingRef.current = true;
    setResizing(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function onResizerPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!resizingRef.current) return;
    const layout = layoutRef.current;
    if (!layout) return;
    const rect = layout.getBoundingClientRect();
    setTocWidth(clampTocWidth(((event.clientX - rect.left) / rect.width) * 100));
  }

  function onResizerPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!resizingRef.current) return;
    resizingRef.current = false;
    setResizing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function onResizerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const delta = event.key === "ArrowLeft" ? -2 : 2;
      setTocWidth((current) => clampTocWidth(current + delta));
    }
    if (event.key === "Home") {
      event.preventDefault();
      setTocWidth(DEFAULT_TOC_WIDTH);
    }
  }

  return (
    <section className="reader">
      {loading && <p className="reader-status">正在加载内容…</p>}
      {error && <p className="reader-status error">内容加载失败：{error}</p>}

      <div
        ref={layoutRef}
        className="reader-layout"
        style={{ "--toc-width": `${tocWidth}%` } as CSSProperties}
      >
        <aside className="reader-toc" aria-label="目录">
          <details
            className="reader-toc-shell"
            open={tocOpen}
            onToggle={(event) => setTocOpen(event.currentTarget.open)}
          >
            <summary>目录</summary>
            <div className="reader-toc-tree">
              {tocBooks.map((book) => (
                <details
                  key={book.id}
                  className="reader-toc-book"
                  open={openBooks.has(book.id)}
                  onToggle={(event) => setBookState(book.id, event.currentTarget.open)}
                >
                  <summary>{book.title}</summary>
                  <a
                    className="reader-toc-pdf"
                    href={book.subject.pdf}
                    target="_blank"
                    rel="noreferrer"
                  >
                    下载 PDF
                  </a>
                  {book.chapters.map((chapter) => {
                    const chapterKey = `${book.id}:${chapter.id}`;
                    return (
                      <details
                        key={chapterKey}
                        className="reader-toc-chapter"
                        open={openChapters.has(chapterKey)}
                        onToggle={(event) =>
                          setChapterState(chapterKey, event.currentTarget.open)
                        }
                      >
                        <summary>{chapter.title}</summary>
                        <ul className="reader-toc-kus">
                          {chapter.kus.map((ku) => (
                            <li key={ku.id}>
                              <button
                                type="button"
                                className={ku.id === activeKu.id ? "active" : ""}
                                aria-current={ku.id === activeKu.id ? "true" : undefined}
                                onClick={() => {
                                  setActivityKind(null);
                                  onKuChange(ku.id);
                                  if (window.matchMedia("(max-width: 760px)").matches) {
                                    setTocOpen(false);
                                  }
                                }}
                              >
                                <span className="reader-toc-order">{ku.order}.</span>
                                {ku.title}
                              </button>
                              {ku.id === activeKu.id && (toc.length > 0 || hasActivities) && (
                                <ul className="reader-toc-sections">
                                  {toc.map((item) => (
                                    <li key={item.id}>
                                      <button
                                        type="button"
                                        className={
                                          !activityKind && item.id === activeHeading
                                            ? "active"
                                            : ""
                                        }
                                        aria-current={
                                          !activityKind && item.id === activeHeading
                                            ? "true"
                                            : undefined
                                        }
                                        onClick={() => jumpTo(item.id)}
                                      >
                                        {item.text}
                                      </button>
                                    </li>
                                  ))}
                                  {hasActivities && (
                                    <li className="reader-toc-activity">
                                      <button
                                        type="button"
                                        className={activityKind ? "active" : ""}
                                        aria-current={activityKind ? "true" : undefined}
                                        onClick={toggleActivity}
                                      >
                                        实验与练习
                                        <span className="reader-toc-badge">
                                          {labs.length + exercises.length}
                                        </span>
                                      </button>
                                    </li>
                                  )}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      </details>
                    );
                  })}
                </details>
              ))}
            </div>
          </details>
        </aside>

        <div
          className={`reader-resizer${resizing ? " dragging" : ""}`}
          role="separator"
          aria-label="调整目录宽度"
          aria-orientation="vertical"
          aria-valuemin={MIN_TOC_WIDTH}
          aria-valuemax={MAX_TOC_WIDTH}
          aria-valuenow={Math.round(tocWidth)}
          tabIndex={0}
          title="拖动调整目录宽度，双击恢复默认"
          onPointerDown={onResizerPointerDown}
          onPointerMove={onResizerPointerMove}
          onPointerUp={onResizerPointerUp}
          onPointerCancel={onResizerPointerUp}
          onDoubleClick={() => setTocWidth(DEFAULT_TOC_WIDTH)}
          onKeyDown={onResizerKeyDown}
        />

        {activityKind ? (
          <div
            ref={(element) => {
              contentRef.current = element;
            }}
            className="reader-content reader-activity"
          >
            <header className="reader-activity-header">
              <div>
                <p className="eyebrow">{activeKu.chapterTitle} · 实验与练习</p>
                <h3>{activeKu.title}</h3>
              </div>
              {labs.length > 0 && exercises.length > 0 && (
                <div
                  className="reader-activity-switch"
                  role="group"
                  aria-label="切换实验和练习"
                >
                  <button
                    type="button"
                    className={activityKind === "lab" ? "active" : ""}
                    onClick={() => switchActivity("lab")}
                  >
                    实验 <span>{labs.length}</span>
                  </button>
                  <button
                    type="button"
                    className={activityKind === "exercise" ? "active" : ""}
                    onClick={() => switchActivity("exercise")}
                  >
                    练习 <span>{exercises.length}</span>
                  </button>
                </div>
              )}
            </header>

            <div className="reader-activity-body">
              {activityKind === "lab"
                ? labs.map((lab) => <ExperimentPlayer key={lab.id} lab={lab} />)
                : exercises.map((exercise) => (
                    <ExercisePlayer key={exercise.id} exercise={exercise} />
                  ))}
            </div>
          </div>
        ) : (
          <article
            ref={(element) => {
              contentRef.current = element;
            }}
            className="reader-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </section>
  );
}
