import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { UsageInsightsData } from "../data/usage-insights.generated";
import {
  bodyFont,
  DISPLAY_WEIGHT,
  DISPLAY_WEIGHT_MEDIUM,
  displayFont,
  LABEL_WEIGHT,
  labelFont,
  colors,
  type Tone,
  toneStyles,
} from "./config";
import { getVideoCopy } from "./copy";
import { formatActivityTraceEvidence } from "./utils";
import { GlassPanel, SoftChip } from "./primitives";

export const PersonaBubble: React.FC<{ data: UsageInsightsData }> = ({ data }) => {
  const copy = getVideoCopy(data.locale);

  return (
    <GlassPanel
      style={{
        position: "relative",
        padding: "26px 24px 24px",
        height: "100%",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(247, 250, 253, 0.94))",
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
            "radial-gradient(circle at 30% 30%, rgba(13, 148, 136, 0.12), rgba(59, 130, 246, 0.06) 68%, transparent 80%)",
        }}
      />
      <div
        style={{
          fontFamily: labelFont,
          fontSize: 11,
          letterSpacing: "0.18em",
          fontWeight: LABEL_WEIGHT,
          color: colors.muted,
        }}
      >
        {copy.persona.tendency}
      </div>
      <div
        style={{
          marginTop: 16,
          fontFamily: displayFont,
          fontWeight: DISPLAY_WEIGHT,
          fontSize: 40,
          lineHeight: 1,
          maxWidth: 320,
          letterSpacing: "-0.05em",
          color: colors.heading,
        }}
      >
        {data.persona.archetype}
      </div>
      <div
        style={{
          marginTop: 16,
          width: 36,
          height: 2,
          background: colors.heading,
        }}
      />
      <div
        style={{
          marginTop: 14,
          fontFamily: bodyFont,
          fontSize: 16,
          lineHeight: 1.64,
          color: colors.body,
        }}
      >
        {data.persona.worksBestAs}
      </div>
      {data.activityTraces.length > 0 ? (
        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: `1px solid ${colors.faint}`,
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
              color: colors.label,
            }}
          >
            {copy.persona.extraActivity}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {data.activityTraces.map((trace, index) => (
              <SoftChip
                key={trace.label}
                text={`${trace.label} ${formatActivityTraceEvidence(trace, data.locale)}`}
                tone={index === 0 ? "mint" : "sky"}
              />
            ))}
          </div>
          <div
            style={{
              fontFamily: bodyFont,
              fontSize: 14,
              lineHeight: 1.6,
              color: colors.muted,
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
              color: colors.label,
              borderTop: `1px solid ${colors.faint}`,
              paddingTop: 12,
            }}
          >
            {copy.persona.activityFootnote}
          </div>
        </div>
      ) : null}
    </GlassPanel>
  );
};

export const InsightColumn: React.FC<{
  title: string;
  items: readonly string[];
  tone: Tone;
}> = ({ title, items, tone }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTone = toneStyles[tone];

  return (
    <GlassPanel style={{ padding: 20 }}>
      <div
        style={{
          fontFamily: displayFont,
          fontWeight: DISPLAY_WEIGHT_MEDIUM,
          fontSize: 30,
          lineHeight: 1,
          color: colors.heading,
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
                  color: colors.body,
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
