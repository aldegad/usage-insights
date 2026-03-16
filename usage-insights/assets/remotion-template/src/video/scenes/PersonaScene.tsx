import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import type { VideoProps } from "../config";
import {
  bodyFont,
  DISPLAY_WEIGHT,
  DISPLAY_WEIGHT_MEDIUM,
  displayFont,
  LABEL_WEIGHT,
  labelFont,
  colors,
  PERSONA_DURATION,
} from "../config";
import { GlassPanel, Stage } from "../primitives";
import { InsightColumn } from "../persona-panels";

export const PersonaScene: React.FC<VideoProps> = ({ data }) => {
  const frame = useCurrentFrame();

  const maxItemsPerCol = Math.max(
    data.habits.length,
    data.strengths.length,
    data.cautions.length,
  );
  // Each item: ~4-5 lines of wrapped Korean text (100px) + 16px gap ≈ 130px
  // Card header (title + divider + margin): ~70px, card padding: 40px
  const estimatedColumnHeight = maxItemsPerCol * 130 + 70 + 40;
  // Visible card area: 720 - 40(stage pad) - 50(masthead) - 40(section hdr) - 180(persona) - 18(gap) ≈ 392px
  const visibleHeight = 380;
  const estimatedOverflow = Math.max(0, estimatedColumnHeight - visibleHeight);
  const scrollY = interpolate(
    frame,
    [60, PERSONA_DURATION - 40],
    [0, estimatedOverflow],
    {
      easing: Easing.bezier(0.22, 0.03, 0.16, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <Stage current="read" durationInFrames={PERSONA_DURATION} section="해석 레이어">
      <div style={{ display: "grid", gap: 18, height: "100%" }}>
        <GlassPanel
          style={{
            padding: "24px 24px 22px",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.97), rgba(245, 250, 255, 0.92))",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 999,
              background: "rgba(13, 148, 136, 0.08)",
              fontFamily: labelFont,
              fontSize: 11,
              letterSpacing: "0.12em",
              fontWeight: LABEL_WEIGHT,
              color: colors.muted,
            }}
          >
            내 해석
          </div>
          <div
            style={{
              marginTop: 18,
              fontFamily: displayFont,
              fontWeight: DISPLAY_WEIGHT,
              fontSize: 48,
              lineHeight: 1.02,
              letterSpacing: "-0.05em",
              color: colors.heading,
            }}
          >
            {data.persona.archetype}
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: bodyFont,
              fontSize: 17,
              lineHeight: 1.58,
              color: colors.body,
              maxWidth: 1040,
            }}
          >
            {data.persona.summary}
          </div>
        </GlassPanel>
        <div
          style={{
            position: "relative",
            minHeight: 0,
            overflow: "hidden",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              transform: `translateY(-${scrollY}px)`,
            }}
          >
            <InsightColumn title="습관" items={data.habits} tone="peach" />
            <InsightColumn title="잘하는 점" items={data.strengths} tone="mint" />
            <InsightColumn title="주의할 점" items={data.cautions} tone="butter" />
          </div>
        </div>
      </div>
    </Stage>
  );
};
