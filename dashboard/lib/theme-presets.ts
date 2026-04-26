export type ThemeCss = {
  orbBackground: string;
  eyeBackground: string;
  mouthStroke: string;
  ringBorder: string;
  ringShadow: string;
};

export const THEME_PRESETS: Record<string, ThemeCss> = {
  default: {
    orbBackground: "radial-gradient(circle at 28% 20%, #c7d2fe 0%, #6366f1 42%, #312e81 100%)",
    eyeBackground: "rgba(15, 23, 42, 0.45)",
    mouthStroke: "rgba(15, 23, 42, 0.65)",
    ringBorder: "rgba(148, 163, 184, 0.35)",
    ringShadow: "0 0 20px rgba(99, 102, 241, 0.35)",
  },
  ocean: {
    orbBackground: "radial-gradient(circle at 30% 22%, #bae6fd 0%, #0ea5e9 45%, #0c4a6e 100%)",
    eyeBackground: "rgba(12, 74, 110, 0.55)",
    mouthStroke: "rgba(8, 47, 73, 0.75)",
    ringBorder: "rgba(56, 189, 248, 0.45)",
    ringShadow: "0 0 22px rgba(14, 165, 233, 0.45)",
  },
  sunset: {
    orbBackground: "radial-gradient(circle at 28% 18%, #fde68a 0%, #f97316 42%, #7c2d12 100%)",
    eyeBackground: "rgba(124, 45, 18, 0.5)",
    mouthStroke: "rgba(67, 20, 7, 0.75)",
    ringBorder: "rgba(251, 191, 36, 0.5)",
    ringShadow: "0 0 22px rgba(249, 115, 22, 0.45)",
  },
  neon: {
    orbBackground: "radial-gradient(circle at 25% 25%, #f5d0fe 0%, #a855f7 40%, #4c1d95 100%)",
    eyeBackground: "rgba(76, 29, 149, 0.55)",
    mouthStroke: "rgba(30, 10, 60, 0.8)",
    ringBorder: "rgba(216, 180, 254, 0.55)",
    ringShadow: "0 0 24px rgba(168, 85, 247, 0.55)",
  },
  forest: {
    orbBackground: "radial-gradient(circle at 30% 20%, #bbf7d0 0%, #16a34a 44%, #14532d 100%)",
    eyeBackground: "rgba(20, 83, 45, 0.55)",
    mouthStroke: "rgba(6, 40, 21, 0.75)",
    ringBorder: "rgba(74, 222, 128, 0.45)",
    ringShadow: "0 0 22px rgba(22, 163, 74, 0.45)",
  },
};

export function getPresetCss(presetId: string | null | undefined): ThemeCss {
  const id = presetId && THEME_PRESETS[presetId] ? presetId : "default";
  return THEME_PRESETS[id];
}

const HEX6 = /^#[0-9A-Fa-f]{6}$/;

/** When both accent and deep are valid #RRGGBB, override orb gradient; otherwise return base unchanged. */
export function mergePresetWithHex(
  base: ThemeCss,
  accentHex: string | null | undefined,
  deepHex: string | null | undefined,
): ThemeCss {
  const a = accentHex?.trim();
  const d = deepHex?.trim();
  if (!a || !d || !HEX6.test(a) || !HEX6.test(d)) return base;
  return {
    ...base,
    orbBackground: `radial-gradient(circle at 28% 20%, #e2e8f0 0%, ${a} 42%, ${d} 100%)`,
  };
}
