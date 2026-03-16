import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import type { VideoProps } from "../config";
import { OPENING_DURATION, bodyFont, DISPLAY_WEIGHT, displayFont } from "../config";
import { MetricCard, GlassPanel, SoftChip, Stage } from "../primitives";
import { PersonaBubble } from "../persona-panels";
import { formatCompact, formatNumber, formatPercent, useRise } from "../utils";

export const OpeningScene: React.FC<VideoProps> = ({ data }) => {
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
              padding: "26px 28px 24px",
              height: "100%",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255, 251, 247, 0.92))",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", maxWidth: 720 }}>
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
            <div
              style={{
                marginTop: 16,
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <div style={{ display: "grid", gap: 12 }}>
                <div
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 14,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#8f7d6d",
                  }}
                >
                  Editorial archive of local AI work
                </div>
                <div
                  style={{
                    fontFamily: displayFont,
                    fontWeight: DISPLAY_WEIGHT,
                    fontSize: 56,
                    lineHeight: 0.9,
                    letterSpacing: "-0.05em",
                    color: "#16120f",
                    transform: `translateY(${(1 - titleRise) * 28}px)`,
                    opacity: titleRise,
                  }}
                >
                  로컬 AI 작업 기록을
                  <br />
                  역할, 리듬, 프로젝트로
                  <br />
                  정리했습니다.
                </div>
                <div
                  style={{
                    maxWidth: 640,
                    minHeight: 76,
                    maxHeight: 76,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      fontFamily: bodyFont,
                      fontSize: 16,
                      lineHeight: 1.68,
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
                    gap: 10,
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
