const PROGRESS_KEY = "cslearning.experiments.progress.v1";

function readProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function writeProgress(value) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(value)); } catch {}
}

export function isExperimentDone(id) {
  return Boolean(readProgress()[id]);
}

export function markExperimentDone(id) {
  if (!id) return;
  const progress = readProgress();
  if (progress[id]) return;
  progress[id] = { at: Date.now() };
  writeProgress(progress);
}

export function experimentDoneCount(experiments = null) {
  const progress = readProgress();
  if (Array.isArray(experiments)) return experiments.filter((experiment) => progress[experiment.id]).length;
  return Object.keys(progress).length;
}
