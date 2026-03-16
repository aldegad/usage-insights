import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import type { VideoProps } from "../config";
import { OPENING_DURATION, bodyFont, DISPLAY_WEIGHT, displayFont } from "../config";
import { MetricCard, GlassPanel, SoftChip, Stage } from "../primitives";
import { PersonaBubble } from "../persona-panels";
import { formatCompact, formatNumber, formatPercent, useRise } from "../utils";

export const OpeningScene: React.FC<VideoProps> = ({ data }) => {
  const heroRise = useRise(2, 28);
  const activeRate = formatPercent(data.period.activeDays / data.period.totalDays);
  const providerLine = data.providers
    .slice(0, 2)
    .map((provider) => `${provider.label} ${formatPercent(provider.share)}`)
    .join(" · ");
  const openingSummary = `${data.period.from}부터 ${data.period.to}까지의 로컬 기록을 보면, AI를 하나의 비서보다 역할이 다른 팀처럼 운영합니다. 구조와 탐색은 Claude가 받치고, 구현과 실행은 Codex가 밀어 올립니다.`;
  const openingFrame = useCurrentFrame();
  const summaryChars = Math.floor(
    interpolate(openingFrame, [16, 62], [0, openingSummary.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const heroOffset = interpolate(heroRise, [0, 1], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const heroOpacity = interpolate(heroRise, [0, 1], [0.84, 1], {
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
              padding: "20px 22px 18px",
              height: "100%",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255, 251, 247, 0.92))",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                transform: `translateY(${heroOffset}px)`,
                opacity: heroOpacity,
              }}
            >
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 720 }}>
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
              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                <div
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 12,
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
                    fontSize: 44,
                    lineHeight: 1.04,
                    letterSpacing: "-0.045em",
                    color: "#16120f",
                    maxWidth: 760,
                  }}
                >
                  로컬 AI 작업 기록을
                  <br />
                  역할, 리듬, 프로젝트로 읽었습니다.
                </div>
                <div
                  style={{
                    maxWidth: 640,
                    minHeight: 64,
                    maxHeight: 64,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      fontFamily: bodyFont,
                      fontSize: 15,
                      lineHeight: 1.66,
                      color: "#5e5247",
                    }}
                  >
                    {openingSummary.slice(0, summaryChars)}
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: "auto",
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 8,
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
                value={`${data.period.activeDays}/${data.period.totalDays} · ${activeRate}`}
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
                title="스레드 수"
                value={formatNumber(data.totals.threads)}
                tone="butter"
                delay={12}
                size="compact"
              />
            </div>
          </GlassPanel>
        </div>
        <PersonaBubble data={data} />
      </div>
    </Stage>
  );
};
