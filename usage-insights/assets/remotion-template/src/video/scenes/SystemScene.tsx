import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import type { VideoProps } from "../config";
import { SYSTEM_DURATION } from "../config";
import { getVideoCopy } from "../copy";
import { Stage } from "../primitives";
import { BarBoard, MonthlyProviderBoard, ProviderSplitCard } from "../metric-panels";

export const SystemScene: React.FC<VideoProps> = ({ data }) => {
  const copy = getVideoCopy(data.locale);
  const frame = useCurrentFrame();
  const recent = data.recentDaily.slice(-7);
  const claudeLead = data.monthlyByProvider.find((item) => item.claudeTokens > item.codexTokens);
  const codexLead = [...data.monthlyByProvider]
    .reverse()
    .find((item) => item.codexTokens > item.claudeTokens);
  const monthlySubtitle =
    claudeLead && codexLead
      ? copy.system.monthlySubtitleDual(claudeLead.label, codexLead.label)
      : copy.system.monthlySubtitleSingle;
  const rightColumnScroll = interpolate(frame, [40, 140], [0, 132], {
    easing: Easing.bezier(0.28, 0.02, 0.18, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Stage
      current="tempo"
      durationInFrames={SYSTEM_DURATION}
      section={copy.system.section}
      locale={data.locale}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.88fr",
          gap: 18,
          height: "100%",
        }}
      >
        <div>
          <MonthlyProviderBoard data={data} subtitle={monthlySubtitle} />
        </div>
        <div
          style={{
            position: "relative",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 18,
              transform: `translateY(-${rightColumnScroll}px)`,
            }}
          >
            <div style={{ height: 336 }}>
              <ProviderSplitCard data={data} />
            </div>
            <div style={{ height: 336 }}>
              <BarBoard
                title={copy.system.recentDailyTitle}
                subtitle={copy.system.recentDailySubtitle}
                items={recent}
                tone="mint"
                maxHeight={118}
                compact
              />
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
};
