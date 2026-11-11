export type FontFamilyKey = "sans" | "serif" | "kai" | "fangsong" | "system";

export const FONT_OPTIONS: Record<
  FontFamilyKey,
  { label: string; stack: string }
> = {
  sans: {
    label: "黑体（默认）",
    stack:
      '"Noto Sans SC", "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif',
  },
  serif: {
    label: "宋体",
    stack: '"Noto Serif SC", "Songti SC", SimSun, Georgia, serif',
  },
  kai: {
    label: "楷体",
    stack: '"KaiTi", "Kaiti SC", STKaiti, "Noto Serif SC", serif',
  },
  fangsong: {
    label: "仿宋",
    stack: '"FangSong", "FangSong_GB2312", STFangsong, "Noto Serif SC", serif',
  },
  system: {
    label: "系统默认",
    stack: 'system-ui, -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif',
  },
};

export type ReadingSettings = {
  fontSize: number;
  lineHeight: number;
  fontFamily: FontFamilyKey;
};

export const DEFAULT_READING_SETTINGS: ReadingSettings = {
  fontSize: 16,
  lineHeight: 1.75,
  fontFamily: "sans",
};

const SETTINGS_KEY = "computer-learning.reading-settings";

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function isFontFamily(value: unknown): value is FontFamilyKey {
  return typeof value === "string" && value in FONT_OPTIONS;
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
      fontFamily: isFontFamily(parsed.fontFamily)
        ? parsed.fontFamily
        : DEFAULT_READING_SETTINGS.fontFamily,
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
