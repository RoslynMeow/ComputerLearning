import { useEffect, useMemo, useState } from "react";
import { ContentReader } from "./components/ContentReader";
import { ExercisePlayer } from "./components/ExercisePlayer";
import { ExperimentPlayer } from "./components/ExperimentPlayer";
import { KnowledgeGraph } from "./components/KnowledgeGraph";
import type { ContentManifest, SubjectContent } from "./data/types";
import { exercises, getExercisesForKu } from "./exercises/registry";
import { getLabsForKu, labs } from "./labs/registry";

type View = "read" | "graph" | "exercise" | "lab";

type Route = {
  view: View;
  id: string | null;
};

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [view, ...rest] = raw.split("/");
  const id = rest.join("/") || null;
  if (view === "exercise") return { view: "exercise", id };
  if (view === "lab") return { view: "lab", id };
  if (view === "graph") return { view: "graph", id };
  if (view === "read") return { view: "read", id };
  return { view: "graph", id: null };
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash());
  const [subjects, setSubjects] = useState<SubjectContent[] | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setRoute(parseHash());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      try {
        const manifestResponse = await fetch("/content/index.json");
        if (!manifestResponse.ok) throw new Error("内容未生成");
        const manifestData = (await manifestResponse.json()) as ContentManifest[];
        if (cancelled) return;
        if (!manifestData.length) throw new Error("没有可展示的科目");
        const indexData = await Promise.all(
          manifestData.map(async (manifest) => {
            const response = await fetch(manifest.index);
            if (!response.ok) throw new Error("内容索引未生成");
            return (await response.json()) as SubjectContent;
          }),
        );
        if (!cancelled) setSubjects(indexData);
      } catch (reason) {
        if (!cancelled) {
          setContentError(reason instanceof Error ? reason.message : String(reason));
        }
      }
    }

    loadContent();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeExercise = useMemo(() => {
    if (route.view !== "exercise") return exercises[0];
    return exercises.find((exercise) => exercise.id === route.id) ?? exercises[0];
  }, [route]);

  const activeLab = useMemo(() => {
    if (route.view !== "lab") return labs[0];
    return labs.find((lab) => lab.id === route.id) ?? labs[0];
  }, [route]);

  const activeKuId = route.view === "read" ? route.id : null;

  function navigate(view: View, id: string | null) {
    const next = id ? `#/${view}/${id}` : `#/${view}`;
    if (window.location.hash === next) {
      setRoute({ view, id });
    } else {
      window.location.hash = next;
    }
  }

  return (
    <div className={`app view-${route.view}`}>
      <header className="topbar">
        <div className="brand">数据结构与算法</div>
        <nav className="tabs" aria-label="视图">
        <button
          type="button"
          className={route.view === "graph" ? "tab active" : "tab"}
          onClick={() =>
            navigate("graph", route.view === "graph" ? route.id : activeKuId)
          }
        >
          知识图谱
        </button>
        <button
          type="button"
          className={route.view === "read" ? "tab active" : "tab"}
          onClick={() => navigate("read", route.view === "read" ? route.id : null)}
        >
          阅读
        </button>
        <button
          type="button"
          className={route.view === "lab" ? "tab active" : "tab"}
          onClick={() => {
            const lab = activeKuId ? getLabsForKu(activeKuId)[0] : null;
            navigate(
              "lab",
              route.view === "lab" ? route.id : lab?.id ?? labs[0].id,
            );
          }}
        >
          实验
        </button>
        <button
          type="button"
          className={route.view === "exercise" ? "tab active" : "tab"}
          onClick={() => {
            const exercise = activeKuId ? getExercisesForKu(activeKuId)[0] : null;
            navigate(
              "exercise",
              route.view === "exercise"
                ? route.id
                : exercise?.id ?? exercises[0].id,
            );
          }}
        >
          动态练习
        </button>
        </nav>
      </header>

      <main className="content">
      {route.view === "read" && (
        <>
          {contentError ? (
            <section className="player">
              <h2>内容还没生成</h2>
              <p>
                先运行 <code>npm run content:web</code>，再刷新页面。内容会同步到
                <code> web/public/content</code>。
              </p>
            </section>
          ) : subjects ? (
            <ContentReader
              subjects={subjects}
              activeKuId={activeKuId}
              onKuChange={(id) => navigate("read", id)}
            />
          ) : (
            <p className="reader-status">正在加载内容…</p>
          )}
        </>
      )}

      {route.view === "graph" && (
        <KnowledgeGraph
          selectedKuId={route.id}
          onSelectKu={(id) => navigate("graph", id)}
          onOpenContent={(id) => navigate("read", id)}
          onOpenLab={(kuId) => {
            const lab = getLabsForKu(kuId)[0];
            if (lab) navigate("lab", lab.id);
          }}
          onOpenExercise={(kuId) => {
            const exercise = getExercisesForKu(kuId)[0];
            if (exercise) navigate("exercise", exercise.id);
          }}
        />
      )}

      {route.view === "lab" && (
        <>
          <nav className="exercise-list" aria-label="实验列表">
            {labs.map((lab) => (
              <button
                key={lab.id}
                type="button"
                className={lab.id === activeLab.id ? "active" : ""}
                onClick={() => navigate("lab", lab.id)}
              >
                <strong>{lab.title}</strong>
              </button>
            ))}
          </nav>

          <ExperimentPlayer key={activeLab.id} lab={activeLab} />
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
                <strong>{exercise.title}</strong>
              </button>
            ))}
          </nav>

          <ExercisePlayer key={activeExercise.id} exercise={activeExercise} />
        </>
      )}
      </main>
    </div>
  );
}
