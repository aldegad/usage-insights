import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { UsageInsightsData } from "../data/usage-insights.generated";
import { resolveVideoLocale } from "./copy";

const weekdayLabels: Record<"ko" | "en", Record<string, string>> = {
  ko: {
    Mon: "월",
    Tue: "화",
    Wed: "수",
    Thu: "목",
    Fri: "금",
    Sat: "토",
    Sun: "일",
  },
  en: {
    Mon: "Mon",
    Tue: "Tue",
    Wed: "Wed",
    Thu: "Thu",
    Fri: "Fri",
    Sat: "Sat",
    Sun: "Sun",
  },
};

export const formatCompact = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return `${Math.round(value)}`;
};

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(Math.round(value));

export const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export const scaleValue = (value: number, max: number, size: number) => {
  if (max <= 0) {
    return 0;
  }

  return (value / max) * size;
};

export const localizeWeekday = (label: string, locale?: string) => {
  const resolvedLocale = resolveVideoLocale(locale);
  return weekdayLabels[resolvedLocale][label] ?? label;
};

export const formatActivityTraceEvidence = (
  trace: UsageInsightsData["activityTraces"][number],
  locale?: string,
) => {
  const resolvedLocale = resolveVideoLocale(locale);

  if (trace.label === "Gemini") {
    return resolvedLocale === "en"
      ? `${formatNumber(trace.conversationCount || 0)} saved conversations`
      : `저장 대화 ${formatNumber(trace.conversationCount || 0)}개`;
  }

  return resolvedLocale === "en"
    ? `${formatNumber(trace.appSessionCount || 0)} app sessions`
    : `앱 세션 ${formatNumber(trace.appSessionCount || 0)}개`;
};

export const projectProviderTone = (provider: string) => {
  if (provider === "Claude") {
    return {
      background: "rgba(217, 236, 255, 0.9)",
      border: "rgba(115, 184, 255, 0.22)",
      dot: "#73b8ff",
    };
  }

  if (provider === "Gemini") {
    return {
      background: "rgba(228, 246, 220, 0.92)",
      border: "rgba(120, 182, 88, 0.2)",
      dot: "#78b658",
    };
  }

  return {
    background: "rgba(255, 236, 231, 0.9)",
    border: "rgba(255, 141, 122, 0.18)",
    dot: "#ff8d7a",
  };
};

export const sceneOpacity = (frame: number, durationInFrames: number) => {
  const fadeOut = interpolate(frame, [durationInFrames - 18, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  return fadeOut;
};

export const useRise = (delay = 0, durationInFrames = 20) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: { damping: 200 },
  });
};
