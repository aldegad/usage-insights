import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { VideoProps } from "../config";
import {
  bodyFont,
  DISPLAY_WEIGHT,
  displayFont,
  LABEL_WEIGHT,
  labelFont,
  RHYTHM_DURATION,
  toneStyles,
} from "../config";
import { GlassPanel, SoftChip, Stage } from "../primitives";
import { formatCompact, localizeWeekday, scaleValue } from "../utils";

export const RhythmScene: React.FC<VideoProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxHour = Math.max(1, ...data.hourly.map((item) => item.tokens));
  const topHours = [...data.hourly]
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 3)
    .sort((a, b) => a.label.localeCompare(b.label));
  const topWeekdays = [...data.weekdays].sort((a, b) => b.tokens - a.tokens).slice(0, 3);

  return (
    <Stage current="tempo" durationInFrames={RHYTHM_DURATION} section="시간대 리듬">
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
