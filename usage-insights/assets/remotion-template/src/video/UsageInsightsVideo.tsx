import React from "react";
import { loadFont } from "@remotion/google-fonts/IBMPlexSansKR";
import {
  springTiming,
  TransitionSeries,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { UsageInsightsData } from "../data/usage-insights.generated";

const { fontFamily: bodyFont } = loadFont("normal", {
  weights: ["500", "600", "700"],
  ignoreTooManyRequestsWarning: true,
});
const displayFont = bodyFont;
const labelFont = bodyFont;
const DISPLAY_WEIGHT = 700;
const LABEL_WEIGHT = 600;

const OPENING_DURATION = 150;
const SYSTEM_DURATION = 180;
const RHYTHM_DURATION = 180;
const PROJECTS_DURATION = 360;
const PERSONA_DURATION = 210;
const CLOSING_DURATION = 180;
const SCENE_TRANSITION_DURATION = 20;

export const USAGE_PROFILE_DURATION =
  OPENING_DURATION +
  SYSTEM_DURATION +
  RHYTHM_DURATION +
  PROJECTS_DURATION +
  PERSONA_DURATION +
  CLOSING_DURATION -
  SCENE_TRANSITION_DURATION * 5;

type VideoProps = {
  data: UsageInsightsData;
};

type Item = {
  label: string;
  tokens: number;
  threads?: number;
};

type Tone = "peach" | "sky" | "mint" | "butter";

const toneStyles: Record<
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

const weekdayLabels: Record<string, string> = {
  Mon: "월",
  Tue: "화",
  Wed: "수",
  Thu: "목",
  Fri: "금",
  Sat: "토",
  Sun: "일",
};

const formatCompact = (value: number) => {
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

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(Math.round(value));

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

const scaleValue = (value: number, max: number, size: number) => {
  if (max <= 0) {
    return 0;
  }

  return (value / max) * size;
};

const localizeWeekday = (label: string) => weekdayLabels[label] ?? label;

const formatActivityTraceEvidence = (trace: UsageInsightsData["activityTraces"][number]) => {
  if (trace.label === "Gemini") {
    return `저장 대화 ${formatNumber(trace.conversationCount || 0)}개`;
  }

  return `앱 세션 ${formatNumber(trace.appSessionCount || 0)}개`;
};

const projectProviderTone = (provider: string) => {
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

const sceneOpacity = (frame: number, durationInFrames: number) => {
  const fadeIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const fadeOut = interpolate(frame, [durationInFrames - 18, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  return fadeIn * fadeOut;
};

const useRise = (delay = 0, durationInFrames = 20) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: { damping: 200 },
  });
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const driftX = Math.sin(frame / 70) * 34;
  const driftY = Math.cos(frame / 90) * 28;
  const glowRotate = frame * 0.08;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #fffaf4 0%, #fff6f8 42%, #f5fbff 68%, #f4fff8 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -160,
          background:
            "radial-gradient(circle at 18% 22%, rgba(255, 188, 176, 0.58), transparent 24%), radial-gradient(circle at 78% 18%, rgba(167, 221, 255, 0.55), transparent 24%), radial-gradient(circle at 72% 76%, rgba(183, 242, 221, 0.56), transparent 26%), radial-gradient(circle at 24% 84%, rgba(255, 238, 173, 0.44), transparent 20%)",
          transform: `translate(${driftX}px, ${driftY}px) rotate(${glowRotate}deg)`,
          filter: "blur(18px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(130, 111, 88, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(130, 111, 88, 0.045) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          opacity: 0.42,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 40%, transparent 0%, rgba(255, 255, 255, 0.22) 48%, rgba(221, 209, 194, 0.16) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const ChromeDots: React.FC = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {["#ff9d8f", "#ffd36e", "#82d7b8"].map((color) => (
      <div
        key={color}
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          background: color,
          boxShadow: `0 0 0 4px ${color}22`,
        }}
      />
    ))}
  </div>
);

const AppChrome: React.FC<{ current: string }> = ({ current }) => {
  const navItems = ["overview", "tempo", "projects", "read"];
  const navLabels: Record<string, string> = {
    overview: "개요",
    tempo: "리듬",
    projects: "프로젝트",
    read: "해석",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 18,
        padding: "20px 24px 18px",
        borderBottom: "1px solid rgba(93, 80, 61, 0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ChromeDots />
        <div
          style={{
            fontFamily: labelFont,
            fontSize: 14,
            letterSpacing: "0.12em",
            fontWeight: LABEL_WEIGHT,
            color: "#7d6f60",
          }}
        >
          로컬 AI 작업 아카이브
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {navItems.map((item) => {
          const active = current === item;

          return (
            <div
              key={item}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                background: active
                  ? "rgba(255, 255, 255, 0.86)"
                  : "rgba(255, 255, 255, 0.48)",
                border: active
                  ? "1px solid rgba(125, 111, 96, 0.16)"
                  : "1px solid rgba(125, 111, 96, 0.08)",
                fontFamily: labelFont,
                fontSize: 11,
                letterSpacing: "0.12em",
                fontWeight: LABEL_WEIGHT,
                color: active ? "#514538" : "#8e7f71",
                boxShadow: active ? "0 8px 24px rgba(109, 91, 74, 0.08)" : "none",
              }}
            >
              {navLabels[item]}
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: 999,
          background: "rgba(255, 255, 255, 0.58)",
          border: "1px solid rgba(125, 111, 96, 0.1)",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: "#66c9a2",
            boxShadow: "0 0 0 6px rgba(102, 201, 162, 0.14)",
          }}
        />
        <div
          style={{
            fontFamily: bodyFont,
            fontSize: 14,
            color: "#6f6256",
          }}
        >
          내 기록에서 동기화됨
        </div>
      </div>
    </div>
  );
};

