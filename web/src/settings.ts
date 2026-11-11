export type ReadingSettings = {
  fontSize: number;
  lineHeight: number;
};

export const DEFAULT_READING_SETTINGS: ReadingSettings = {
  fontSize: 16,
  lineHeight: 1.75,
};

const SETTINGS_KEY = "computer-learning.reading-settings";

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function loadReadingSettings(): ReadingSettings {
  if (typeof window === "undefined") return DEFAULT_READING_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_READING_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ReadingSettings>;
    return {
      fontSize: clamp(Number(parsed.fontSize), 14, 22, DEFAULT_READING_SETTINGS.fontSize),
      lineHeight: clamp(
        Number(parsed.lineHeight),
        1.4,
        2.2,
        DEFAULT_READING_SETTINGS.lineHeight,
      ),
    };
  } catch {
    return DEFAULT_READING_SETTINGS;
  }
}

export function saveReadingSettings(settings: ReadingSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage may be unavailable in private browsing.
  }
}
