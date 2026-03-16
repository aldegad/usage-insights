import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { VideoProps } from "../config";
import {
  bodyFont,
  CLOSING_DURATION,
  DISPLAY_WEIGHT,
  displayFont,
  LABEL_WEIGHT,
  labelFont,
} from "../config";
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
  const closingFrame = useCurrentFrame();
  const topProjects = data.projects.slice(0, 3);
  const topProjectShare =
    topProjects.reduce((sum, project) => sum + project.tokens, 0) / data.totals.tokens;
  const activeRate = formatPercent(data.period.activeDays / data.period.totalDays);
  const closingSummary = `전체 ${formatCompact(data.totals.tokens)} 토큰을 지나며 가장 뚜렷하게 보인 패턴은, AI를 하나의 도구가 아니라 역할이 다른 팀으로 운영할 때 결과가 가장 안정적으로 나왔다는 점입니다. ${data.providers[0]?.label || "Codex"}는 볼륨과 추진력을, ${data.providers[1]?.label || "Claude"}는 실험과 탐색의 완충 역할을 맡으며 작업을 밀어 올렸습니다.`;
  const closingChars = Math.floor(
    interpolate(closingFrame, [8, 92], [0, closingSummary.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const patternScroll = interpolate(
    closingFrame,
    [90, CLOSING_DURATION - 22],
    [0, 168],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
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
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(246, 251, 255, 0.76))",
            overflow: "hidden",
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
                fontSize: 40,
                lineHeight: 1.08,
                letterSpacing: "-0.04em",
                color: "#171310",
                maxWidth: 620,
              }}
            >
              역할을 나눠 쓸수록
              <br />
              더 선명하게 완주합니다.
            </div>
          </div>
          <div
            style={{
              marginTop: 18,
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
          <div
            style={{
              marginTop: 18,
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: 14,
                transform: `translateY(-${patternScroll}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: labelFont,
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  fontWeight: LABEL_WEIGHT,
                  color: "#837263",
                }}
              >
                읽힌 패턴
              </div>
              <ClosingNote
                label="도구 배치"
                body={`${data.providers[0]?.label || "Codex"} ${formatPercent(
                  data.providers[0]?.share || 0,
                )}, ${data.providers[1]?.label || "Claude"} ${formatPercent(
                  data.providers[1]?.share || 0,
                )}. 한쪽으로 몰아붙이기보다 시기마다 도구의 역할을 나눠 쓰는 방식이 가장 안정적이었습니다.`}
              />
              <ClosingNote
                label="집중 방식"
                body={`${formatNumber(
                  data.totals.deepWorkThreads,
                )}개의 깊은 작업 스레드와 ${formatNumber(
                  data.totals.megaThreads,
                )}개의 50만+ 토큰 기록을 보면, 늘 켜두는 사용보다 필요할 때 길게 몰입하는 작업 리듬이 더 강하게 드러납니다.`}
              />
              <ClosingNote
                label="프로젝트 축"
                body={`상위 3개 프로젝트가 전체 토큰의 ${formatPercent(
                  topProjectShare,
                )}를 차지했습니다. 특히 ${topProjects[0]?.label || "대표 프로젝트"}가 작업 중심축 역할을 하며, 다른 프로젝트들은 그 주변에서 실험과 파생 작업으로 확장됐습니다.`}
              />
            </div>
            <div
              style={{
                position: "absolute",
                inset: "auto 0 0",
                height: 28,
                background:
                  "linear-gradient(180deg, rgba(246,251,255,0), rgba(246,251,255,0.96) 78%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "0 0 auto",
                height: 20,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0))",
                pointerEvents: "none",
              }}
            />
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
                value={`${data.period.activeDays}일 · ${activeRate}`}
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
