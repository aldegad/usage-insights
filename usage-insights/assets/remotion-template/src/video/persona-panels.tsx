import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { UsageInsightsData } from "../data/usage-insights.generated";
import {
  bodyFont,
  DISPLAY_WEIGHT,
  displayFont,
  LABEL_WEIGHT,
  labelFont,
  type Tone,
  toneStyles,
} from "./config";
import { formatActivityTraceEvidence } from "./utils";
import { GlassPanel, SoftChip } from "./primitives";

export const PersonaBubble: React.FC<{ data: UsageInsightsData }> = ({ data }) => (
  <GlassPanel
    style={{
      position: "relative",
      padding: "26px 24px 24px",
      height: "100%",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247, 252, 249, 0.92))",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        position: "absolute",
        width: 180,
        height: 180,
        right: -48,
        top: -64,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 30% 30%, rgba(188, 230, 210, 0.36), rgba(167, 221, 255, 0.12) 68%, transparent 80%)",
      }}
    />
    <div
      style={{
        fontFamily: labelFont,
        fontSize: 11,
        letterSpacing: "0.18em",
        fontWeight: LABEL_WEIGHT,
        color: "#816f60",
      }}
    >
      작업 성향
    </div>
    <div
      style={{
        marginTop: 16,
        fontFamily: displayFont,
        fontWeight: DISPLAY_WEIGHT,
        fontSize: 44,
        lineHeight: 0.94,
        maxWidth: 320,
        letterSpacing: "-0.05em",
        color: "#1f1a16",
      }}
    >
      {data.persona.archetype}
    </div>
    <div
      style={{
        marginTop: 16,
        width: 36,
        height: 2,
        background: "#1f1a16",
      }}
    />
    <div
      style={{
        marginTop: 14,
        fontFamily: bodyFont,
        fontSize: 16,
        lineHeight: 1.64,
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
            fontSize: 10,
            letterSpacing: "0.16em",
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
            fontSize: 14,
            lineHeight: 1.6,
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
            borderTop: "1px solid rgba(93, 80, 61, 0.08)",
            paddingTop: 12,
          }}
        >
          Codex/Claude는 토큰 기준으로, Gemini/Antigravity는 로컬 활동 흔적으로만 반영했습니다.
        </div>
      </div>
    ) : null}
  </GlassPanel>
);

export const InsightColumn: React.FC<{
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
          fontSize: 30,
          lineHeight: 1,
          color: "#1f1a16",
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 12,
          width: 28,
          height: 2,
          background: currentTone.solid,
        }}
      />
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
                  fontSize: 15,
                  lineHeight: 1.68,
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