const Stage: React.FC<{
  current: string;
  durationInFrames: number;
  section: string;
  children: React.ReactNode;
}> = ({ current, durationInFrames, section, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneOpacity(frame, durationInFrames);
  const entranceDuration = Math.floor(fps * 0.85);
  const exitDuration = Math.floor(fps * 0.72);
  const entrance = spring({
    frame,
    fps,
    durationInFrames: entranceDuration,
    config: { damping: 200 },
  });
  const exit = spring({
    frame: frame - (durationInFrames - exitDuration),
    fps,
    durationInFrames: exitDuration,
    config: { damping: 200 },
  });
  const sectionLift =
    interpolate(entrance, [0, 1], [14, 0]) -
    interpolate(exit, [0, 1], [0, 10]);
  const sweepX = interpolate(frame, [0, entranceDuration], [-440, 1260], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.28, 0.12, 0.18, 1),
  });
  const sweepOpacity =
    interpolate(frame, [0, Math.floor(fps * 0.18), Math.floor(fps * 0.88)], [0, 0.62, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }) *
    (1 - exit);

  return (
    <AbsoluteFill
      style={{
        padding: 28,
        opacity,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "auto 80px 18px",
            height: 26,
            borderRadius: 999,
            background:
              "linear-gradient(90deg, rgba(255, 141, 122, 0.18), rgba(102, 201, 162, 0.12), rgba(115, 184, 255, 0.18))",
            filter: "blur(22px)",
            opacity: 0.8,
            transform: `scaleX(${0.94 + entrance * 0.14})`,
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
          borderRadius: 42,
          overflow: "hidden",
          border: "1px solid rgba(116, 103, 84, 0.12)",
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.62))",
          boxShadow:
            "0 40px 120px rgba(131, 114, 95, 0.14), inset 0 1px 0 rgba(255,255,255,0.8)",
          backdropFilter: "blur(22px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-14% auto -14% -28%",
            width: 360,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9), rgba(255,255,255,0))",
            transform: `translateX(${sweepX}px) rotate(18deg)`,
            opacity: sweepOpacity,
            filter: "blur(18px)",
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
        <AppChrome current={current} />
        <div
          style={{
            padding: "26px 28px 28px",
            height: "calc(100% - 74px)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.76)",
              border: "1px solid rgba(116, 103, 84, 0.1)",
              fontFamily: labelFont,
              fontSize: 12,
              letterSpacing: "0.12em",
              fontWeight: LABEL_WEIGHT,
              color: "#8a7a6a",
              transform: `translateY(${sectionLift}px)`,
              opacity: entrance,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "#ff8d7a",
              }}
            />
            {section}
          </div>
          <div style={{ marginTop: 22, height: "calc(100% - 56px)" }}>{children}</div>
        </div>
      </div>
      </div>
    </AbsoluteFill>
  );
};

const GlassPanel: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      borderRadius: 34,
      border: "1px solid rgba(116, 103, 84, 0.1)",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.86), rgba(255,255,255,0.68))",
      boxShadow:
        "0 22px 54px rgba(129, 109, 88, 0.08), inset 0 1px 0 rgba(255,255,255,0.85)",
      ...style,
    }}
  >
    {children}
  </div>
);

const SoftChip: React.FC<{ text: string; tone?: Tone }> = ({
  text,
  tone = "sky",
}) => {
  const currentTone = toneStyles[tone];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 16px",
        borderRadius: 999,
        background: currentTone.soft,
        boxShadow: `0 14px 32px ${currentTone.glow}`,
        fontFamily: bodyFont,
        fontSize: 16,
        color: "#4f4338",
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: currentTone.solid,
        }}
      />
      {text}
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string;
  tone: Tone;
  delay?: number;
  size?: "regular" | "compact";
}> = ({ title, value, tone, delay = 0, size = "regular" }) => {
  const entrance = useRise(delay, 24);
  const currentTone = toneStyles[tone];
  const isCompact = size === "compact";

  return (
    <GlassPanel
      style={{
        padding: isCompact ? "14px 16px" : "18px 18px",
        minHeight: isCompact ? 62 : 96,
        background: currentTone.soft,
        border: `1px solid ${currentTone.line}`,
        transform: `translateY(${(1 - entrance) * 24}px)`,
        opacity: entrance,
      }}
    >
      <div
        style={{
          fontFamily: labelFont,
          fontSize: isCompact ? 10 : 11,
          letterSpacing: "0.12em",
          fontWeight: LABEL_WEIGHT,
          color: "#7c6e61",
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: isCompact ? 8 : 10,
          fontFamily: displayFont,
          fontWeight: DISPLAY_WEIGHT,
          fontSize: isCompact ? 24 : 34,
          lineHeight: isCompact ? 1 : 0.96,
          letterSpacing: "-0.04em",
          color: "#1f1a16",
        }}
      >
        {value}
      </div>
    </GlassPanel>
  );
};

