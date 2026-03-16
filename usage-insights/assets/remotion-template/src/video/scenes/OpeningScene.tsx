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
              padding: "22px 24px 18px",
              height: "100%",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(255, 248, 244, 0.75))",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
