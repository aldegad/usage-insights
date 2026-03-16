import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import type { UsageInsightsData } from "../data/usage-insights.generated";

loadFont({
  family: "Pretendard",
  url: staticFile("fonts/PretendardVariable.ttf"),
  weight: "100 900",
  style: "normal",
});

const bodyFont = "Pretendard";

export { bodyFont };

export const displayFont = bodyFont;
export const labelFont = bodyFont;
export const DISPLAY_WEIGHT = 300;
export const DISPLAY_WEIGHT_MEDIUM = 500;
export const LABEL_WEIGHT = 500;

export const colors = {
  heading: "#1a1d23",
  body: "#4b5563",
  muted: "#6b7280",
  label: "#9ca3af",
  faint: "rgba(0, 0, 0, 0.04)",
} as const;

export const OPENING_DURATION = 150;
export const SYSTEM_DURATION = 190;
export const RHYTHM_DURATION = 180;
export const PROJECTS_DURATION = 360;
export const PERSONA_DURATION = 300;
export const CLOSING_DURATION = 210;
export const SCENE_TRANSITION_DURATION = 20;

export const USAGE_PROFILE_DURATION =
  OPENING_DURATION +
  SYSTEM_DURATION +
  RHYTHM_DURATION +
  PROJECTS_DURATION +
  PERSONA_DURATION +
  CLOSING_DURATION -
  SCENE_TRANSITION_DURATION * 5;

export type VideoProps = {
  data: UsageInsightsData;
};

export type Item = {
  label: string;
  tokens: number;
  threads?: number;
};

export type Tone = "peach" | "sky" | "mint" | "butter";

export const toneStyles: Record<
  Tone,
  { solid: string; soft: string; line: string; glow: string }
> = {
  peach: {
    solid: "#e05a45",
    soft: "linear-gradient(180deg, rgba(255, 249, 248, 0.98), rgba(255, 252, 251, 0.96))",
    line: "rgba(224, 90, 69, 0.18)",
    glow: "rgba(224, 90, 69, 0.06)",
  },
  sky: {
    solid: "#3b82f6",
    soft: "linear-gradient(180deg, rgba(247, 250, 255, 0.98), rgba(251, 253, 255, 0.96))",
    line: "rgba(59, 130, 246, 0.18)",
    glow: "rgba(59, 130, 246, 0.06)",
  },
  mint: {
    solid: "#0d9488",
    soft: "linear-gradient(180deg, rgba(245, 253, 252, 0.98), rgba(250, 255, 254, 0.96))",
    line: "rgba(13, 148, 136, 0.18)",
    glow: "rgba(13, 148, 136, 0.06)",
  },
  butter: {
    solid: "#8b5cf6",
    soft: "linear-gradient(180deg, rgba(249, 247, 255, 0.98), rgba(252, 251, 255, 0.96))",
    line: "rgba(139, 92, 246, 0.18)",
    glow: "rgba(139, 92, 246, 0.06)",
  },
};