const PersonaBubble: React.FC<{ data: UsageInsightsData }> = ({ data }) => (
  <GlassPanel
    style={{
      position: "relative",
      padding: "24px 24px 22px",
      height: "100%",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250, 255, 252, 0.72))",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        position: "absolute",
        width: 140,
        height: 140,
        right: -32,
        top: -26,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 30% 30%, rgba(183, 242, 221, 0.74), rgba(167, 221, 255, 0.2) 68%, transparent 80%)",
      }}
    />
    <div
      style={{
        fontFamily: labelFont,
        fontSize: 12,
        letterSpacing: "0.12em",
        fontWeight: LABEL_WEIGHT,
        color: "#7c6e61",
      }}
    >
      작업 성향
    </div>
    <div
      style={{
        marginTop: 14,
        fontFamily: displayFont,
        fontWeight: DISPLAY_WEIGHT,
        fontSize: 34,
        lineHeight: 1.02,
        maxWidth: 320,
        letterSpacing: "-0.035em",
        color: "#1f1a16",
      }}
    >
      {data.persona.archetype}
    </div>
    <div
      style={{
        marginTop: 16,
        fontFamily: bodyFont,
        fontSize: 15,
        lineHeight: 1.56,
        color: "#5c5045",
      }}
    >
      {data.persona.worksBestAs}
    </div>
    {data.activityTraces.length > 0 ? (
      <div
        style={{
          marginTop: 18,
          paddingTop: 16,
          borderTop: "1px solid rgba(93, 80, 61, 0.08)",
          display: "grid",
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: labelFont,
            fontSize: 11,
            letterSpacing: "0.12em",
            fontWeight: LABEL_WEIGHT,
            color: "#8a7b6f",
          }}
        >
          추가 활동 흔적
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {data.activityTraces.map((trace, index) => (
            <SoftChip
              key={trace.label}
              text={`${trace.label} ${formatActivityTraceEvidence(trace)}`}
              tone={index === 0 ? "mint" : "sky"}
            />
          ))}
        </div>
        <div
          style={{
            fontFamily: bodyFont,
            fontSize: 13,
            lineHeight: 1.55,
            color: "#6b5f54",
          }}
        >
          {data.activityTraces
            .map((trace) => `${trace.label} ${trace.from} ~ ${trace.to}`)
            .join(" · ")}
        </div>
        <div
          style={{
            fontFamily: bodyFont,
            fontSize: 12,
            lineHeight: 1.5,
            color: "#8b7d70",
          }}
        >
          Codex/Claude는 토큰 기준으로, Gemini/Antigravity는 로컬 활동 흔적으로만 반영했습니다.
        </div>
      </div>
    ) : null}
  </GlassPanel>
);

const BarBoard: React.FC<{
  title: string;
  subtitle: string;
  items: Item[];
  tone: Tone;
  maxHeight?: number;
}> = ({ title, subtitle, items, tone, maxHeight = 174 }) => {
  const currentTone = toneStyles[tone];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = Math.max(1, ...items.map((item) => item.tokens));

  return (
    <GlassPanel style={{ padding: 24, height: "100%" }}>
      <div
        style={{
          fontFamily: displayFont,
          fontWeight: DISPLAY_WEIGHT,
          fontSize: 34,
          lineHeight: 1,
          color: "#1f1a16",
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: bodyFont,
          fontSize: 16,
          lineHeight: 1.55,
          color: "#6e6257",
        }}
      >
        {subtitle}
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-end",
          height: maxHeight + 56,
          marginTop: 26,
        }}
      >
        {items.map((item, index) => {
          const progress = spring({
            frame,
            fps,
            delay: index * 4,
            durationInFrames: 24,
            config: { damping: 200 },
          });
          const height = scaleValue(item.tokens, max, maxHeight) * progress;

          return (
            <div
              key={item.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                gap: 10,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  height,
                  borderRadius: 22,
                  background: `linear-gradient(180deg, ${currentTone.solid}, rgba(255,255,255,0.78))`,
                  boxShadow: `0 14px 30px ${currentTone.glow}`,
                }}
              />
              <div
                style={{
                  fontFamily: labelFont,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  color: "#7a6c5f",
                  textTransform: "uppercase",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: bodyFont,
                  fontSize: 13,
                  color: "#63574b",
                }}
              >
                {formatCompact(item.tokens)}
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
};

const MonthlyProviderBoard: React.FC<{ data: UsageInsightsData; subtitle: string }> = ({
  data,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = data.monthlyByProvider.slice(-4);
  const max = Math.max(1, ...items.map((item) => item.totalTokens));

  return (
    <GlassPanel style={{ padding: 24, height: "100%" }}>
      <div
        style={{
          fontFamily: displayFont,
          fontWeight: DISPLAY_WEIGHT,
          fontSize: 34,
          lineHeight: 1,
          color: "#1f1a16",
        }}
      >
        월별 토큰 흐름
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: bodyFont,
          fontSize: 16,
          lineHeight: 1.55,
          color: "#6e6257",
          maxWidth: 720,
        }}
      >
        {subtitle}
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <SoftChip text="막대 전체 = 월별 총 토큰" tone="butter" />
        <SoftChip text="Codex = 피치" tone="peach" />
        <SoftChip text="Claude = 스카이" tone="sky" />
      </div>
      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "flex-end",
          height: 292,
          marginTop: 20,
        }}
      >
        {items.map((item, index) => {
          const reveal = spring({
            frame: frame - index * 4,
            fps,
            durationInFrames: 24,
            config: { damping: 200 },
          });
          const totalHeight = scaleValue(item.totalTokens, max, 178) * reveal;
          const codexHeight =
            item.totalTokens > 0 ? (item.codexTokens / item.totalTokens) * totalHeight : 0;
          const claudeHeight =
            item.totalTokens > 0 ? (item.claudeTokens / item.totalTokens) * totalHeight : 0;

          return (
            <div
              key={item.label}
              style={{
                flex: 1,
                minWidth: 0,
                display: "grid",
                gap: 12,
                transform: `translateY(${(1 - reveal) * 16}px)`,
                opacity: reveal,
              }}
            >
              <div
                style={{
                  height: 184,
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: Math.max(totalHeight, 8),
                    borderRadius: 28,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.72)",
                    boxShadow: "0 18px 38px rgba(129, 109, 88, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  {claudeHeight > 0 ? (
                    <div
                      style={{
                        height: claudeHeight,
                        minHeight: claudeHeight > 0 ? 4 : 0,
                        background:
                          "linear-gradient(180deg, rgba(115, 184, 255, 0.96), rgba(188, 223, 255, 0.92))",
                      }}
                    />
                  ) : null}
                  {codexHeight > 0 ? (
                    <div
                      style={{
                        height: codexHeight,
                        minHeight: codexHeight > 0 ? 4 : 0,
                        background:
                          "linear-gradient(180deg, rgba(255, 141, 122, 0.98), rgba(255, 199, 188, 0.92))",
                      }}
                    />
                  ) : null}
                </div>
              </div>
              <div
                style={{
                  fontFamily: labelFont,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  color: "#7a6c5f",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: displayFont,
                  fontWeight: DISPLAY_WEIGHT,
                  fontSize: 24,
                  lineHeight: 0.96,
                  color: "#1f1a16",
                }}
              >
                {formatCompact(item.totalTokens)} 토큰
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: bodyFont,
                    fontSize: 12,
                    color: "#615548",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: "#ff8d7a",
                    }}
                  />
                  Codex {formatCompact(item.codexTokens)}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: bodyFont,
                    fontSize: 12,
                    color: "#615548",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: "#73b8ff",
                    }}
                  />
                  Claude {formatCompact(item.claudeTokens)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
};

