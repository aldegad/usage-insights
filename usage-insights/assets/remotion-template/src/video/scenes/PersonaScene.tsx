import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import type { VideoProps } from "../config";
import {
  bodyFont,
  DISPLAY_WEIGHT,
  displayFont,
  LABEL_WEIGHT,
  labelFont,
  colors,
  PERSONA_DURATION,
} from "../config";
import { getVideoCopy } from "../copy";
import { GlassPanel, Stage } from "../primitives";
import { InsightColumn } from "../persona-panels";

export const PersonaScene: React.FC<VideoProps> = ({ data }) => {
  const copy = getVideoCopy(data.locale);
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
    <Stage
      current="read"
      durationInFrames={PERSONA_DURATION}
      section={copy.persona.section}
      locale={data.locale}
    >
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
            {copy.persona.badge}
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
            <InsightColumn title={copy.persona.habits} items={data.habits} tone="peach" />
            <InsightColumn
              title={copy.persona.strengths}
              items={data.strengths}
              tone="mint"
            />
            <InsightColumn
              title={copy.persona.cautions}
              items={data.cautions}
              tone="butter"
            />
          </div>
        </div>
      </div>
    </Stage>
  );
};
