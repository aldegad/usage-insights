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
export const DISPLAY_WEIGHT = 700;
export const LABEL_WEIGHT = 600;

export const OPENING_DURATION = 150;
export const SYSTEM_DURATION = 190;
export const RHYTHM_DURATION = 180;
export const PROJECTS_DURATION = 360;
export const PERSONA_DURATION = 210;
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
    solid: "#d96d57",
    soft: "linear-gradient(180deg, rgba(255, 248, 244, 0.98), rgba(255, 251, 249, 0.96))",
    line: "rgba(217, 109, 87, 0.24)",
    glow: "rgba(217, 109, 87, 0.08)",
  },
  sky: {
    solid: "#4c8fd2",
    soft: "linear-gradient(180deg, rgba(246, 250, 255, 0.98), rgba(251, 253, 255, 0.96))",
    line: "rgba(76, 143, 210, 0.24)",
    glow: "rgba(76, 143, 210, 0.08)",
  },
  mint: {
    solid: "#5da88c",
    soft: "linear-gradient(180deg, rgba(245, 252, 248, 0.98), rgba(251, 255, 253, 0.96))",
    line: "rgba(93, 168, 140, 0.24)",
    glow: "rgba(93, 168, 140, 0.08)",
  },
  butter: {
    solid: "#bf9450",
    soft: "linear-gradient(180deg, rgba(255, 251, 242, 0.98), rgba(255, 253, 248, 0.96))",
    line: "rgba(191, 148, 80, 0.24)",
    glow: "rgba(191, 148, 80, 0.08)",
  },
};
