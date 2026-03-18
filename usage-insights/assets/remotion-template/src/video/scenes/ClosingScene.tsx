import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import type { VideoProps } from "../config";
import {
  bodyFont,
  CLOSING_DURATION,
  DISPLAY_WEIGHT,
  displayFont,
  LABEL_WEIGHT,
  labelFont,
} from "../config";
import { getVideoCopy } from "../copy";
import { GlassPanel, MetricCard, SoftChip, Stage } from "../primitives";
import { formatCompact, formatNumber, formatPercent } from "../utils";

const ClosingNote: React.FC<{
  label: string;
  body: string;
}> = ({ label, body }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "120px 1fr",
      gap: 16,
      paddingTop: 14,
      borderTop: "1px solid rgba(88, 72, 57, 0.08)",
    }}
  >
    <div
      style={{
        fontFamily: labelFont,
        fontSize: 11,
        letterSpacing: "0.14em",
        fontWeight: LABEL_WEIGHT,
        color: "#8a7869",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: bodyFont,
        fontSize: 15,
        lineHeight: 1.62,
        color: "#5b5045",
      }}
    >
      {body}
    </div>
  </div>
);

export const ClosingScene: React.FC<VideoProps> = ({ data }) => {
  const copy = getVideoCopy(data.locale);
  const closingFrame = useCurrentFrame();
  const topProjects = data.projects.slice(0, 3);
  const topProjectShare =
    topProjects.reduce((sum, project) => sum + project.tokens, 0) / data.totals.tokens;
  const activeRate = formatPercent(data.period.activeDays / data.period.totalDays);
  const closingSummary = copy.closing.summary(data, formatCompact(data.totals.tokens));
  const closingChars = Math.floor(
    interpolate(closingFrame, [8, 92], [0, closingSummary.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const leftColumnScroll = interpolate(
    closingFrame,
    [92, 140],
    [0, 144],
    {
      easing: Easing.inOut(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <Stage
      current="read"
      durationInFrames={CLOSING_DURATION}
      section={copy.closing.section}
      locale={data.locale}
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
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(246, 251, 255, 0.76))",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 18,
              transform: `translateY(-${leftColumnScroll}px)`,
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
                <SoftChip
                  text={copy.closing.deepWorkChip(
                    formatNumber(data.totals.deepWorkThreads),
                  )}
                  tone="peach"
                />
              </div>
              <div
                style={{
                  marginTop: 20,
                  fontFamily: displayFont,
                  fontWeight: DISPLAY_WEIGHT,
                  fontSize: 40,
                  lineHeight: 1.08,
                  letterSpacing: "-0.04em",
                  color: "#171310",
                  maxWidth: 620,
                }}
              >
                {copy.closing.headlineLines[0]}
                <br />
                {copy.closing.headlineLines[1]}
              </div>
            </div>
            <div
              style={{
                fontFamily: bodyFont,
                fontSize: 16,
                lineHeight: 1.68,
                color: "#5c5045",
                maxWidth: 760,
                minHeight: 104,
              }}
            >
              {closingSummary.slice(0, closingChars)}
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              <div
                style={{
                  fontFamily: labelFont,
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  fontWeight: LABEL_WEIGHT,
                  color: "#837263",
                }}
              >
                {copy.closing.readPattern}
              </div>
              <ClosingNote
                label={copy.closing.toolPlacement}
                body={copy.closing.toolPlacementBody(data)}
              />
              <ClosingNote
                label={copy.closing.focusMode}
                body={copy.closing.focusModeBody(data)}
              />
              <ClosingNote
                label={copy.closing.projectAxis}
                body={copy.closing.projectAxisBody(
                  formatPercent(topProjectShare),
                  topProjects[0]?.label || copy.closing.leadProjectFallback,
                )}
              />
            </div>
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
              {copy.closing.topProjectsTitle}
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
              {copy.closing.focusMetricsTitle}
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
                title={copy.closing.metricTitles.longestStreak}
                value={`${data.period.longestStreak}d`}
                tone="butter"
                size="compact"
              />
              <MetricCard
                title={copy.closing.metricTitles.activeDays}
                value={copy.closing.activeDaysValue(data.period.activeDays, activeRate)}
                tone="mint"
                delay={4}
                size="compact"
              />
              <MetricCard
                title={copy.closing.metricTitles.projects}
                value={copy.closing.projectsValue(data.projects.length)}
                tone="sky"
                delay={8}
                size="compact"
              />
              <MetricCard
                title={copy.closing.metricTitles.megaThreads}
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
