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
export const SYSTEM_DURATION = 180;
export const RHYTHM_DURATION = 180;
export const PROJECTS_DURATION = 360;
export const PERSONA_DURATION = 210;
export const CLOSING_DURATION = 180;
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
    solid: "#ff8d7a",
    soft: "linear-gradient(135deg, rgba(255, 204, 193, 0.95), rgba(255, 241, 235, 0.88))",
    line: "rgba(255, 141, 122, 0.24)",
    glow: "rgba(255, 141, 122, 0.18)",
  },
  sky: {
    solid: "#73b8ff",
    soft: "linear-gradient(135deg, rgba(210, 234, 255, 0.96), rgba(241, 248, 255, 0.9))",
    line: "rgba(115, 184, 255, 0.24)",
    glow: "rgba(115, 184, 255, 0.18)",
  },
  mint: {
    solid: "#66c9a2",
    soft: "linear-gradient(135deg, rgba(214, 247, 233, 0.96), rgba(241, 255, 249, 0.9))",
    line: "rgba(102, 201, 162, 0.24)",
    glow: "rgba(102, 201, 162, 0.18)",
  },
  butter: {
    solid: "#e1b94d",
    soft: "linear-gradient(135deg, rgba(255, 241, 191, 0.96), rgba(255, 250, 232, 0.9))",
    line: "rgba(225, 185, 77, 0.24)",
    glow: "rgba(225, 185, 77, 0.18)",
  },
};
