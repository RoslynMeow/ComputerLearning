import { useEffect, useMemo, useState } from "react";
import { ExercisePlayer } from "./components/ExercisePlayer";
import { PdfViewer } from "./components/PdfViewer";
import type { SubjectIndex, SubjectManifest } from "./data/types";
import { exercises, getExercisesForKu } from "./exercises/registry";

type View = "pdf" | "exercise";

type Route = {
  view: View;
  id: string | null;
};

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [view, ...rest] = raw.split("/");
  const id = rest.join("/") || null;
  if (view === "exercise") return { view: "exercise", id };
  return { view: "pdf", id };
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash());
  const [subjectIndex, setSubjectIndex] = useState<SubjectIndex | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setRoute(parseHash());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPdfAssets() {
      try {
        const manifestResponse = await fetch("/pdfs/index.json");
        if (!manifestResponse.ok) throw new Error("PDF 资源未生成");
        const manifestData = (await manifestResponse.json()) as SubjectManifest[];
        if (cancelled) return;
        if (!manifestData[0]) throw new Error("没有可用的 PDF 主题");
        const indexResponse = await fetch(manifestData[0].index);
        if (!indexResponse.ok) throw new Error("PDF 索引未生成");
        const indexData = (await indexResponse.json()) as SubjectIndex;
        if (!cancelled) setSubjectIndex(indexData);
      } catch (reason) {
        if (!cancelled) {
          setPdfError(reason instanceof Error ? reason.message : String(reason));
        }
      }
    }

    loadPdfAssets();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeExercise = useMemo(() => {
    if (route.view !== "exercise") return exercises[0];
    return exercises.find((exercise) => exercise.id === route.id) ?? exercises[0];
  }, [route]);

  function navigate(view: View, id: string | null) {
    const next = id ? `#/${view}/${id}` : `#/${view}`;
    if (window.location.hash === next) {
      setRoute({ view, id });
    } else {
      window.location.hash = next;
    }
  }

  const activeKuId = route.view === "pdf" ? route.id : null;

  return (
    <main className="app">
      <header className="site-header">
        <p className="eyebrow">ComputerLearning</p>
        <h1>数据结构与算法</h1>
        <p>
          先读 PDF，再做实验与练习；每个知识点都有稳定的 KU ID，可以直接深链。
        </p>
      </header>

      <nav className="tabs" aria-label="视图">
        <button
          type="button"
          className={route.view === "pdf" ? "tab active" : "tab"}
          onClick={() => navigate("pdf", route.view === "pdf" ? route.id : null)}
        >
          PDF 阅读
        </button>
        <button
          type="button"
          className={route.view === "exercise" ? "tab active" : "tab"}
          onClick={() =>
            navigate(
              "exercise",
              route.view === "exercise" ? route.id : exercises[0].id,
            )
          }
        >
          动态练习
        </button>
      </nav>

      {route.view === "pdf" && (
        <>
          {pdfError ? (
            <section className="player">
              <h2>PDF 还没生成</h2>
              <p>
                先运行 <code>npm run pdf</code>，再刷新页面。构建产物会同步到
                <code> web/public/pdfs</code>。
              </p>
            </section>
          ) : subjectIndex ? (
            <PdfViewer
              subject={subjectIndex}
              activeKuId={activeKuId}
              onKuChange={(id) => navigate("pdf", id)}
              onOpenExercise={(kuId) => {
                const exercise = getExercisesForKu(kuId)[0];
                if (exercise) navigate("exercise", exercise.id);
              }}
              hasExercises={(kuId) => getExercisesForKu(kuId).length > 0}
            />
          ) : (
            <p className="pdf-status">正在加载阅读器…</p>
          )}
        </>
      )}

      {route.view === "exercise" && (
        <>
          <nav className="exercise-list" aria-label="练习列表">
            {exercises.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                className={exercise.id === activeExercise.id ? "active" : ""}
                onClick={() => navigate("exercise", exercise.id)}
              >
                <span>{exercise.ku}</span>
                <strong>{exercise.title}</strong>
              </button>
            ))}
          </nav>

          <ExercisePlayer key={activeExercise.id} exercise={activeExercise} />
        </>
      )}
    </main>
  );
}
