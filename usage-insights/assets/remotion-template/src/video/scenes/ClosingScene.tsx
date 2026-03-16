import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { VideoProps } from "../config";
import { CLOSING_DURATION, DISPLAY_WEIGHT, displayFont } from "../config";
import { GlassPanel, MetricCard, SoftChip, Stage } from "../primitives";
import { formatCompact, formatNumber, formatPercent } from "../utils";

export const ClosingScene: React.FC<VideoProps> = ({ data }) => {
  const topProjects = data.projects.slice(0, 3);
  const closingChars = Math.floor(
    interpolate(useCurrentFrame(), [8, 92], [0, data.persona.worksBestAs.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  return (
    <Stage current="read" durationInFrames={CLOSING_DURATION} section="마무리">
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
              <SoftChip
                text={`${formatNumber(data.totals.deepWorkThreads)} 깊은 작업 스레드`}
                tone="peach"
              />
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
