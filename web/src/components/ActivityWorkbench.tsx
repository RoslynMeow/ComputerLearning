import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { SubjectContent } from "../data/types";

export type ActivityKind = "lab" | "exercise";

export type ActivityItem = {
  id: string;
  title: string;
  ku: string;
  kind: ActivityKind;
};

type KuGroup = {
  key: string;
  title: string;
  order: number;
  items: ActivityItem[];
};

type ChapterGroup = {
  key: string;
  title: string;
  order: number;
  kus: KuGroup[];
};

type BookGroup = {
  key: string;
  title: string;
  order: number;
  chapters: ChapterGroup[];
};

type Props = {
  label: string;
  items: ActivityItem[];
  subjects: SubjectContent[];
  activeId: string;
  onSelect: (item: ActivityItem) => void;
  children: ReactNode;
};

function initialNavOpen(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(min-width: 901px)").matches;
}

function isNarrowScreen(): boolean {
  return window.matchMedia("(max-width: 900px)").matches;
}

function itemKindLabel(kind: ActivityKind): string {
  return kind === "lab" ? "实验" : "练习";
}

export function ActivityWorkbench({
  label,
  items,
  subjects,
  activeId,
  onSelect,
  children,
}: Props) {
  const [navOpen, setNavOpen] = useState(initialNavOpen);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<ActivityKind | "all">("all");
  const [openBooks, setOpenBooks] = useState<Set<string>>(() => new Set());
  const [openChapters, setOpenChapters] = useState<Set<string>>(() => new Set());

  const books = useMemo<BookGroup[]>(() => {
    const kuIndex = new Map<
      string,
      {
        bookKey: string;
        bookTitle: string;
        chapterId: string;
        chapterTitle: string;
        chapterOrder: number;
        kuTitle: string;
        kuOrder: number;
      }
    >();
    const chapterOrder = new Map<string, number>();
    let orderCounter = 0;

    for (const subject of subjects) {
      for (const ku of subject.kus) {
        const chapterKey = `${subject.subject}:${ku.chapter}`;
        if (!chapterOrder.has(chapterKey)) {
          chapterOrder.set(chapterKey, orderCounter++);
        }
        kuIndex.set(ku.id, {
          bookKey: subject.subject,
          bookTitle: subject.title,
          chapterId: ku.chapter,
          chapterTitle: ku.chapterTitle,
          chapterOrder: chapterOrder.get(chapterKey) ?? orderCounter,
          kuTitle: ku.title,
          kuOrder: ku.order,
        });
      }
    }

    const bookMap = new Map<string, BookGroup>();
    for (const item of items) {
      const info = kuIndex.get(item.ku);
      const bookKey = info?.bookKey ?? "other";
      const bookTitle = info?.bookTitle ?? "未分类";
      const chapterId = info?.chapterId ?? item.ku.split(".").slice(0, 2).join(".");
      const chapterTitle = info?.chapterTitle ?? chapterId;
      const chapterOrder = info?.chapterOrder ?? 900;
      const kuTitle = info?.kuTitle ?? item.ku;
      const kuOrder = info?.kuOrder ?? 999;

      let book = bookMap.get(bookKey);
      if (!book) {
        book = {
          key: bookKey,
          title: bookTitle,
          order: chapterOrder,
          chapters: [],
        };
        bookMap.set(bookKey, book);
      } else {
        book.order = Math.min(book.order, chapterOrder);
      }

      let chapter = book.chapters.find((entry) => entry.key === chapterId);
      if (!chapter) {
        chapter = {
          key: chapterId,
          title: chapterTitle,
          order: chapterOrder,
          kus: [],
        };
        book.chapters.push(chapter);
      }

      let ku = chapter.kus.find((entry) => entry.key === item.ku);
      if (!ku) {
        ku = {
          key: item.ku,
          title: kuTitle,
          order: kuOrder,
          items: [],
        };
        chapter.kus.push(ku);
      }
      ku.items.push(item);
    }

    return [...bookMap.values()]
      .sort((left, right) => left.order - right.order)
      .map((book) => ({
        ...book,
        chapters: book.chapters
          .sort((left, right) => left.order - right.order)
          .map((chapter) => ({
            ...chapter,
            kus: chapter.kus
              .sort((left, right) => left.order - right.order)
              .map((ku) => ({
                ...ku,
                items: ku.items.sort((left, right) =>
                  left.kind === right.kind
                    ? left.title.localeCompare(right.title, "zh")
                    : left.kind === "lab"
                      ? -1
                      : 1,
                ),
              })),
          })),
      }));
  }, [items, subjects]);

  const labCount = items.filter((item) => item.kind === "lab").length;
  const exerciseCount = items.filter((item) => item.kind === "exercise").length;

  const activePath = useMemo(() => {
    for (const book of books) {
      for (const chapter of book.chapters) {
        if (chapter.kus.some((ku) => ku.items.some((item) => item.id === activeId))) {
          return {
            bookKey: book.key,
            chapterKey: `${book.key}:${chapter.key}`,
          };
        }
      }
    }
    return null;
  }, [books, activeId]);

  useEffect(() => {
    if (!activePath) return;
    setOpenBooks((current) => {
      if (current.has(activePath.bookKey)) return current;
      const next = new Set(current);
      next.add(activePath.bookKey);
      return next;
    });
    setOpenChapters((current) => {
      if (current.has(activePath.chapterKey)) return current;
      const next = new Set(current);
      next.add(activePath.chapterKey);
      return next;
    });
  }, [activePath]);

  const normalizedQuery = query.trim().toLowerCase();
  const filtering = Boolean(normalizedQuery) || kindFilter !== "all";

  const visibleBooks = useMemo(() => {
    return books
      .map((book) => ({
        ...book,
        chapters: book.chapters
          .map((chapter) => ({
            ...chapter,
            kus: chapter.kus
              .map((ku) => ({
                ...ku,
                items: ku.items.filter((item) => {
                  if (kindFilter !== "all" && item.kind !== kindFilter) return false;
                  if (!normalizedQuery) return true;
                  return [book.title, chapter.title, ku.title, item.title]
                    .join(" ")
                    .toLowerCase()
                    .includes(normalizedQuery);
                }),
              }))
              .filter((ku) => ku.items.length > 0),
          }))
          .filter((chapter) => chapter.kus.length > 0),
      }))
      .filter((book) => book.chapters.length > 0);
  }, [books, kindFilter, normalizedQuery]);

  function selectItem(item: ActivityItem) {
    onSelect(item);
    if (isNarrowScreen()) setNavOpen(false);
  }

  function toggleBook(key: string, open: boolean) {
    if (filtering) return;
    setOpenBooks((current) => {
      const next = new Set(current);
      if (open) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function toggleChapter(key: string, open: boolean) {
    if (filtering) return;
    setOpenChapters((current) => {
      const next = new Set(current);
      if (open) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  return (
    <section className="workbench">
      <aside className="workbench-nav" aria-label={`${label}目录`}>
        <details
          className="workbench-nav-shell"
          open={navOpen}
          onToggle={(event) => setNavOpen(event.currentTarget.open)}
        >
          <summary>
            {label}
            <span className="workbench-count">{items.length}</span>
          </summary>

          <div className="workbench-search">
            <input
              type="search"
              value={query}
              placeholder={`搜索${label}…`}
              aria-label={`搜索${label}`}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="workbench-filters" role="group" aria-label={`${label}筛选`}>
            <button
              type="button"
              className={kindFilter === "all" ? "active" : ""}
              onClick={() => setKindFilter("all")}
            >
              全部 <span>{items.length}</span>
            </button>
            <button
              type="button"
              className={kindFilter === "lab" ? "active" : ""}
              onClick={() => setKindFilter("lab")}
            >
              实验 <span>{labCount}</span>
            </button>
            <button
              type="button"
              className={kindFilter === "exercise" ? "active" : ""}
              onClick={() => setKindFilter("exercise")}
            >
              练习 <span>{exerciseCount}</span>
            </button>
          </div>

          <div className="workbench-groups">
            {visibleBooks.map((book) => (
              <details
                key={book.key}
                className="workbench-book"
                open={filtering ? true : openBooks.has(book.key)}
                onToggle={(event) => toggleBook(book.key, event.currentTarget.open)}
              >
                <summary>{book.title}</summary>
                {book.chapters.map((chapter) => {
                  const chapterKey = `${book.key}:${chapter.key}`;
                  return (
                    <details
                      key={chapterKey}
                      className="workbench-chapter"
                      open={filtering ? true : openChapters.has(chapterKey)}
                      onToggle={(event) =>
                        toggleChapter(chapterKey, event.currentTarget.open)
                      }
                    >
                      <summary>{chapter.title}</summary>
                      <div className="workbench-kus">
                        {chapter.kus.map((ku) => (
                          <div key={ku.key} className="workbench-ku">
                            <p className="workbench-ku-title">{ku.title}</p>
                            <ul className="workbench-items">
                              {ku.items.map((item) => (
                                <li key={item.id}>
                                  <button
                                    type="button"
                                    className={item.id === activeId ? "active" : ""}
                                    aria-current={item.id === activeId ? "true" : undefined}
                                    onClick={() => selectItem(item)}
                                  >
                                    <span className={`workbench-kind ${item.kind}`}>
                                      {itemKindLabel(item.kind)}
                                    </span>
                                    <strong>{item.title}</strong>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </details>
                  );
                })}
              </details>
            ))}

            {visibleBooks.length === 0 && (
              <p className="workbench-empty">没有匹配的{label}。</p>
            )}
          </div>
        </details>
      </aside>

      <main className="workbench-main">{children}</main>
    </section>
  );
}
