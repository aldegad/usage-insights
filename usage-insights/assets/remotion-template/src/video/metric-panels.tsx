import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { UsageInsightsData } from "../data/usage-insights.generated";
import {
  bodyFont,
  DISPLAY_WEIGHT,
  displayFont,
  type Item,
  LABEL_WEIGHT,
  labelFont,
  type Tone,
  toneStyles,
} from "./config";
import { formatCompact, formatPercent, scaleValue } from "./utils";
import { GlassPanel, SoftChip } from "./primitives";

export const BarBoard: React.FC<{
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

export const MonthlyProviderBoard: React.FC<{
  data: UsageInsightsData;
  subtitle: string;
}> = ({ data, subtitle }) => {
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
                        minHeight: 4,
                        background:
                          "linear-gradient(180deg, rgba(115, 184, 255, 0.96), rgba(188, 223, 255, 0.92))",
                      }}
                    />
                  ) : null}
                  {codexHeight > 0 ? (
                    <div
                      style={{
                        height: codexHeight,
                        minHeight: 4,
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

export const ProviderSplitCard: React.FC<{ data: UsageInsightsData }> = ({ data }) => {
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
    <GlassPanel style={{ padding: 24, height: "100%" }}>
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