const ProviderSplitCard: React.FC<{ data: UsageInsightsData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const providers = data.providers.slice(0, 2);
  const claudeLead = data.monthlyByProvider.find((item) => item.claudeTokens > item.codexTokens);
  const codexLead = [...data.monthlyByProvider]
    .reverse()
    .find((item) => item.codexTokens > item.claudeTokens);
  const note =
    claudeLead && codexLead
      ? `${claudeLead.label}엔 Claude 비중이 컸고, ${codexLead.label}엔 Codex가 구현 볼륨을 끌어올렸습니다.`
      : "두 도구를 함께 쓰되, 최근엔 Codex 비중이 더 큰 운영 구조입니다.";

  return (
    <GlassPanel
      style={{
        padding: 24,
        height: "100%",
      }}
    >
      <div
        style={{
          fontFamily: labelFont,
          fontSize: 11,
          letterSpacing: "0.12em",
          fontWeight: LABEL_WEIGHT,
          color: "#7c6e61",
        }}
      >
        AI 도구 믹스
      </div>
      <div style={{ marginTop: 18, display: "grid", gap: 18 }}>
        {providers.map((provider, index) => {
          const reveal = spring({
            frame: frame - index * 6,
            fps,
            durationInFrames: Math.floor(fps * 0.8),
            config: { damping: 200 },
          });
          const tone = index === 0 ? toneStyles.peach : toneStyles.sky;

          return (
            <div
              key={provider.label}
              style={{
                transform: `translateY(${(1 - reveal) * 14}px)`,
                opacity: reveal,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: displayFont,
                    fontWeight: DISPLAY_WEIGHT,
                    fontSize: 28,
                    color: "#1f1a16",
                  }}
                >
                  {provider.label}
                </div>
                <div
                  style={{
                    fontFamily: labelFont,
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    fontWeight: LABEL_WEIGHT,
                    color: "#8a7b6f",
                  }}
                >
                  {formatPercent(provider.share)}
                </div>
              </div>
              <div
                style={{
                  marginTop: 10,
                  height: 16,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.68)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(provider.share * 100 * reveal, 8)}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${tone.solid}, rgba(255,255,255,0.88))`,
                    boxShadow: `0 10px 22px ${tone.glow}`,
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: bodyFont,
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: "#63574b",
                }}
              >
                {provider.role} · {formatCompact(provider.tokens)} 토큰
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: bodyFont,
          fontSize: 16,
          lineHeight: 1.55,
          color: "#6e6257",
        }}
      >
        {note}
      </div>
    </GlassPanel>
  );
};

const ProjectAtlasBoard: React.FC<VideoProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const projects = data.projects.filter((project) => project.tokens > 0);
  const spotlight = projects[0];
  const totalProjectTokens = Math.max(
    1,
    projects.reduce((sum, project) => sum + project.tokens, 0),
  );
  const maxTokens = Math.max(1, ...projects.map((project) => project.tokens));
  const sharedProjects = projects.filter((project) => project.providers.length > 1).length;
  const rowHeight = 82;
  const rowGap = 8;
  const contentInsetY = 14;
  const visibleRows = Math.min(projects.length, 5);
  const viewportHeight =
    visibleRows * rowHeight + Math.max(visibleRows - 1, 0) * rowGap;
  const listHeight =
    projects.length * rowHeight +
    Math.max(projects.length - 1, 0) * rowGap +
    contentInsetY * 2;
  const maxScroll = Math.max(0, listHeight - viewportHeight);
  const scrollbarWidth = 8;
  const scrollbarInsetY = 12;
  const scrollbarInsetRight = 10;
  const scrollbarGap = 10;
  const contentInsetLeft = 10;
  const contentInsetRight = scrollbarWidth + scrollbarInsetRight + scrollbarGap;
  const trackHeight = viewportHeight - scrollbarInsetY * 2;
  const scrollProgress = interpolate(
    frame,
    [80, PROJECTS_DURATION - 64],
    [0, 1],
    {
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const scrollY = maxScroll * scrollProgress;
  const thumbHeight = Math.max(
    64,
    trackHeight * (viewportHeight / Math.max(listHeight, viewportHeight)),
  );
  const thumbTravel = Math.max(0, trackHeight - thumbHeight);
  const thumbTop = thumbTravel * scrollProgress;

  return (
    <div style={{ display: "grid", gap: 10, height: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: `전체 ${projects.length}개`, tone: "sky" as const },
          { label: `1위 ${spotlight.label} ${formatCompact(spotlight.tokens)}`, tone: "peach" as const },
          { label: `멀티 툴 ${sharedProjects}개`, tone: "mint" as const },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 999,
              background: toneStyles[item.tone].soft,
              border: `1px solid ${toneStyles[item.tone].line}`,
              fontFamily: bodyFont,
              fontSize: 15,
              color: "#54483d",
              boxShadow: `0 12px 28px ${toneStyles[item.tone].glow}`,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: toneStyles[item.tone].solid,
              }}
            />
            {item.label}
          </div>
        ))}
      </div>
      <div
        style={{
          minHeight: 0,
          flex: 1,
        }}
      >
        <div
          style={{
            position: "relative",
            borderRadius: 32,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,250,246,0.8))",
            border: "1px solid rgba(116, 103, 84, 0.08)",
            overflow: "hidden",
            height: viewportHeight,
            boxShadow:
              "0 28px 72px rgba(131, 114, 95, 0.1), inset 0 1px 0 rgba(255,255,255,0.72)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02) 16%, rgba(255,255,255,0) 84%, rgba(255,255,255,0.14))",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "14px 12px",
              borderRadius: 26,
              border: "1px solid rgba(116, 103, 84, 0.05)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              height: "100%",
            }}
          >
            <div
              style={{
                height: "100%",
                overflow: "hidden",
                padding: `${contentInsetY}px ${contentInsetRight}px ${contentInsetY}px ${contentInsetLeft}px`,
              }}
            >
              <div
                style={{
                  display: "grid",
                  rowGap: rowGap,
                  transform: `translateY(-${scrollY}px)`,
                }}
              >
                {projects.map((project, index) => {
                  const toneKey = (["peach", "sky", "mint", "butter"] as const)[index % 4];
                  const tone = toneStyles[toneKey];
                  const reveal = spring({
                    frame: frame - Math.min(10 + index, 38),
                    fps,
                    durationInFrames: 18,
                    config: { damping: 220 },
                  });
                  const share = project.tokens / totalProjectTokens;
                  const width = scaleValue(project.tokens, maxTokens, 100);

                  return (
                    <div
                      key={project.label}
                      style={{
                        height: rowHeight,
                        boxSizing: "border-box",
                        padding: "10px 14px",
                        borderRadius: 22,
                        background:
                          index < 3
                            ? tone.soft
                            : "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.76))",
                        border: `1px solid ${index < 3 ? tone.line : "rgba(116, 103, 84, 0.08)"}`,
                        boxShadow: `0 10px 24px ${tone.glow}`,
                        transform: `translateY(${(1 - reveal) * 14}px)`,
                        opacity: reveal,
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "50px 1fr 124px",
                          gap: 14,
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 14,
                            background:
                              index < 3
                                ? `linear-gradient(145deg, ${tone.solid}, rgba(255,255,255,0.78))`
                                : "rgba(255,255,255,0.84)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: displayFont,
                            fontWeight: DISPLAY_WEIGHT,
                            fontSize: 18,
                            color: index < 3 ? "#ffffff" : "#1f1a16",
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: displayFont,
                              fontWeight: DISPLAY_WEIGHT,
                              fontSize: 21,
                              lineHeight: 1,
                              color: "#1a1512",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {project.label}
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                            }}
                          >
                            {project.providers.map((provider) => {
                              const providerTone = projectProviderTone(provider);

                              return (
                                <div
                                  key={`${project.label}-${provider}`}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "6px 9px",
                                    borderRadius: 999,
                                    background: providerTone.background,
                                    border: `1px solid ${providerTone.border}`,
                                    fontFamily: labelFont,
                                    fontSize: 10,
                                    letterSpacing: "0.08em",
                                    fontWeight: LABEL_WEIGHT,
                                    color: "#695d51",
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: 999,
                                      background: providerTone.dot,
                                    }}
                                  />
                                  {provider}
                                </div>
                              );
                            })}
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "6px 9px",
                                borderRadius: 999,
                                background: "rgba(255,255,255,0.78)",
                                border: "1px solid rgba(116, 103, 84, 0.08)",
                                fontFamily: labelFont,
                                fontSize: 10,
                                letterSpacing: "0.08em",
                                fontWeight: LABEL_WEIGHT,
                                color: "#74675a",
                              }}
                            >
                              {project.workspaces} WS
                            </div>
                          </div>
                          <div
                            style={{
                              marginTop: 8,
                              height: 7,
                              borderRadius: 999,
                              background: "rgba(255,255,255,0.72)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.max(width, project.tokens > 0 ? 4 : 0)}%`,
                                height: "100%",
                                borderRadius: 999,
                                background: `linear-gradient(90deg, ${tone.solid}, rgba(255,255,255,0.84))`,
                                boxShadow: `0 8px 18px ${tone.glow}`,
                              }}
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            textAlign: "right",
                            display: "grid",
                            gap: 4,
                            justifyItems: "end",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: displayFont,
                              fontWeight: DISPLAY_WEIGHT,
                              fontSize: 24,
                              lineHeight: 0.98,
                              color: "#1f1a16",
                            }}
                          >
                            {formatCompact(project.tokens)}
                          </div>
                          <div
                            style={{
                              fontFamily: bodyFont,
                              fontSize: 13,
                              color: "#64584c",
                            }}
                          >
                            {project.threads}개 기록
                          </div>
                          <div
                            style={{
                              fontFamily: labelFont,
                              fontSize: 10,
                              letterSpacing: "0.1em",
                              fontWeight: LABEL_WEIGHT,
                              color: "#8a7b6f",
                            }}
                          >
                            비중 {formatPercent(share)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                top: scrollbarInsetY,
                bottom: scrollbarInsetY,
                right: scrollbarInsetRight,
                width: scrollbarWidth,
                borderRadius: 999,
                background: "rgba(255,255,255,0.78)",
                border: "1px solid rgba(116, 103, 84, 0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 1,
                  borderRadius: 999,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 1,
                  right: 1,
                  top: thumbTop,
                  height: thumbHeight,
                  borderRadius: 999,
                  background:
                    "linear-gradient(180deg, rgba(255, 141, 122, 0.9), rgba(115, 184, 255, 0.78))",
                  boxShadow: "0 10px 22px rgba(255, 141, 122, 0.18)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InsightColumn: React.FC<{
  title: string;
  items: string[];
  tone: Tone;
}> = ({ title, items, tone }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTone = toneStyles[tone];

  return (
    <GlassPanel style={{ padding: 20, height: "100%" }}>
      <div
        style={{
          fontFamily: displayFont,
          fontWeight: DISPLAY_WEIGHT,
          fontSize: 28,
          lineHeight: 1,
          color: "#1f1a16",
        }}
      >
        {title}
      </div>
      <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
        {items.map((item, index) => {
          const reveal = spring({
            frame: frame - index * 5,
            fps,
            durationInFrames: Math.floor(fps * 0.75),
            config: { damping: 200 },
          });

          return (
            <div
              key={item}
              style={{
                display: "flex",
                gap: 12,
                transform: `translateY(${(1 - reveal) * 18}px)`,
                opacity: reveal,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: currentTone.solid,
                  marginTop: 8,
                  boxShadow: `0 0 0 6px ${currentTone.glow}`,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontFamily: bodyFont,
                  fontSize: 16,
                  lineHeight: 1.62,
                  color: "#5d5145",
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
};

const OpeningScene: React.FC<VideoProps> = ({ data }) => {
  const titleRise = useRise(4, 26);
  const providerLine = data.providers
    .slice(0, 2)
    .map((provider) => `${provider.label} ${formatPercent(provider.share)}`)
    .join(" · ");
  const openingSummary = `${data.period.from}부터 ${data.period.to}까지의 로컬 기록을 보면, AI를 하나의 비서보다 역할이 다른 팀처럼 운영합니다. 구조와 탐색은 Claude가 받치고, 구현과 실행은 Codex가 밀어 올립니다.`;
  const openingFrame = useCurrentFrame();
  const summaryChars = Math.floor(
    interpolate(openingFrame, [12, 58], [0, openingSummary.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const metricsRise = interpolate(openingFrame, [52, 110], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const metricsOpacity = interpolate(openingFrame, [48, 96], [0.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <Stage
      current="overview"
      durationInFrames={OPENING_DURATION}
      section="AI 크리에이터 프로필"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.45fr 0.9fr",
          gap: 22,
          height: "100%",
        }}
      >
        <div>
          <GlassPanel
            style={{
              padding: "22px 24px 18px",
              height: "100%",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(255, 248, 244, 0.75))",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <SoftChip text="토큰 집계: Codex + Claude" tone="sky" />
                {data.activityTraces.length > 0 ? (
                  <SoftChip
                    text={`활동 흔적: ${data.activityTraces.map((trace) => trace.label).join(" + ")}`}
                    tone="mint"
                  />
                ) : null}
                <SoftChip text={`${data.period.from} ~ ${data.period.to}`} tone="peach" />
                <SoftChip text={providerLine} tone="butter" />
              </div>
            </div>
            <div
              style={{
                marginTop: 16,
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: displayFont,
                    fontWeight: DISPLAY_WEIGHT,
                    fontSize: 42,
                    lineHeight: 0.95,
                    letterSpacing: "-0.05em",
                    color: "#16120f",
                    transform: `translateY(${(1 - titleRise) * 28}px)`,
                    opacity: titleRise,
                  }}
                >
                  로컬 AI 작업 기록을
                  <br />
                  역할과 흐름으로
                  <br />
                  정리했습니다.
                </div>
                <div
                  style={{
                    maxWidth: 640,
                    minHeight: 68,
                    maxHeight: 68,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      fontFamily: bodyFont,
                      fontSize: 15,
                      lineHeight: 1.62,
                      color: "#5e5247",
                    }}
                  >
                    {openingSummary.slice(0, summaryChars)}
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 6,
                    transform: `translateY(${metricsRise}px)`,
                    opacity: metricsOpacity,
                  }}
                >
                  <MetricCard
                    title="총 토큰"
                    value={formatCompact(data.totals.tokens)}
                    tone="peach"
                    size="compact"
                  />
                  <MetricCard
                    title="활성 일수"
                    value={`${data.period.activeDays}/${data.period.totalDays}`}
                    tone="sky"
                    delay={4}
                    size="compact"
                  />
                  <MetricCard
                    title="최장 연속"
                    value={`${data.period.longestStreak}d`}
                    tone="mint"
                    delay={8}
                    size="compact"
                  />
                  <MetricCard
                    title="기록 수"
                    value={formatNumber(data.totals.threads)}
                    tone="butter"
                    delay={12}
                    size="compact"
                  />
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
        <PersonaBubble data={data} />
      </div>
    </Stage>
  );
};

const SystemScene: React.FC<VideoProps> = ({ data }) => {
  const recent = data.recentDaily.slice(-7);
  const claudeLead = data.monthlyByProvider.find((item) => item.claudeTokens > item.codexTokens);
  const codexLead = [...data.monthlyByProvider]
    .reverse()
    .find((item) => item.codexTokens > item.claudeTokens);
  const monthlySubtitle =
    claudeLead && codexLead
      ? `${claudeLead.label}엔 Claude가, ${codexLead.label}엔 Codex가 더 강했습니다. 막대 전체는 월별 총 토큰이고 색으로 도구 비중을 나눠 보여줍니다.`
      : "한 도구만 오래 끄는 패턴이 아니라, 시기와 맥락에 따라 사용 무게가 바뀝니다. 막대 전체는 월별 총 토큰입니다.";

  return (
    <Stage
      current="tempo"
      durationInFrames={SYSTEM_DURATION}
      section="시스템 요약"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.88fr",
          gridTemplateRows: "1fr 1fr",
          gap: 18,
          height: "100%",
        }}
      >
        <div style={{ gridRow: "1 / span 2" }}>
          <MonthlyProviderBoard data={data} subtitle={monthlySubtitle} />
        </div>
        <ProviderSplitCard data={data} />
        <BarBoard
          title="최근 일간 리듬"
          subtitle="최근 사용은 늘 켜두는 느낌보다는, 필요할 때 깊게 몰입하는 파동형 패턴에 가깝습니다."
          items={recent}
          tone="mint"
          maxHeight={120}
        />
      </div>
    </Stage>
  );
};

const RhythmScene: React.FC<VideoProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxHour = Math.max(1, ...data.hourly.map((item) => item.tokens));
  const topHours = [...data.hourly]
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 3)
    .sort((a, b) => a.label.localeCompare(b.label));
  const topWeekdays = [...data.weekdays].sort((a, b) => b.tokens - a.tokens).slice(0, 3);

  return (
    <Stage
      current="tempo"
      durationInFrames={RHYTHM_DURATION}
      section="시간대 리듬"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.35fr 0.9fr",
          gap: 18,
          height: "100%",
        }}
      >
        <GlassPanel style={{ padding: 24 }}>
          <div
            style={{
              fontFamily: displayFont,
              fontWeight: DISPLAY_WEIGHT,
              fontSize: 36,
              lineHeight: 1,
              color: "#1f1a16",
            }}
          >
            시간대별 사용 리듬
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: bodyFont,
              fontSize: 16,
              lineHeight: 1.58,
              color: "#6b5f54",
            }}
          >
            오전 후반부터 오후 구간이 가장 강하고, 저녁에 다시 한 번 재진입하는 패턴이 보입니다.
          </div>
          <div
            style={{
              marginTop: 28,
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gap: 12,
              rowGap: 18,
            }}
          >
            {data.hourly.map((item, index) => {
              const progress = spring({
                frame,
                fps,
                delay: index * 2,
                durationInFrames: 18,
                config: { damping: 200 },
              });
              const height = scaleValue(item.tokens, maxHour, 122) * progress;
              const isPeak = topHours.some((hour) => hour.label === item.label);
              const tone = isPeak ? toneStyles.peach : toneStyles.sky;

              return (
                <div key={item.label}>
                  <div
                    style={{
                      height: 138,
                      display: "flex",
                      alignItems: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height,
                        borderRadius: 999,
                        background: `linear-gradient(180deg, ${tone.solid}, rgba(255,255,255,0.8))`,
                        boxShadow: `0 12px 22px ${tone.glow}`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      textAlign: "center",
                      fontFamily: labelFont,
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      color: "#85776b",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>
        <div style={{ display: "grid", gap: 18 }}>
          <GlassPanel style={{ padding: 24 }}>
            <div
              style={{
                fontFamily: displayFont,
                fontWeight: DISPLAY_WEIGHT,
                fontSize: 28,
                lineHeight: 1,
                color: "#1f1a16",
              }}
            >
              피크 시간대
            </div>
            <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
              {topHours.map((hour, index) => (
                <SoftChip
                  key={hour.label}
                  text={`${hour.label}시 · ${formatCompact(hour.tokens)}`}
                  tone={index === 0 ? "peach" : index === 1 ? "mint" : "sky"}
                />
              ))}
            </div>
          </GlassPanel>
          <GlassPanel style={{ padding: 24 }}>
            <div
              style={{
                fontFamily: displayFont,
                fontWeight: DISPLAY_WEIGHT,
                fontSize: 28,
                lineHeight: 1,
                color: "#1f1a16",
              }}
            >
              강한 요일
            </div>
            <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
              {topWeekdays.map((day, index) => (
                <SoftChip
                  key={day.label}
                  text={`${localizeWeekday(day.label)}요일 · ${formatCompact(day.tokens)}`}
                  tone={index === 0 ? "butter" : index === 1 ? "sky" : "mint"}
                />
              ))}
            </div>
          </GlassPanel>
          <GlassPanel style={{ padding: 24 }}>
            <div
              style={{
                fontFamily: labelFont,
                fontSize: 11,
                letterSpacing: "0.12em",
                fontWeight: LABEL_WEIGHT,
                color: "#8a7a6c",
              }}
            >
              해석
            </div>
            <div
              style={{
                marginTop: 14,
                fontFamily: bodyFont,
                fontSize: 19,
                lineHeight: 1.68,
                color: "#5e5247",
              }}
            >
              AI를 배경 채팅처럼 틀어두는 방식은 아닙니다. 필요가 생기면 강하게 들어오고,
              한 번 들어오면 구조가 잡히고 결과가 날 때까지 깊게 파는 쪽에 가깝습니다.
            </div>
          </GlassPanel>
        </div>
      </div>
    </Stage>
  );
};

const ProjectsScene: React.FC<VideoProps> = ({ data }) => {
  return (
    <Stage
      current="projects"
      durationInFrames={PROJECTS_DURATION}
      section="에너지가 들어간 곳"
    >
      <ProjectAtlasBoard data={data} />
    </Stage>
  );
};

const PersonaScene: React.FC<VideoProps> = ({ data }) => (
  <Stage
    current="read"
    durationInFrames={PERSONA_DURATION}
    section="해석 레이어"
  >
    <div style={{ display: "grid", gap: 18, height: "100%" }}>
      <GlassPanel
        style={{
          padding: "24px 24px 22px",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(244, 255, 250, 0.74))",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 999,
            background: "rgba(214, 247, 233, 0.76)",
            fontFamily: labelFont,
            fontSize: 11,
            letterSpacing: "0.12em",
            fontWeight: LABEL_WEIGHT,
            color: "#6b635b",
          }}
        >
          내 해석
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: displayFont,
            fontWeight: DISPLAY_WEIGHT,
            fontSize: 52,
            lineHeight: 0.95,
            letterSpacing: "-0.05em",
            color: "#171310",
          }}
        >
          {data.persona.archetype}
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: bodyFont,
            fontSize: 17,
            lineHeight: 1.58,
            color: "#5c5045",
            maxWidth: 1040,
          }}
        >
          {data.persona.summary}
        </div>
      </GlassPanel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          height: "100%",
        }}
      >
        <InsightColumn title="습관" items={data.habits.slice(0, 2)} tone="peach" />
        <InsightColumn title="잘하는 점" items={data.strengths.slice(0, 2)} tone="mint" />
        <InsightColumn title="주의할 점" items={data.cautions.slice(0, 2)} tone="butter" />
      </div>
    </div>
  </Stage>
);

const ClosingScene: React.FC<VideoProps> = ({ data }) => {
  const topProjects = data.projects.slice(0, 3);
  const closingChars = Math.floor(
    interpolate(useCurrentFrame(), [8, 92], [0, data.persona.worksBestAs.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  return (
    <Stage
      current="read"
      durationInFrames={CLOSING_DURATION}
      section="마무리"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 0.92fr",
          gap: 18,
          height: "100%",
        }}
      >
        <GlassPanel
          style={{
            padding: "24px 26px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(246, 251, 255, 0.76))",
          }}
        >
          <div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <SoftChip
                text={`${data.providers[0]?.label || "Codex"} ${formatPercent(
                  data.providers[0]?.share || 0,
                )}`}
                tone="mint"
              />
              <SoftChip
                text={`${data.providers[1]?.label || "Claude"} ${formatPercent(
                  data.providers[1]?.share || 0,
                )}`}
                tone="sky"
              />
              <SoftChip text={`${formatNumber(data.totals.deepWorkThreads)} 깊은 작업 스레드`} tone="peach" />
            </div>
            <div
              style={{
                marginTop: 20,
                fontFamily: displayFont,
                fontWeight: DISPLAY_WEIGHT,
                fontSize: 44,
                lineHeight: 1.06,
                letterSpacing: "-0.04em",
                color: "#171310",
              }}
            >
              역할을 나눠 쓸수록
              <br />
              더 선명하게 완주합니다.
            </div>
          </div>
          <div
            style={{
              fontFamily: bodyFont,
              fontSize: 16,
              lineHeight: 1.62,
              color: "#5c5045",
              maxWidth: 760,
              minHeight: 72,
            }}
          >
            {data.persona.worksBestAs.slice(0, closingChars)}
          </div>
        </GlassPanel>
        <div style={{ display: "grid", gap: 18 }}>
          <GlassPanel style={{ padding: 24 }}>
            <div
              style={{
                fontFamily: displayFont,
                fontWeight: DISPLAY_WEIGHT,
                fontSize: 28,
                lineHeight: 1,
                color: "#1f1a16",
              }}
            >
              상위 프로젝트
            </div>
            <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
              {topProjects.map((project, index) => (
                <SoftChip
                  key={project.label}
                  text={`${project.label} · ${formatCompact(project.tokens)}`}
                  tone={index === 0 ? "peach" : index === 1 ? "sky" : "mint"}
                />
              ))}
            </div>
          </GlassPanel>
          <GlassPanel style={{ padding: 24 }}>
            <div
              style={{
                fontFamily: displayFont,
                fontWeight: DISPLAY_WEIGHT,
                fontSize: 28,
                lineHeight: 1,
                color: "#1f1a16",
              }}
            >
              집중 지표
            </div>
            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              <MetricCard
                title="최장 연속"
                value={`${data.period.longestStreak}d`}
                tone="butter"
                size="compact"
              />
              <MetricCard
                title="활성 일수"
                value={`${data.period.activeDays}일`}
                tone="mint"
                delay={4}
                size="compact"
              />
              <MetricCard
                title="프로젝트"
                value={`${data.projects.length}개`}
                tone="sky"
                delay={8}
                size="compact"
              />
              <MetricCard
                title="50만+ 토큰"
                value={formatNumber(data.totals.megaThreads)}
                tone="peach"
                delay={12}
                size="compact"
              />
            </div>
          </GlassPanel>
        </div>
      </div>
    </Stage>
  );
};

export const UsageInsightsVideo: React.FC<VideoProps> = ({ data }) => {
  const sceneTiming = springTiming({
    config: { damping: 200 },
    durationInFrames: SCENE_TRANSITION_DURATION,
  });

  return (
    <AbsoluteFill>
      <Backdrop />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={OPENING_DURATION}>
          <OpeningScene data={data} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          timing={sceneTiming}
          presentation={fade()}
        />
        <TransitionSeries.Sequence durationInFrames={SYSTEM_DURATION}>
          <SystemScene data={data} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          timing={sceneTiming}
          presentation={fade()}
        />
        <TransitionSeries.Sequence durationInFrames={RHYTHM_DURATION}>
          <RhythmScene data={data} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          timing={sceneTiming}
          presentation={fade()}
        />
        <TransitionSeries.Sequence durationInFrames={PROJECTS_DURATION}>
          <ProjectsScene data={data} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          timing={sceneTiming}
          presentation={fade()}
        />
        <TransitionSeries.Sequence durationInFrames={PERSONA_DURATION}>
          <PersonaScene data={data} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          timing={sceneTiming}
          presentation={fade()}
        />
        <TransitionSeries.Sequence durationInFrames={CLOSING_DURATION}>
          <ClosingScene data={data} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
