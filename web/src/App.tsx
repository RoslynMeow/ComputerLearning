import { useEffect, useState, type CSSProperties } from "react";
import { AppRail } from "./components/AppRail";
import { ContentReader, type ActivityKind } from "./components/ContentReader";
import { KnowledgeGraph } from "./components/KnowledgeGraph";
import { SettingsPage } from "./components/SettingsPage";
import type { ContentManifest, SubjectContent } from "./data/types";
import { exercises, getExercisesForKu } from "./exercises/registry";
import { getLabsForKu, labs } from "./labs/registry";
import {
  DEFAULT_READING_SETTINGS,
  FONT_OPTIONS,
  loadReadingSettings,
  saveReadingSettings,
  type ReadingSettings,
} from "./settings";

type View = "read" | "graph" | "exercise" | "lab" | "settings";

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
  if (view === "settings") return { view: "settings", id: null };
  return { view: "graph", id: null };
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash());
  const [subjects, setSubjects] = useState<SubjectContent[] | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ReadingSettings>(loadReadingSettings);
  const [lastReadId, setLastReadId] = useState<string | null>(null);

  useEffect(() => {
    saveReadingSettings(settings);
  }, [settings]);

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

  const activityRoute = route.view === "lab" || route.view === "exercise";
  const routeActivity =
    route.view === "lab"
      ? labs.find((lab) => lab.id === route.id) ?? null
      : route.view === "exercise"
        ? exercises.find((exercise) => exercise.id === route.id) ?? null
        : null;

  const readingKuId = route.view === "read" ? route.id : routeActivity?.ku ?? null;
  const initialActivity: ActivityKind | null =
    route.view === "lab" ? "lab" : route.view === "exercise" ? "exercise" : null;
  const readingActive = route.view === "read" || activityRoute;
  const activeKuId = readingKuId;

  useEffect(() => {
    if (readingKuId) setLastReadId(readingKuId);
  }, [readingKuId]);

  function navigate(view: View, id: string | null) {
    const next = id ? `#/${view}/${id}` : `#/${view}`;
    if (window.location.hash === next) {
      setRoute({ view, id });
    } else {
      window.location.hash = next;
    }
  }

  return (
    <div
      className={`app view-${readingActive ? "read" : route.view}`}
      style={
        {
          "--reader-font-size": `${settings.fontSize}px`,
          "--reader-line-height": String(settings.lineHeight),
          "--app-font-family": FONT_OPTIONS[settings.fontFamily].stack,
        } as CSSProperties
      }
    >
      <main className="content">
      {readingActive && (
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
              initialActivity={initialActivity}
              onKuChange={(id) => navigate("read", id)}
            />
          ) : (
            <p className="reader-status">正在加载内容…</p>
          )}
        </>
      )}

      {route.view === "graph" && (
        <div className="standalone-layout">
          <AppRail
            active="graph"
            readHref={route.id ? `#/read/${route.id}` : "#/read"}
            graphHref={route.id ? `#/graph/${route.id}` : "#/graph"}
          />
          <div className="standalone-main">
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
          </div>
        </div>
      )}

      {route.view === "settings" && (
        <div className="standalone-layout">
          <AppRail
            active="settings"
            readHref={lastReadId ? `#/read/${lastReadId}` : "#/read"}
            graphHref="#/graph"
          />
          <div className="standalone-main">
            <SettingsPage
              settings={settings}
              onChange={setSettings}
              onReset={() => setSettings(DEFAULT_READING_SETTINGS)}
            />
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
