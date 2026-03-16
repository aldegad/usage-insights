import React from "react";
import type { VideoProps } from "../config";
import {
  bodyFont,
  DISPLAY_WEIGHT,
  displayFont,
  LABEL_WEIGHT,
  labelFont,
  PERSONA_DURATION,
} from "../config";
import { GlassPanel, Stage } from "../primitives";
import { InsightColumn } from "../persona-panels";

export const PersonaScene: React.FC<VideoProps> = ({ data }) => (
  <Stage current="read" durationInFrames={PERSONA_DURATION} section="해석 레이어">
    <div style={{ display: "grid", gap: 18, height: "100%" }}>
      <GlassPanel
        style={{
          padding: "24px 24px 22px",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(244, 255, 250, 0.74))",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 999,
            background: "rgba(214, 247, 233, 0.76)",
            fontFamily: labelFont,
            fontSize: 11,
            letterSpacing: "0.12em",
            fontWeight: LABEL_WEIGHT,
            color: "#6b635b",
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
            color: "#171310",
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
            color: "#5c5045",
            maxWidth: 1040,
          }}
        >
          {data.persona.summary}
        </div>
      </GlassPanel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          height: "100%",
        }}
      >
        <InsightColumn title="습관" items={data.habits.slice(0, 2)} tone="peach" />
        <InsightColumn title="잘하는 점" items={data.strengths.slice(0, 2)} tone="mint" />
        <InsightColumn title="주의할 점" items={data.cautions.slice(0, 2)} tone="butter" />
      </div>
    </div>
  </Stage>
);
